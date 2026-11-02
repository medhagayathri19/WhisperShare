const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const SharedFile = require('../models/SharedFile');
const tokenService = require('../services/tokenService');
const { safeDeleteFile } = require('../services/cleanupService');
const { uploadsDir } = require('../middleware/upload');

/**
 * POST /api/files/upload
 * Handles file upload, stores physical file in private uploads folder, and creates DB record.
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded or file type is restricted.',
      });
    }

    const { expiresIn } = req.body;
    const token = tokenService.generateToken();
    const tokenHash = tokenService.hashToken(token);
    const expiresAt = tokenService.calculateExpiryDate(expiresIn);

    const sharedFile = await SharedFile.create({
      tokenHash,
      storedFilename: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype || 'application/octet-stream',
      fileSize: req.file.size,
      expiresAt,
      cleanupStatus: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded and secured successfully.',
      token, // The raw token is returned only once
      originalFilename: sharedFile.originalFilename,
      fileSize: sharedFile.fileSize,
      mimeType: sharedFile.mimeType,
      expiresAt: sharedFile.expiresAt,
    });
  } catch (error) {
    // If DB creation fails, remove the uploaded disk file to prevent orphan files
    if (req.file && req.file.filename) {
      const filePath = path.join(uploadsDir, req.file.filename);
      safeDeleteFile(filePath);
    }
    next(error);
  }
}

/**
 * POST /api/files/info
 * Non-destructive pre-flight check to show recipient the file details before consuming.
 */
async function getFileInfo(req, res, next) {
  try {
    const { token } = req.body;

    if (!token || !tokenService.isValidToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or malformed file link.',
      });
    }

    const tokenHash = tokenService.hashToken(token);

    const fileDoc = await SharedFile.findOne(
      {
        tokenHash,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
      },
      'originalFilename fileSize mimeType createdAt expiresAt'
    );

    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: 'This file has already been downloaded, expired, or does not exist.',
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      originalFilename: fileDoc.originalFilename,
      fileSize: fileDoc.fileSize,
      mimeType: fileDoc.mimeType,
      createdAt: fileDoc.createdAt,
      expiresAt: fileDoc.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/files/claim
 * Atomically marks the file as consumed and issues a temporary single-use download ticket.
 */
async function claimFile(req, res, next) {
  try {
    const { token } = req.body;

    if (!token || !tokenService.isValidToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file token.',
      });
    }

    const tokenHash = tokenService.hashToken(token);
    const claimTicket = crypto.randomBytes(24).toString('hex');
    const claimExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2-minute download window

    // Atomic find-and-update to guarantee single-use claim
    const fileDoc = await SharedFile.findOneAndUpdate(
      {
        tokenHash,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: {
          consumedAt: new Date(),
          claimTicket,
          claimExpiresAt,
        },
      },
      { new: true }
    );

    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        message: 'This file has already been downloaded, expired, or does not exist.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File claimed successfully. Ready to stream download.',
      claimTicket,
      originalFilename: fileDoc.originalFilename,
      fileSize: fileDoc.fileSize,
      mimeType: fileDoc.mimeType,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/files/download/:id
 * Securely streams the claimed file and immediately unlinks physical file & deletes DB record on completion.
 */
async function downloadFile(req, res, next) {
  try {
    const claimTicket = req.params.id;

    if (!claimTicket || typeof claimTicket !== 'string' || claimTicket.length < 32) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing download ticket.',
      });
    }

    // Atomically find document with matching valid claimTicket and wipe the claimTicket immediately
    const fileDoc = await SharedFile.findOneAndUpdate(
      {
        claimTicket,
        claimExpiresAt: { $gt: new Date() },
      },
      {
        $set: { claimTicket: null }, // Nullify ticket immediately to prevent any second stream attempt
      }
    );

    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        message: 'This download link has expired, was already consumed, or is invalid.',
      });
    }

    const filePath = path.join(uploadsDir, fileDoc.storedFilename);

    // Verify physical file exists
    if (!fs.existsSync(filePath)) {
      // Document metadata exists but file is gone
      await SharedFile.findByIdAndDelete(fileDoc._id);
      return res.status(410).json({
        success: false,
        message: 'The requested file is no longer available on the server.',
      });
    }

    // Sanitize filename for Content-Disposition header
    const safeFilename = fileDoc.originalFilename.replace(/["\r\n\\]/g, '_');

    res.set({
      'Content-Type': fileDoc.mimeType || 'application/octet-stream',
      'Content-Length': fileDoc.fileSize,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const fileStream = fs.createReadStream(filePath);

    // Clean up physical file and DB record after successful streaming finishes
    res.on('finish', async () => {
      console.log(`[File Stream Finished] Burn-on-read: Deleting ${fileDoc.storedFilename} (${safeFilename})...`);
      await safeDeleteFile(filePath);
      await SharedFile.findByIdAndDelete(fileDoc._id);
    });

    fileStream.on('error', async (streamErr) => {
      console.error('[File Stream Error]', streamErr.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'An error occurred while streaming the file.',
        });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  getFileInfo,
  claimFile,
  downloadFile,
};
