const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { upload } = require('../middleware/upload');

// Route to upload a file (max 10MB, safe file types)
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Route to check file metadata before recipient triggers download
router.post('/info', fileController.getFileInfo);

// Route to atomically claim file download link
router.post('/claim', fileController.claimFile);

// Route to securely stream and auto-delete file
router.get('/download/:id', fileController.downloadFile);

module.exports = router;
