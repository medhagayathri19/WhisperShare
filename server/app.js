const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const secretRoutes = require('./routes/secretRoutes');
const fileRoutes = require('./routes/fileRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or in allowed list
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid CORS friction
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global Rate Limiter: 300 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', generalLimiter);

// Creation Rate Limiter: 60 creates/uploads per 15 minutes
const creationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Creation rate limit exceeded. Please wait a few minutes before sharing more secrets.',
  },
});
app.use('/api/secrets/create', creationLimiter);
app.use('/api/files/upload', creationLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStates = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  
  res.status(200).json({
    success: true,
    status: 'online',
    appName: 'WhisperShare API',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: mongoStates[stateIndex] || 'Unknown',
      connected: stateIndex === 1,
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Feature Routes
app.use('/api/secrets', secretRoutes);
app.use('/api/files', fileRoutes);

// Serve Frontend client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
