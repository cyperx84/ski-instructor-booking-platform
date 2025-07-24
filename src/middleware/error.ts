import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';
import logger from '@/utils/logger';
import config from '@/config';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found middleware
export const notFoundHandler = (req: Request, res: Response) => {
  const message = `Route ${req.originalUrl} not found`;
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: 'Not found',
    message,
  });
};

// Global error handler
export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let error = 'Internal server error';

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = err.message;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    error = 'Authentication failed';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    error = 'Authentication failed';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    error = 'Validation error';
  }

  // Handle database errors
  if (err.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
    error = 'Conflict';
  }

  if (err.message.includes('foreign key')) {
    statusCode = 400;
    message = 'Referenced resource does not exist';
    error = 'Bad request';
  }

  // Handle cast errors (invalid IDs)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
    error = 'Bad request';
  }

  // Log error details
  const errorLog = {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (statusCode >= 500) {
    logger.error('Server error', errorLog);
  } else {
    logger.warn('Client error', errorLog);
  }

  // Prepare error response
  const response: ApiResponse & { stack?: string } = {
    success: false,
    error,
    message,
  };

  // Include stack trace in development
  if (config.env === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Database connection error handler
export const handleDatabaseError = (err: Error) => {
  logger.error('Database error', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  // Attempt to reconnect or handle gracefully
  // This would typically trigger a reconnection mechanism
  return new AppError('Database connection failed', 503);
};

// Validation error creator
export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400);
};

// Authorization error creator
export const createAuthError = (message: string = 'Authentication required'): AppError => {
  return new AppError(message, 401);
};

// Forbidden error creator
export const createForbiddenError = (message: string = 'Insufficient permissions'): AppError => {
  return new AppError(message, 403);
};

// Not found error creator
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404);
};

// Conflict error creator
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409);
};

// Too many requests error creator
export const createTooManyRequestsError = (message: string = 'Too many requests'): AppError => {
  return new AppError(message, 429);
};

// Service unavailable error creator
export const createServiceUnavailableError = (message: string = 'Service temporarily unavailable'): AppError => {
  return new AppError(message, 503);
};