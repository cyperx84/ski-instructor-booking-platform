import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, format } from 'date-fns';
import { AppError, asyncHandler } from '@/middleware/error';
import { ApiResponse, Booking, BookingStatus, LessonType, SkillLevel, UserRole } from '@/types';
import logger from '@/utils/logger';
import config from '@/config';

// Mock booking database
const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    clientId: 'client-1',
    instructorId: 'instructor-1',
    lessonType: LessonType.PRIVATE,
    skillLevel: SkillLevel.INTERMEDIATE,
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T12:00:00Z'),
    duration: 120,
    location: 'Whistler Village',
    status: BookingStatus.CONFIRMED,
    totalAmount: 150,
    commissionAmount: 22.5,
    specialRequests: 'Focus on parallel turns',
    equipmentNeeded: true,
    groupSize: 1,
    clientNotes: 'First time skiing in 2 years',
    instructorNotes: 'Client is nervous but eager to learn',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-10T09:00:00Z'),
  },
];

// Create a new booking
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const clientId = req.user!.userId;
  const {
    instructorId,
    lessonType,
    skillLevel,
    startTime,
    duration,
    location,
    specialRequests,
    equipmentNeeded,
    groupSize,
    clientNotes,
  } = req.validatedData;

  // Calculate end time
  const endTime = addMinutes(new Date(startTime), duration);

  // Check if instructor is available (mock check)
  const conflictingBooking = mockBookings.find(booking => 
    booking.instructorId === instructorId &&
    booking.status !== BookingStatus.CANCELLED_BY_CLIENT &&
    booking.status !== BookingStatus.CANCELLED_BY_INSTRUCTOR &&
    (
      (new Date(startTime) >= booking.startTime && new Date(startTime) < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (new Date(startTime) <= booking.startTime && endTime >= booking.endTime)
    )
  );

  if (conflictingBooking) {
    throw new AppError('Instructor is not available at the requested time', 409);
  }

  // Mock hourly rate - would come from instructor profile
  const hourlyRate = 75;
  const totalAmount = (duration / 60) * hourlyRate;
  const commissionAmount = totalAmount * config.business.instructorCommissionRate;

  // Create booking
  const booking: Booking = {
    id: uuidv4(),
    clientId,
    instructorId,
    lessonType,
    skillLevel,
    startTime: new Date(startTime),
    endTime,
    duration,
    location,
    status: BookingStatus.PENDING,
    totalAmount,
    commissionAmount,
    specialRequests,
    equipmentNeeded,
    groupSize,
    clientNotes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockBookings.push(booking);

  logger.info('Booking created', {
    bookingId: booking.id,
    clientId,
    instructorId,
    startTime: booking.startTime,
    duration,
    totalAmount,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Booking created successfully',
    data: { booking },
  };

  res.status(201).json(response);
});

// Get bookings with filtering
export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const {
    page = 1,
    limit = 10,
    sortBy = 'startTime',
    sortOrder = 'desc',
    status,
    dateFrom,
    dateTo,
  } = req.validatedQuery || {};

  let filteredBookings = [...mockBookings];

  // Filter by user role
  if (userRole === UserRole.CLIENT) {
    filteredBookings = filteredBookings.filter(booking => booking.clientId === userId);
  } else if (userRole === UserRole.INSTRUCTOR) {
    filteredBookings = filteredBookings.filter(booking => booking.instructorId === userId);
  }
  // Admin can see all bookings

  // Apply filters
  if (status) {
    filteredBookings = filteredBookings.filter(booking => booking.status === status);
  }

  if (dateFrom) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.startTime >= new Date(dateFrom)
    );
  }

  if (dateTo) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.startTime <= new Date(dateTo)
    );
  }

  // Apply sorting
  filteredBookings.sort((a, b) => {
    const aValue = a[sortBy as keyof Booking];
    const bValue = b[sortBy as keyof Booking];
    
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const response: ApiResponse = {
    success: true,
    message: 'Bookings retrieved successfully',
    data: { bookings: paginatedBookings },
    meta: {
      page,
      limit,
      total: filteredBookings.length,
      totalPages: Math.ceil(filteredBookings.length / limit),
    },
  };

  res.json(response);
});

// Get booking by ID
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const booking = mockBookings.find(b => b.id === id);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check authorization
  if (userRole !== UserRole.ADMIN && 
      booking.clientId !== userId && 
      booking.instructorId !== userId) {
    throw new AppError('You can only view your own bookings', 403);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Booking retrieved successfully',
    data: { booking },
  };

  res.json(response);
});

