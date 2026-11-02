const mongoose = require('mongoose');

const sharedFileSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
      index: true,
    },
    storedFilename: {
      type: String,
      required: [true, 'Stored filename is required'],
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      // MongoDB TTL Index: automatically removes expired metadata document
      index: { expires: 0 },
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    cleanupStatus: {
      type: String,
      enum: ['pending', 'deleted', 'failed'],
      default: 'pending',
    },
    claimTicket: {
      type: String,
      default: null,
      index: true,
    },
    claimExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const SharedFile = mongoose.model('SharedFile', sharedFileSchema);

module.exports = SharedFile;
