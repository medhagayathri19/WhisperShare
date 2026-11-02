const crypto = require('crypto');

// AES-256-GCM requires a 32-byte (256-bit) key and a 12-byte (96-bit) IV
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes recommended for GCM

/**
 * Returns a 32-byte buffer key derived from the ENCRYPTION_KEY environment variable.
 * Supports 64-character hex strings, 32-character utf8 strings, or derives via SHA-256.
 */
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    console.warn('[Security Warning] ENCRYPTION_KEY is not defined in environment variables. Using derived default for development.');
    return crypto.createHash('sha256').update('whispershare-dev-fallback-key-32b').digest();
  }

  // If provided as 64-hex chars
  if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
    return Buffer.from(envKey, 'hex');
  }

  // If provided as 32-character string
  if (Buffer.byteLength(envKey, 'utf8') === 32) {
    return Buffer.from(envKey, 'utf8');
  }

  // Otherwise, safely derive a 32-byte key via SHA-256
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * @param {string} plainText - The message to encrypt
 * @returns {{ encryptedContent: string, nonce: string, authTag: string }}
 */
function encrypt(plainText) {
  if (typeof plainText !== 'string') {
    throw new Error('Encryption payload must be a string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedContent: encrypted,
    nonce: iv.toString('hex'),
    authTag: authTag,
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using the nonce and authentication tag.
 * @param {string} encryptedHex - Ciphertext in hex
 * @param {string} nonceHex - IV in hex (12 bytes / 24 hex characters)
 * @param {string} authTagHex - Authentication tag in hex (16 bytes / 32 hex characters)
 * @returns {string} Decrypted plaintext string
 */
function decrypt(encryptedHex, nonceHex, authTagHex) {
  const key = getEncryptionKey();
  const iv = Buffer.from(nonceHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
};
