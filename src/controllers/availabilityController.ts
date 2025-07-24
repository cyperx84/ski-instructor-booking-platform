import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError, asyncHandler } from '@/middleware/error';
import { ApiResponse, Availability, UserRole } from '@/types';
import logger from '@/utils/logger';

// Mock availability database
const mockAvailability: Availability[] = [
  {
    id: 'avail-1',
    instructorId: 'instructor-1',
    date: new Date('2024-01-15'),
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'avail-2',
    instructorId: 'instructor-1',
    date: new Date('2024-01-16'),
    startTime: '10:00',
    endTime: '16:00',
    isAvailable: true,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Create availability
export const createAvailability = asyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user!.userId;
  const {
    date,
    startTime,
    endTime,
    isAvailable,
    isRecurring,
    recurringPattern,
    recurringEndDate,
  } = req.validatedData;

  // Validate time range
  if (startTime >= endTime) {
    throw new AppError('Start time must be before end time', 400);
  }

  // Check for existing availability on the same date
  const existingAvailability = mockAvailability.find(
    avail => avail.instructorId === instructorId && 
    avail.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
  );

  if (existingAvailability) {
    throw new AppError('Availability already exists for this date', 409);
  }

  // Create availability
  const availability: Availability = {
    id: uuidv4(),
    instructorId,
    date: new Date(date),
    startTime,
    endTime,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isRecurring: isRecurring || false,
    recurringPattern,
    recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockAvailability.push(availability);

  logger.info('Availability created', {
    availabilityId: availability.id,
    instructorId,
    date: availability.date,
    startTime,
    endTime,
    isRecurring,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Availability created successfully',
    data: { availability },
  };

  res.status(201).json(response);
});

// Get availability by instructor
export const getAvailabilityByInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const { dateFrom, dateTo } = req.query;

  let filteredAvailability = mockAvailability.filter(
    avail => avail.instructorId === instructorId
  );

  // Apply date filters
  if (dateFrom) {
    filteredAvailability = filteredAvailability.filter(
      avail => avail.date >= new Date(dateFrom as string)
    );
  }

  if (dateTo) {
    filteredAvailability = filteredAvailability.filter(
      avail => avail.date <= new Date(dateTo as string)
    );
  }

  // Sort by date
  filteredAvailability.sort((a, b) => a.date.getTime() - b.date.getTime());

  const response: ApiResponse = {
    success: true,
    message: 'Availability retrieved successfully',
    data: { availability: filteredAvailability },
  };

  res.json(response);
});

// Get availability for current user (instructor)
export const getMyAvailability = asyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user!.userId;
  const { dateFrom, dateTo } = req.query;

  let filteredAvailability = mockAvailability.filter(
    avail => avail.instructorId === instructorId
  );

  // Apply date filters
  if (dateFrom) {
    filteredAvailability = filteredAvailability.filter(
      avail => avail.date >= new Date(dateFrom as string)
    );
  }

  if (dateTo) {
    filteredAvailability = filteredAvailability.filter(
      avail => avail.date <= new Date(dateTo as string)
    );
  }

  // Sort by date
  filteredAvailability.sort((a, b) => a.date.getTime() - b.date.getTime());

  const response: ApiResponse = {
    success: true,
    message: 'Your availability retrieved successfully',
    data: { availability: filteredAvailability },
  };

  res.json(response);
});

// Update availability
export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const instructorId = req.user!.userId;
  const updateData = req.validatedData;

  const availabilityIndex = mockAvailability.findIndex(avail => avail.id === id);
  if (availabilityIndex === -1) {
    throw new AppError('Availability not found', 404);
  }

  const availability = mockAvailability[availabilityIndex];

  // Check authorization
  if (req.user!.role !== UserRole.ADMIN && availability.instructorId !== instructorId) {
    throw new AppError('You can only update your own availability', 403);
  }

  // Validate time range if both times are provided
  const newStartTime = updateData.startTime || availability.startTime;
  const newEndTime = updateData.endTime || availability.endTime;
  
  if (newStartTime >= newEndTime) {
    throw new AppError('Start time must be before end time', 400);
  }

  // Update availability
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      (availability as any)[key] = updateData[key];
    }
  });

  availability.updatedAt = new Date();

  logger.info('Availability updated', {
    availabilityId: availability.id,
    instructorId,
    updatedFields: Object.keys(updateData),
  });

  const response: ApiResponse = {
    success: true,
    message: 'Availability updated successfully',
    data: { availability },
  };

  res.json(response);
});

