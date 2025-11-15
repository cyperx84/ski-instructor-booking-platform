import { Router } from 'express';
import { BookingModel } from '../models/Booking';
import { AvailabilityModel } from '../models/Availability';
import { InstructorModel } from '../models/Instructor';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CreateBookingRequest, BookingStatus } from '../../../shared/types';

const router = Router();

// Create a booking (authenticated clients)
router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const {
      instructorId,
      availabilitySlotId,
      activity,
      skillLevel,
      specialRequests,
    }: CreateBookingRequest = req.body;

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Validate availability slot
    const slot = await AvailabilityModel.findById(availabilitySlotId);
    if (!slot) {
      throw new AppError('Availability slot not found', 404);
    }

    if (slot.isBooked) {
      throw new AppError('This time slot is already booked', 400);
    }

    if (slot.instructorId !== instructorId) {
      throw new AppError('Slot does not belong to the specified instructor', 400);
    }

    // Get instructor details for pricing
    const instructor = await InstructorModel.findById(instructorId);
    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    // Calculate duration and price
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const totalPrice = durationHours * instructor.hourlyRate;

    // Create booking
    const booking = await BookingModel.create(
      req.user.id,
      instructorId,
      availabilitySlotId,
      activity,
      skillLevel,
      startTime,
      endTime,
      durationHours,
      totalPrice,
      specialRequests
    );

    // Mark slot as booked
    await AvailabilityModel.markAsBooked(availabilitySlotId);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const booking = await BookingModel.findWithDetails(req.params.id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check authorization
    if (
      req.user?.id !== booking.clientId &&
      req.user?.id !== booking.instructor.userId
    ) {
      throw new AppError('Unauthorized to view this booking', 403);
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/user/my-bookings', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const bookings = await BookingModel.findByClient(req.user.id);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

// Get instructor's bookings
router.get('/instructor/:instructorId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const instructor = await InstructorModel.findById(req.params.instructorId);

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    // Check authorization
    if (req.user?.id !== instructor.userId) {
      throw new AppError('Unauthorized to view these bookings', 403);
    }

    const bookings = await BookingModel.findByInstructor(req.params.instructorId);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check authorization
    const instructor = await InstructorModel.findById(booking.instructorId);
    if (
      req.user?.id !== booking.clientId &&
      req.user?.id !== instructor?.userId
    ) {
      throw new AppError('Unauthorized to cancel this booking', 403);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Cannot cancel a completed booking', 400);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Booking is already cancelled', 400);
    }

    // Update booking status
    await BookingModel.updateStatus(req.params.id, BookingStatus.CANCELLED);

    // Free up the availability slot
    await AvailabilityModel.markAsAvailable(booking.availabilitySlotId);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Complete booking
router.patch('/:id/complete', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const instructor = await InstructorModel.findById(booking.instructorId);
    if (req.user?.id !== instructor?.userId) {
      throw new AppError('Only the instructor can mark a booking as complete', 403);
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError('Only confirmed bookings can be completed', 400);
    }

    await BookingModel.updateStatus(req.params.id, BookingStatus.COMPLETED);
    await InstructorModel.incrementLessons(booking.instructorId);

    res.json({
      success: true,
      message: 'Booking marked as complete',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
