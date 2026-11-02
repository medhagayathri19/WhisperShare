const express = require('express');
const router = express.Router();
const secretController = require('../controllers/secretController');

// Route to create a new secret note
router.post('/create', secretController.createSecret);

// Route to check secret status/expiration before recipient confirms burn-on-read
router.post('/info', secretController.getSecretInfo);

// Route to atomically claim, decrypt, and permanently delete secret
router.post('/claim', secretController.claimSecret);

module.exports = router;
