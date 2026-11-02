const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads folder exists and is absolute
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Block explicitly dangerous executable file extensions
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.com', '.vbs', '.msi', '.scr',
  '.jar', '.pif', '.hta', '.cpl', '.msc', '.wsf', '.vb', '.reg',
]);

// 10 MB limit
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10,485,760 bytes

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure 32-hex character unguessable filename preserving extension
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(`Files with extension '${ext}' are restricted for security reasons. Executable files cannot be shared.`),
      false
    );
  }

  // Ensure file has a name
  if (!file.originalname || file.originalname.trim() === '') {
    return cb(new Error('Invalid filename provided.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only 1 file per upload request
  },
  fileFilter,
});

module.exports = {
  upload,
  uploadsDir,
  MAX_FILE_SIZE,
};
