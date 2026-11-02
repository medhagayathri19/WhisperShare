require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initCleanupCron } = require('./services/cleanupService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start background cleanup cron job
    initCleanupCron();

    // Start Express listening on all network interfaces
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`  WhisperShare Backend Service Running on Port ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('\n[WhisperShare] Shutting down gracefully...');
      server.close(() => {
        console.log('[WhisperShare] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[WhisperShare Startup Error]', error);
    process.exit(1);
  }
}

startServer();
