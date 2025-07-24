import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Joi from 'joi';
import { UserRole, SkillLevel, SkiSpecialty, LessonType, BookingStatus, ApiResponse } from '@/types';
import logger from './logger';

// Extended Request interface for validation
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      validatedQuery?: any;
    }
  }
}

// User validation schemas
export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  isActive: Joi.boolean().optional(),
});

// Instructor validation schemas
export const instructorProfileSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  specialties: Joi.array().items(Joi.string().valid(...Object.values(SkiSpecialty))).min(1).required(),
  certifications: Joi.array().items(Joi.string().max(200)).optional(),
  experience: Joi.number().integer().min(0).max(50).required(),
  hourlyRate: Joi.number().positive().max(1000).required(),
  languages: Joi.array().items(Joi.string().max(50)).min(1).required(),
  profileImage: Joi.string().uri().optional(),
  isAvailable: Joi.boolean().optional(),
  preferredLocations: Joi.array().items(Joi.string().max(100)).optional(),
});

// Client validation schemas
export const clientProfileSchema = Joi.object({
  skillLevel: Joi.string().valid(...Object.values(SkillLevel)).required(),
  preferredLanguage: Joi.string().max(50).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    relationship: Joi.string().max(50).required(),
  }).optional(),
  medicalNotes: Joi.string().max(500).optional(),
});

// Booking validation schemas
export const bookingCreationSchema = Joi.object({
  instructorId: Joi.string().uuid().required(),
  lessonType: Joi.string().valid(...Object.values(LessonType)).required(),
  skillLevel: Joi.string().valid(...Object.values(SkillLevel)).required(),
  startTime: Joi.date().iso().greater('now').required(),
  duration: Joi.number().integer().min(30).max(480).required(), // 30 min to 8 hours
  location: Joi.string().min(5).max(200).required(),
  specialRequests: Joi.string().max(500).optional(),
  equipmentNeeded: Joi.boolean().default(false),
  groupSize: Joi.number().integer().min(1).max(10).default(1),
  clientNotes: Joi.string().max(500).optional(),
});

export const bookingUpdateSchema = Joi.object({
  startTime: Joi.date().iso().greater('now').optional(),
  duration: Joi.number().integer().min(30).max(480).optional(),
  location: Joi.string().min(5).max(200).optional(),
  specialRequests: Joi.string().max(500).optional(),
  equipmentNeeded: Joi.boolean().optional(),
  groupSize: Joi.number().integer().min(1).max(10).optional(),
  clientNotes: Joi.string().max(500).optional(),
  instructorNotes: Joi.string().max(500).optional(),
  status: Joi.string().valid(...Object.values(BookingStatus)).optional(),
});

// Availability validation schemas
export const availabilitySchema = Joi.object({
  date: Joi.date().iso().greater('now').required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  isAvailable: Joi.boolean().default(true),
  isRecurring: Joi.boolean().default(false),
  recurringPattern: Joi.string().valid('weekly', 'monthly', 'custom').optional(),
  recurringEndDate: Joi.date().iso().greater(Joi.ref('date')).optional(),
});

// Review validation schemas
export const reviewSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
});

// Search and filter validation schemas
export const searchFiltersSchema = Joi.object({
  skillLevel: Joi.string().valid(...Object.values(SkillLevel)).optional(),
  specialty: Joi.string().valid(...Object.values(SkiSpecialty)).optional(),
  location: Joi.string().max(100).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().greater(Joi.ref('dateFrom')).optional(),
  priceMin: Joi.number().positive().optional(),
  priceMax: Joi.number().positive().greater(Joi.ref('priceMin')).optional(),
  rating: Joi.number().min(1).max(5).optional(),
  language: Joi.string().max(50).optional(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

// UUID validation
export const uuidSchema = Joi.string().uuid().required();

// Middleware for validation with Joi schemas
export const validateRequestWithJoi = (schema: Joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message,
      });
    }
    
    req.validatedData = value;
    next();
  };
};

export const validateParams = (schema: Joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: error.details[0].message,
      });
    }
    
    req.validatedParams = value;
    next();
  };
};

export const validateQuery = (schema: Joi.Schema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        message: error.details[0].message,
      });
    }
    
    req.validatedQuery = value;
    next();
  };
};

// Express-validator middleware for validating requests
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in request', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      ip: req.ip,
    });

    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: 'Request validation failed',
      data: {
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg,
          value: error.type === 'field' ? error.value : undefined,
        })),
      },
    };

    return res.status(400).json(response);
  }

  // Store validated data in req for controllers to use
  const validatedData: any = {};
  const validatedQuery: any = {};

  // Extract validated body data
  if (req.body && Object.keys(req.body).length > 0) {
    Object.assign(validatedData, req.body);
  }

  // Extract validated query data
  if (req.query && Object.keys(req.query).length > 0) {
    Object.assign(validatedQuery, req.query);
  }

  req.validatedData = validatedData;
  req.validatedQuery = validatedQuery;

  next();
};