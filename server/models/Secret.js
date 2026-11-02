const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
      index: true,
    },
    encryptedContent: {
      type: String,
      required: [true, 'Encrypted content is required'],
    },
    nonce: {
      type: String,
      required: [true, 'Nonce/IV is required'],
    },
    authTag: {
      type: String,
      required: [true, 'Auth tag is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      // MongoDB TTL Index: automatically deletes document at expiresAt timestamp
      index: { expires: 0 },
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Secret = mongoose.model('Secret', secretSchema);

module.exports = Secret;
