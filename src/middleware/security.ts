import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import config from '@/config';
import logger from '@/utils/logger';

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: config.security.rateLimitMaxRequests,
  duration: config.security.rateLimitWindowMs / 1000, // Convert to seconds
});

// Strict rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 5, // 5 attempts
  duration: 300, // 5 minutes
});

// General rate limiting middleware
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  rateLimiter
    .consume(clientIp)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        endpoint: req.path,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext,
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000),
      });
    });
};

// Strict rate limiting for authentication endpoints
export const authRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  authRateLimiter
    .consume(clientIp)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        endpoint: req.path,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext,
      });

      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts',
        message: 'Too many login attempts. Please try again later.',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000),
      });
    });
};

// Request size limiter
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Request size exceeded', {
        ip: req.ip,
        contentLength,
        maxSize,
        endpoint: req.path,
      });

      return res.status(413).json({
        success: false,
        error: 'Payload too large',
        message: `Request size exceeds ${maxSize} bytes limit`,
      });
    }

    next();
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );

  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }

    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP not whitelisted', {
        ip: clientIP,
        endpoint: req.path,
        allowedIPs,
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this resource',
      });
    }

    next();
  };
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes
  const sanitizeString = (str: string): string => {
    return str.replace(/\0/g, '');
  };

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
          } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    }
  }

  next();
};

// CORS preflight handler
export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
};