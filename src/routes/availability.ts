import { Router } from 'express';
import Joi from 'joi';
import {
  createAvailability,
  getAvailabilityByInstructor,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailableTimeSlots,
  bulkUpdateAvailability,
} from '@/controllers/availabilityController';
import { authenticateToken, authorizeRole } from '@/middleware/auth';
import { UserRole } from '@/types';
import {
  validateRequestWithJoi,
  validateParams,
  validateQuery,
  availabilitySchema,
  uuidSchema,
} from '@/utils/validation';

const router = Router();

// Get availability by instructor (public)
router.get('/instructor/:instructorId', validateParams(Joi.object({ instructorId: uuidSchema })), getAvailabilityByInstructor);

// Get available time slots for booking (public)
router.get('/instructor/:instructorId/slots/:date', 
  validateParams(Joi.object({ 
    instructorId: uuidSchema, 
    date: Joi.date().iso().required() 
  })),
  getAvailableTimeSlots
);

// Protected routes
router.use(authenticateToken);

// Instructor-only routes
router.post('/', authorizeRole(UserRole.INSTRUCTOR), validateRequestWithJoi(availabilitySchema), createAvailability);

router.get('/my', authorizeRole(UserRole.INSTRUCTOR), getMyAvailability);

router.put('/:id', 
  authorizeRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validateParams(Joi.object({ id: uuidSchema })),
  validateRequestWithJoi(availabilitySchema),
  updateAvailability
);

router.delete('/:id', 
  authorizeRole(UserRole.INSTRUCTOR, UserRole.ADMIN),
  validateParams(Joi.object({ id: uuidSchema })),
  deleteAvailability
);

router.post('/bulk', 
  authorizeRole(UserRole.INSTRUCTOR),
  bulkUpdateAvailability
);

export default router;