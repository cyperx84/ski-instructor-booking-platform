import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config';
import { AuthPayload, UserRole } from '@/types';
import logger from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// JWT authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied',
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { 
      token: token.substring(0, 20) + '...', 
      ip: req.ip 
    });
    
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired',
    });
  }
};

// Role-based authorization middleware
export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

// Resource ownership check middleware
export const authorizeOwnership = (resourceIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User not authenticated',
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.userId;

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user owns the resource
    if (resourceId !== userId) {
      logger.warn('Unauthorized resource access attempt', {
        userId,
        resourceId,
        endpoint: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources',
      });
    }

    next();
  };
};

// Optional authentication middleware (for public endpoints that can benefit from auth)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = decoded;
  } catch (error) {
    // Ignore invalid tokens for optional auth
    logger.debug('Invalid token in optional auth', { token: token.substring(0, 20) + '...' });
  }

  next();
};

// Generate JWT token
export const generateTokens = (payload: AuthPayload) => {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

// Verify refresh token
export const verifyRefreshToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
  } catch (error) {
    return null;
  }
};