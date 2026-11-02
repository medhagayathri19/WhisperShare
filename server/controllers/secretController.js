const Secret = require('../models/Secret');
const encryptionService = require('../services/encryptionService');
const tokenService = require('../services/tokenService');

/**
 * POST /api/secrets/create
 * Creates a new encrypted secret note with an unguessable one-time token.
 */
async function createSecret(req, res, next) {
  try {
    const { message, expiresIn } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A secret message is required.',
      });
    }

    if (message.length > 50000) {
      return res.status(400).json({
        success: false,
        message: 'Secret message exceeds maximum allowed length of 50,000 characters.',
      });
    }

    // Generate secure 32-byte raw token and SHA-256 hash
    const token = tokenService.generateToken();
    const tokenHash = tokenService.hashToken(token);

    // Encrypt the confidential note using AES-256-GCM
    const { encryptedContent, nonce, authTag } = encryptionService.encrypt(message.trim());

    // Calculate expiry timestamp (max 24 hours)
    const expiresAt = tokenService.calculateExpiryDate(expiresIn);

    // Persist only the token hash and encrypted components in MongoDB
    const secret = await Secret.create({
      tokenHash,
      encryptedContent,
      nonce,
      authTag,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Secret created successfully. Save your one-time link!',
      token, // The raw token is returned only once to the creator
      expiresAt: secret.expiresAt,
      createdAt: secret.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/secrets/info
 * Non-destructive pre-flight check to inform recipient the secret is available and awaiting confirmation.
 */
async function getSecretInfo(req, res, next) {
  try {
    const { token } = req.body;

    if (!token || !tokenService.isValidToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid secret link format.',
      });
    }

    const tokenHash = tokenService.hashToken(token);

    const secret = await Secret.findOne(
      {
        tokenHash,
        expiresAt: { $gt: new Date() },
      },
      'createdAt expiresAt'
    );

    if (!secret) {
      return res.status(404).json({
        success: false,
        exists: false,
        message: 'This secret has already been viewed, expired, or never existed.',
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      createdAt: secret.createdAt,
      expiresAt: secret.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/secrets/claim
 * Atomically retrieves, decrypts, and PERMANENTLY DESTROYS the secret from MongoDB.
 */
async function claimSecret(req, res, next) {
  try {
    const { token } = req.body;

    if (!token || !tokenService.isValidToken(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or malformed secret link.',
      });
    }

    const tokenHash = tokenService.hashToken(token);

    // Atomic find-and-delete guarantees only ONE request can ever consume this secret
    const secret = await Secret.findOneAndDelete({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!secret) {
      return res.status(404).json({
        success: false,
        message: 'This secret has already been viewed, expired, or does not exist.',
      });
    }

    // Decrypt content with authenticated AES-256-GCM
    let decryptedMessage;
    try {
      decryptedMessage = encryptionService.decrypt(
        secret.encryptedContent,
        secret.nonce,
        secret.authTag
      );
    } catch (decryptErr) {
      console.error('[Decryption Error] Tag validation failed:', decryptErr.message);
      return res.status(500).json({
        success: false,
        message: 'Security error: Secret integrity verification failed.',
      });
    }

    // Disallow caching on browsers, CDNs, or proxies
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    return res.status(200).json({
      success: true,
      message: decryptedMessage,
      createdAt: secret.createdAt,
      burnedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSecret,
  getSecretInfo,
  claimSecret,
};