// Update booking
export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const updateData = req.validatedData;

  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    throw new AppError('Booking not found', 404);
  }

  const booking = mockBookings[bookingIndex];

  // Check authorization
  if (userRole !== UserRole.ADMIN && 
      booking.clientId !== userId && 
      booking.instructorId !== userId) {
    throw new AppError('You can only update your own bookings', 403);
  }

  // Check if booking can be updated
  if (booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED_BY_CLIENT ||
      booking.status === BookingStatus.CANCELLED_BY_INSTRUCTOR) {
    throw new AppError('Cannot update completed or cancelled bookings', 400);
  }

  // Update booking
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      (booking as any)[key] = updateData[key];
    }
  });

  // Recalculate end time if start time or duration changed
  if (updateData.startTime || updateData.duration) {
    const newStartTime = updateData.startTime ? new Date(updateData.startTime) : booking.startTime;
    const newDuration = updateData.duration || booking.duration;
    booking.endTime = addMinutes(newStartTime, newDuration);
  }

  booking.updatedAt = new Date();

  logger.info('Booking updated', {
    bookingId: booking.id,
    updatedBy: userId,
    updatedFields: Object.keys(updateData),
  });

  const response: ApiResponse = {
    success: true,
    message: 'Booking updated successfully',
    data: { booking },
  };

  res.json(response);
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { reason } = req.body;

  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    throw new AppError('Booking not found', 404);
  }

  const booking = mockBookings[bookingIndex];

  // Check authorization
  if (userRole !== UserRole.ADMIN && 
      booking.clientId !== userId && 
      booking.instructorId !== userId) {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  // Check if booking can be cancelled
  if (booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED_BY_CLIENT ||
      booking.status === BookingStatus.CANCELLED_BY_INSTRUCTOR) {
    throw new AppError('Booking is already completed or cancelled', 400);
  }

  // Check cancellation timeframe
  const hoursUntilStart = (booking.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (hoursUntilStart < config.business.cancellationHours) {
    throw new AppError(`Bookings can only be cancelled at least ${config.business.cancellationHours} hours in advance`, 400);
  }

  // Set cancellation status based on who is cancelling
  if (booking.clientId === userId) {
    booking.status = BookingStatus.CANCELLED_BY_CLIENT;
  } else if (booking.instructorId === userId) {
    booking.status = BookingStatus.CANCELLED_BY_INSTRUCTOR;
  } else {
    booking.status = BookingStatus.CANCELLED_BY_CLIENT; // Admin cancellation
  }

  booking.updatedAt = new Date();

  logger.info('Booking cancelled', {
    bookingId: booking.id,
    cancelledBy: userId,
    reason,
    status: booking.status,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Booking cancelled successfully',
    data: { booking },
  };

  res.json(response);
});

// Confirm booking (instructor only)
export const confirmBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    throw new AppError('Booking not found', 404);
  }

  const booking = mockBookings[bookingIndex];

  // Check authorization
  if (userRole !== UserRole.ADMIN && booking.instructorId !== userId) {
    throw new AppError('Only the assigned instructor can confirm bookings', 403);
  }

  // Check if booking can be confirmed
  if (booking.status !== BookingStatus.PENDING) {
    throw new AppError('Only pending bookings can be confirmed', 400);
  }

  booking.status = BookingStatus.CONFIRMED;
  booking.updatedAt = new Date();

  logger.info('Booking confirmed', {
    bookingId: booking.id,
    instructorId: userId,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Booking confirmed successfully',
    data: { booking },
  };

  res.json(response);
});

// Complete booking (instructor only)
export const completeBooking = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const { instructorNotes } = req.body;

  const bookingIndex = mockBookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    throw new AppError('Booking not found', 404);
  }

  const booking = mockBookings[bookingIndex];

  // Check authorization
  if (userRole !== UserRole.ADMIN && booking.instructorId !== userId) {
    throw new AppError('Only the assigned instructor can complete bookings', 403);
  }

  // Check if booking can be completed
  if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.IN_PROGRESS) {
    throw new AppError('Only confirmed or in-progress bookings can be completed', 400);
  }

  booking.status = BookingStatus.COMPLETED;
  if (instructorNotes) {
    booking.instructorNotes = instructorNotes;
  }
  booking.updatedAt = new Date();

  logger.info('Booking completed', {
    bookingId: booking.id,
    instructorId: userId,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Booking completed successfully',
    data: { booking },
  };

  res.json(response);
});