// Delete availability
export const deleteAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const instructorId = req.user!.userId;

  const availabilityIndex = mockAvailability.findIndex(avail => avail.id === id);
  if (availabilityIndex === -1) {
    throw new AppError('Availability not found', 404);
  }

  const availability = mockAvailability[availabilityIndex];

  // Check authorization
  if (req.user!.role !== UserRole.ADMIN && availability.instructorId !== instructorId) {
    throw new AppError('You can only delete your own availability', 403);
  }

  // Check if there are any bookings for this availability
  // This would be a proper database query in a real implementation
  const hasBookings = false; // Mock check

  if (hasBookings) {
    throw new AppError('Cannot delete availability with existing bookings', 400);
  }

  mockAvailability.splice(availabilityIndex, 1);

  logger.info('Availability deleted', {
    availabilityId: availability.id,
    instructorId,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Availability deleted successfully',
  };

  res.json(response);
});

// Get available time slots for a specific date and instructor
export const getAvailableTimeSlots = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId, date } = req.params;
  const { duration = 60 } = req.query; // Default 60 minutes

  // Find availability for the date
  const availability = mockAvailability.find(
    avail => avail.instructorId === instructorId && 
    avail.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0] &&
    avail.isAvailable
  );

  if (!availability) {
    const response: ApiResponse = {
      success: true,
      message: 'No availability found for this date',
      data: { timeSlots: [] },
    };
    return res.json(response);
  }

  // Generate time slots (mock implementation)
  const timeSlots = [];
  const slotDuration = parseInt(duration as string);
  
  // Convert time strings to minutes
  const startMinutes = parseInt(availability.startTime.split(':')[0]) * 60 + parseInt(availability.startTime.split(':')[1]);
  const endMinutes = parseInt(availability.endTime.split(':')[0]) * 60 + parseInt(availability.endTime.split(':')[1]);

  for (let minutes = startMinutes; minutes + slotDuration <= endMinutes; minutes += slotDuration) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    timeSlots.push({
      startTime: timeString,
      endTime: `${Math.floor((minutes + slotDuration) / 60).toString().padStart(2, '0')}:${((minutes + slotDuration) % 60).toString().padStart(2, '0')}`,
      available: true, // This would check against existing bookings
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Available time slots retrieved successfully',
    data: { timeSlots },
  };

  res.json(response);
});

// Bulk update availability (for recurring patterns)
export const bulkUpdateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user!.userId;
  const { availabilityList } = req.body;

  if (!Array.isArray(availabilityList) || availabilityList.length === 0) {
    throw new AppError('Availability list is required', 400);
  }

  const createdAvailability = [];

  for (const availData of availabilityList) {
    // Validate each availability entry
    const { error } = require('@/utils/validation').availabilitySchema.validate(availData);
    if (error) {
      throw new AppError(`Invalid availability data: ${error.details[0].message}`, 400);
    }

    // Check for existing availability
    const existingAvailability = mockAvailability.find(
      avail => avail.instructorId === instructorId && 
      avail.date.toISOString().split('T')[0] === new Date(availData.date).toISOString().split('T')[0]
    );

    if (!existingAvailability) {
      const availability: Availability = {
        id: uuidv4(),
        instructorId,
        date: new Date(availData.date),
        startTime: availData.startTime,
        endTime: availData.endTime,
        isAvailable: availData.isAvailable !== undefined ? availData.isAvailable : true,
        isRecurring: availData.isRecurring || false,
        recurringPattern: availData.recurringPattern,
        recurringEndDate: availData.recurringEndDate ? new Date(availData.recurringEndDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAvailability.push(availability);
      createdAvailability.push(availability);
    }
  }

  logger.info('Bulk availability created', {
    instructorId,
    createdCount: createdAvailability.length,
    totalRequested: availabilityList.length,
  });

  const response: ApiResponse = {
    success: true,
    message: `Created ${createdAvailability.length} availability entries`,
    data: { 
      created: createdAvailability,
      skipped: availabilityList.length - createdAvailability.length,
    },
  };

  res.json(response);
});