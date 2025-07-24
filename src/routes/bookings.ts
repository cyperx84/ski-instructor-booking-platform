import { Router } from 'express';
import Joi from 'joi';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
} from '@/controllers/bookingController';
import { authenticateToken, authorizeRole } from '@/middleware/auth';
import { UserRole } from '@/types';
import {
  validateRequestWithJoi,
  validateParams,
  validateQuery,
  bookingCreationSchema,
  bookingUpdateSchema,
  paginationSchema,
  uuidSchema,
} from '@/utils/validation';

const router = Router();

// All booking routes require authentication
router.use(authenticateToken);

// Create booking (clients only)
router.post('/', authorizeRole(UserRole.CLIENT), validateRequestWithJoi(bookingCreationSchema), createBooking);

// Get bookings (filtered by user role)
router.get('/', validateQuery(paginationSchema), getBookings);

// Get booking by ID
router.get('/:id', validateParams(Joi.object({ id: uuidSchema })), getBookingById);

// Update booking
router.put('/:id', validateParams(Joi.object({ id: uuidSchema })), validateRequestWithJoi(bookingUpdateSchema), updateBooking);

// Cancel booking
router.patch('/:id/cancel', validateParams(Joi.object({ id: uuidSchema })), cancelBooking);

// Confirm booking (instructors only)
router.patch('/:id/confirm', validateParams(Joi.object({ id: uuidSchema })), authorizeRole(UserRole.INSTRUCTOR, UserRole.ADMIN), confirmBooking);

// Complete booking (instructors only)
router.patch('/:id/complete', validateParams(Joi.object({ id: uuidSchema })), authorizeRole(UserRole.INSTRUCTOR, UserRole.ADMIN), completeBooking);

export default router;