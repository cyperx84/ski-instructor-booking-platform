import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createWriteStream } from 'fs';
import { join } from 'path';

import config from '@/config';
import logger, { requestLogger } from '@/utils/logger';
import { initDatabase } from '@/config/database';

// Middleware
import { 
  rateLimitMiddleware, 
  securityHeaders, 
  sanitizeRequest, 
  corsHandler,
  requestSizeLimit
} from '@/middleware/security';
import { 
  globalErrorHandler, 
  notFoundHandler, 
  AppError 
} from '@/middleware/error';

// Routes
import authRoutes from '@/routes/auth';
import instructorRoutes from '@/routes/instructors';
import instructorManagementRoutes from '@/routes/instructorManagement';
import bookingRoutes from '@/routes/bookings';
import availabilityRoutes from '@/routes/availability';
import paymentRoutes from '@/routes/payments';
import healthRoutes from '@/routes/health';

// Create Express app
const app = express();

// Trust proxy (for proper IP detection behind reverse proxies)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
}));

// Handle preflight requests
app.use(corsHandler);

// Compression middleware
app.use(compression());

// Request size limit
app.use(requestSizeLimit(10 * 1024 * 1024)); // 10MB limit

// Security headers
app.use(securityHeaders);

// Request sanitization
app.use(sanitizeRequest);

// Rate limiting
app.use(rateLimitMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.env === 'production') {
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  const logsDir = 'logs';
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // HTTP request logging to file
  app.use(morgan('combined', {
    stream: createWriteStream(join(logsDir, 'access.log'), { flags: 'a' })
  }));
} else {
  // Console logging for development
  app.use(morgan('dev'));
}

// Custom request logger
app.use(requestLogger);

// API routes
const apiRouter = express.Router();

// Health check routes (no API versioning for health checks)
app.use('/health', healthRoutes);

// API versioning
app.use(`/api/${config.apiVersion}`, apiRouter);

// Mount API routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/instructors', instructorRoutes);
apiRouter.use('/instructor-management', instructorManagementRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/availability', availabilityRoutes);
apiRouter.use('/payments', paymentRoutes);

// API documentation endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ski Instructor Booking API',
    data: {
      version: config.apiVersion,
      environment: config.env,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth',
        instructors: '/instructors',
        'instructor-management': '/instructor-management',
        bookings: '/bookings',
        availability: '/availability',
        payments: '/payments',
      },
      documentation: {
        swagger: '/docs',
        postman: '/postman',
      },
    },
  });
});

// Catch unhandled routes
app.use('*', notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Initialize database and start server
export const initializeApp = async (): Promise<void> => {
  try {
    await initDatabase();
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  // Close database connections
  // This would be handled by database.ts cleanup
  
  // Close server
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;