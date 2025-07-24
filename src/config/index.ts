import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

interface SecurityConfig {
  bcryptSaltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

interface CORSConfig {
  origin: string[];
  methods: string[];
  credentials: boolean;
}

interface LoggingConfig {
  level: string;
  format: string;
}

interface FileUploadConfig {
  maxFileSize: number;
  uploadDir: string;
  allowedFileTypes: string[];
}

interface BusinessConfig {
  defaultLessonDuration: number;
  bookingAdvanceDays: number;
  cancellationHours: number;
  instructorCommissionRate: number;
}

interface Config {
  env: string;
  port: number;
  host: string;
  apiVersion: string;
  database: DatabaseConfig;
  jwt: JWTConfig;
  security: SecurityConfig;
  cors: CORSConfig;
  logging: LoggingConfig;
  fileUpload: FileUploadConfig;
  business: BusinessConfig;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ski_instructor_booking',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: process.env.CORS_METHODS?.split(',') || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },

  business: {
    defaultLessonDuration: parseInt(process.env.DEFAULT_LESSON_DURATION || '60', 10),
    bookingAdvanceDays: parseInt(process.env.BOOKING_ADVANCE_DAYS || '90', 10),
    cancellationHours: parseInt(process.env.CANCELLATION_HOURS || '24', 10),
    instructorCommissionRate: parseFloat(process.env.INSTRUCTOR_COMMISSION_RATE || '0.15'),
  },
};

// Validate critical configuration
if (!config.jwt.secret || config.jwt.secret === 'fallback-secret-key-change-in-production') {
  if (config.env === 'production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  console.warn('Warning: Using fallback JWT secret. Set JWT_SECRET in production.');
}

export default config;