const crypto = require('crypto');

/**
 * Generates an unguessable 256-bit cryptographically secure random token (64 hex characters).
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes a SHA-256 hash of the input token.
 * Only the hash is stored in the database to prevent token leakage from DB dumps.
 * @param {string} token - The raw secret token
 * @returns {string} SHA-256 hex digest
 */
function hashToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Validates whether the token meets security format criteria (64-character hex string).
 * @param {string} token
 * @returns {boolean}
 */
function isValidToken(token) {
  return typeof token === 'string' && /^[0-9a-fA-F]{64}$/.test(token.trim());
}

/**
 * Calculates the future expiration Date based on user selection.
 * Restricts max lifetime to 24 hours (1440 minutes).
 * Supported: '10m', '1h', '24h', or numeric minutes.
 * Default is 1 hour (60 minutes).
 * @param {string|number} expiresIn
 * @returns {Date}
 */
function calculateExpiryDate(expiresIn) {
  const now = Date.now();
  let minutes = 60; // default 1 hour

  if (typeof expiresIn === 'number' && !isNaN(expiresIn)) {
    minutes = expiresIn;
  } else if (typeof expiresIn === 'string') {
    const formatted = expiresIn.trim().toLowerCase();
    if (formatted === '10m' || formatted === '10') {
      minutes = 10;
    } else if (formatted === '1h' || formatted === '60') {
      minutes = 60;
    } else if (formatted === '24h' || formatted === '1440') {
      minutes = 1440;
    } else {
      const parsed = parseInt(formatted, 10);
      if (!isNaN(parsed) && parsed > 0) {
        minutes = parsed;
      }
    }
  }

  // Enforce minimum 1 minute, maximum 24 hours (1440 minutes)
  minutes = Math.max(1, Math.min(minutes, 1440));

  return new Date(now + minutes * 60 * 1000);
}

module.exports = {
  generateToken,
  hashToken,
  isValidToken,
  calculateExpiryDate,
};
