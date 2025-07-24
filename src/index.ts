import app, { initializeApp } from '@/app';
import config from '@/config';
import logger from '@/utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Initialize application (database, etc.)
    await initializeApp();

    // Start the server
    const server = app.listen(config.port, config.host, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        host: config.host,
        environment: config.env,
        nodeVersion: process.version,
        processId: process.pid,
        url: `http://${config.host}:${config.port}`,
        apiUrl: `http://${config.host}:${config.port}/api/${config.apiVersion}`,
        healthUrl: `http://${config.host}:${config.port}/health`,
      });
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? `Pipe ${config.port}` : `Port ${config.port}`;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.warn('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  logger.error('Unhandled error during server startup', error);
  process.exit(1);
});