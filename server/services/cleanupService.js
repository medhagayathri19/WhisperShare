const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const SharedFile = require('../models/SharedFile');
const { uploadsDir } = require('../middleware/upload');

/**
 * Safely unlinks a file from disk with error catching.
 * @param {string} filePath
 * @returns {Promise<boolean>} true if deleted or didn't exist, false if deletion failed
 */
async function safeDeleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`[File Cleanup] Safely deleted physical file: ${path.basename(filePath)}`);
    }
    return true;
  } catch (err) {
    console.error(`[File Cleanup Error] Could not delete ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Performs cleanup of expired and consumed files:
 * 1. Finds SharedFile documents that have expired or failed previous deletion.
 * 2. Unlinks physical files from uploads directory.
 * 3. Scans uploads folder for orphaned files older than 1 hour not present in DB.
 */
async function cleanupExpiredFiles() {
  console.log('[Cleanup Job] Running scheduled file cleanup cycle...');
  const now = new Date();

  try {
    // 1. Find expired or failed deletion files in DB
    const expiredOrConsumedFiles = await SharedFile.find({
      $or: [
        { expiresAt: { $lte: now } },
        { cleanupStatus: 'failed' },
        { consumedAt: { $ne: null } },
      ],
    });

    for (const fileDoc of expiredOrConsumedFiles) {
      const filePath = path.join(uploadsDir, fileDoc.storedFilename);
      const isDeleted = await safeDeleteFile(filePath);

      if (isDeleted) {
        // Document can now be permanently removed from MongoDB
        await SharedFile.findByIdAndDelete(fileDoc._id);
      } else {
        // Flag for retry in subsequent cycle
        fileDoc.cleanupStatus = 'failed';
        await fileDoc.save();
      }
    }

    // 2. Scan physical uploads directory for orphaned files not in MongoDB
    if (fs.existsSync(uploadsDir)) {
      const filesOnDisk = await fs.promises.readdir(uploadsDir);
      
      for (const diskFile of filesOnDisk) {
        if (diskFile === '.gitkeep') continue;

        const filePath = path.join(uploadsDir, diskFile);
        try {
          const stats = await fs.promises.stat(filePath);
          // Only check files older than 15 minutes (to avoid deleting files in the middle of active upload)
          const fileAgeMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);

          if (fileAgeMinutes > 15) {
            const activeRecord = await SharedFile.findOne({ storedFilename: diskFile });
            if (!activeRecord) {
              console.log(`[Cleanup Job] Found orphaned file on disk (${diskFile}, age: ${Math.round(fileAgeMinutes)}m). Removing...`);
              await safeDeleteFile(filePath);
            }
          }
        } catch (err) {
          console.warn(`[Cleanup Job] Error checking disk file ${diskFile}:`, err.message);
        }
      }
    }

    console.log('[Cleanup Job] Cleanup cycle complete.');
  } catch (error) {
    console.error('[Cleanup Job Error] Encountered error during file cleanup:', error.message);
  }
}

/**
 * Initializes node-cron scheduled task running every hour: '0 * * * *'.
 * Also runs an initial cleanup sweep at startup.
 */
function initCleanupCron() {
  console.log('[Cleanup Cron] Initializing scheduled hourly file cleanup job (0 * * * *)...');
  
  // Run on startup after a 10-second delay so server boots smoothly
  setTimeout(() => {
    cleanupExpiredFiles();
  }, 10000);

  // Scheduled to run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    cleanupExpiredFiles();
  });
}

module.exports = {
  initCleanupCron,
  cleanupExpiredFiles,
  safeDeleteFile,
};
