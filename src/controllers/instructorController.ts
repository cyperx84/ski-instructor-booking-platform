import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/error';
import { ApiResponse, LessonType } from '@/types';
import { instructorService } from '@/services';
import logger from '@/utils/logger';
import { CreateInstructorData, InstructorSearchFilters } from '@/models/Instructor';

// Custom Request interface with validation data
interface ValidatedRequest<T = any> extends Request {
  validatedData: T;
}

// Create instructor profile
export const createProfile = asyncHandler(async (req: ValidatedRequest<CreateInstructorData>, res: Response) => {
  const userId = req.user!.userId;

  logger.info('Creating instructor profile', { userId });

  // Ensure the user_id matches the authenticated user
  const profileData = { ...req.validatedData, user_id: userId };

  const profile = await instructorService.createProfile(profileData);

  const response: ApiResponse = {
    success: true,
    message: 'Instructor profile created successfully',
    data: { profile },
  };

  res.status(201).json(response);
});

// Get instructor profile by user ID
export const getProfileByUserId = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId || req.user!.userId;

  logger.info('Fetching instructor profile', { userId });

  const profile = await instructorService.getProfileByUserId(userId);

  const response: ApiResponse = {
    success: true,
    message: 'Instructor profile retrieved successfully',
    data: { profile },
  };

  res.status(200).json(response);
});

// Get instructor with details
export const getInstructorById = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;

  logger.info('Fetching instructor details', { instructorId });

  const instructor = await instructorService.getInstructorWithDetails(instructorId);

  const response: ApiResponse = {
    success: true,
    message: 'Instructor retrieved successfully',
    data: { instructor },
  };

  res.status(200).json(response);
});

// Update instructor profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const userId = req.user!.userId;

  logger.info('Updating instructor profile', { instructorId, userId });

  // TODO: Add authorization check to ensure user owns this instructor profile

  const updatedProfile = await instructorService.updateProfile(instructorId, req.body);

  const response: ApiResponse = {
    success: true,
    message: 'Instructor profile updated successfully',
    data: { profile: updatedProfile },
  };

  res.status(200).json(response);
});

// Search instructors
export const searchInstructors = asyncHandler(async (req: Request, res: Response) => {
  const {
    specialties,
    min_hourly_rate,
    max_hourly_rate,
    min_rating,
    languages,
    equipment_provided,
    max_travel_radius,
    is_verified
  } = req.query;

  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  const filters: InstructorSearchFilters = {};

  if (specialties) {
    filters.specialties = (specialties as string).split(',') as LessonType[];
  }
  if (min_hourly_rate) {
    filters.min_hourly_rate = parseFloat(min_hourly_rate as string);
  }
  if (max_hourly_rate) {
    filters.max_hourly_rate = parseFloat(max_hourly_rate as string);
  }
  if (min_rating) {
    filters.min_rating = parseFloat(min_rating as string);
  }
  if (languages) {
    filters.languages = (languages as string).split(',');
  }
  if (equipment_provided !== undefined) {
    filters.equipment_provided = equipment_provided === 'true';
  }
  if (max_travel_radius) {
    filters.max_travel_radius = parseInt(max_travel_radius as string);
  }
  if (is_verified !== undefined) {
    filters.is_verified = is_verified === 'true';
  }

  logger.info('Searching instructors', { filters, limit, offset });

  const result = await instructorService.searchInstructors(filters, limit, offset);

  const response: ApiResponse = {
    success: true,
    message: 'Instructors retrieved successfully',
    data: result,
  };

  res.status(200).json(response);
});

// Get top-rated instructors
export const getTopRatedInstructors = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  logger.info('Fetching top-rated instructors', { limit });

  const instructors = await instructorService.getTopRatedInstructors(limit);

  const response: ApiResponse = {
    success: true,
    message: 'Top-rated instructors retrieved successfully',
    data: { instructors },
  };

  res.status(200).json(response);
});

// Verify instructor (admin function)
export const verifyInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;

  logger.info('Verifying instructor', { instructorId });

  const result = await instructorService.verifyInstructor(instructorId);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Update instructor rating
export const updateRating = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const { rating } = req.body;

  logger.info('Updating instructor rating', { instructorId, rating });

  const result = await instructorService.updateRating(instructorId, rating);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Get instructor dashboard statistics
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info('Fetching instructor dashboard stats', { userId });

  // First get the instructor profile to get the instructor ID
  const profile = await instructorService.getProfileByUserId(userId);
  const stats = await instructorService.getDashboardStats(profile.id);

  const response: ApiResponse = {
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: { stats },
  };

  res.status(200).json(response);
});

// Get instructor availability summary
export const getAvailabilitySummary = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required',
      data: null,
    });
  }

  logger.info('Fetching availability summary', { instructorId, startDate, endDate });

  const summary = await instructorService.getAvailabilitySummary(
    instructorId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  const response: ApiResponse = {
    success: true,
    message: 'Availability summary retrieved successfully',
    data: { summary },
  };

  res.status(200).json(response);
});

// Find nearby instructors
export const findNearbyInstructors = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius, specialty } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
      data: null,
    });
  }

  logger.info('Finding nearby instructors', { latitude, longitude, radius, specialty, limit });

  const instructors = await instructorService.findNearbyInstructors(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    radius ? parseInt(radius as string) : 50,
    specialty as LessonType,
    limit
  );

  const response: ApiResponse = {
    success: true,
    message: 'Nearby instructors retrieved successfully',
    data: { instructors },
  };

  res.status(200).json(response);
});

// Get instructor performance metrics
export const getPerformanceMetrics = asyncHandler(async (req: Request, res: Response) => {
  const { instructorId } = req.params;

  logger.info('Fetching instructor performance metrics', { instructorId });

  const metrics = await instructorService.getPerformanceMetrics(instructorId);

  const response: ApiResponse = {
    success: true,
    message: 'Performance metrics retrieved successfully',
    data: { metrics },
  };

  res.status(200).json(response);
});

// Bulk update instructor rates (admin function)
export const bulkUpdateRates = asyncHandler(async (req: Request, res: Response) => {
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({
      success: false,
      message: 'Updates must be an array',
      data: null,
    });
  }

  logger.info('Bulk updating instructor rates', { updateCount: updates.length });

  const result = await instructorService.bulkUpdateRates(updates);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: { updatedCount: result.updatedCount },
  };

  res.status(200).json(response);
});

// Legacy method names for backward compatibility
export const getInstructors = searchInstructors;
export const createInstructorProfile = createProfile;
export const updateInstructorProfile = updateProfile;
export const deleteInstructorProfile = asyncHandler(async (req: Request, res: Response) => {
  // This would be implemented if needed
  const response: ApiResponse = {
    success: false,
    message: 'Delete instructor profile not implemented',
    data: null,
  };
  res.status(501).json(response);
});
export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  // This would be implemented if needed
  const response: ApiResponse = {
    success: false,
    message: 'Toggle availability not implemented',
    data: null,
  };
  res.status(501).json(response);
});
export const getInstructorStats = getDashboardStats;