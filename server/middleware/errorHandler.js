const multer = require('multer');

/**
 * Global 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global Error Handler Middleware
 */
function errorHandler(err, req, res, next) {
  // Multer Error Handling
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 10 MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field in upload request.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  // Handle custom validation or fileFilter errors
  if (err.message && err.message.includes('restricted for security reasons')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided.',
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: `Validation error: ${messages.join(', ')}`,
    });
  }

  // Generic server error
  console.error(`[Server Error] ${err.stack || err.message}`);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred. Please try again.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
