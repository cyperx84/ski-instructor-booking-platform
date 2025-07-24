import { BaseService } from './BaseService';
import { instructorModel, userModel } from '@/models';
import { InstructorSearchFilters, CreateInstructorData } from '@/models/Instructor';
import { LessonType } from '@/types';
import { AppError } from '@/middleware/error';

export class InstructorService extends BaseService {
  constructor() {
    super('InstructorService');
  }

  /**
   * Create instructor profile
   */
  async createProfile(profileData: CreateInstructorData): Promise<any> {
    try {
      this.log('info', 'Creating instructor profile', { userId: profileData.user_id });

      // Validate required fields
      this.validateRequired(profileData, ['user_id', 'hourly_rate', 'specialties', 'years_experience']);

      // Check if user exists and is an instructor
      const user = await userModel.findById(profileData.user_id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.role !== 'instructor') {
        throw new AppError('User is not an instructor', 400);
      }

      // Check if profile already exists
      const existingProfile = await instructorModel.findByUserId(profileData.user_id);
      if (existingProfile) {
        throw new AppError('Instructor profile already exists', 409);
      }

      // Create instructor profile
      const profile = await instructorModel.createProfile(profileData);

      this.log('info', 'Instructor profile created successfully', { profileId: profile.id });

      return profile;

    } catch (error) {
      this.handleError(error, 'createProfile');
    }
  }

  /**
   * Get instructor profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<any> {
    try {
      this.log('info', 'Fetching instructor profile by user ID', { userId });

      const profile = await instructorModel.findByUserId(userId);
      if (!profile) {
        throw new AppError('Instructor profile not found', 404);
      }

      return profile;

    } catch (error) {
      this.handleError(error, 'getProfileByUserId');
    }
  }

  /**
   * Get instructor with user details
   */
  async getInstructorWithDetails(instructorId: string): Promise<any> {
    try {
      this.log('info', 'Fetching instructor with details', { instructorId });

      const instructor = await instructorModel.getInstructorWithUser(instructorId);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      return instructor;

    } catch (error) {
      this.handleError(error, 'getInstructorWithDetails');
    }
  }

  /**
   * Update instructor profile
   */
  async updateProfile(instructorId: string, updateData: Partial<CreateInstructorData>): Promise<any> {
    try {
      this.log('info', 'Updating instructor profile', { instructorId });

      // Check if instructor exists
      const instructor = await instructorModel.findById(instructorId);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeData(updateData);

      // Update instructor profile
      const updatedProfile = await instructorModel.update(instructorId, sanitizedData);

      this.log('info', 'Instructor profile updated successfully', { instructorId });

      return updatedProfile;

    } catch (error) {
      this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Search instructors with filters
   */
  async searchInstructors(
    filters: InstructorSearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    instructors: any[];
    pagination: any;
  }> {
    try {
      this.log('info', 'Searching instructors', { filters, limit, offset });

      const instructors = await instructorModel.searchInstructors(filters, limit, offset);
      
      // Get total count for pagination
      // Note: This is a simplified count - in production you'd want to mirror the filter logic
      const total = await instructorModel.count();

      const pagination = this.createPaginationInfo(total, limit, offset);

      return {
        instructors,
        pagination
      };

    } catch (error) {
      this.handleError(error, 'searchInstructors');
    }
  }

  /**
   * Get top-rated instructors
   */
  async getTopRatedInstructors(limit: number = 10): Promise<any[]> {
    try {
      this.log('info', 'Fetching top-rated instructors', { limit });

      const instructors = await instructorModel.getTopRatedInstructors(limit);

      return instructors;

    } catch (error) {
      this.handleError(error, 'getTopRatedInstructors');
    }
  }

  /**
   * Verify instructor
   */
  async verifyInstructor(instructorId: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Verifying instructor', { instructorId });

      const success = await instructorModel.verifyInstructor(instructorId);
      if (!success) {
        throw new AppError('Failed to verify instructor', 500);
      }

      this.log('info', 'Instructor verified successfully', { instructorId });

      return { message: 'Instructor verified successfully' };

    } catch (error) {
      this.handleError(error, 'verifyInstructor');
    }
  }

  /**
   * Update instructor rating
   */
  async updateRating(instructorId: string, rating: number): Promise<{ message: string }> {
    try {
      this.log('info', 'Updating instructor rating', { instructorId, rating });

      // Validate rating range
      if (rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      await instructorModel.updateRating(instructorId, rating);

      this.log('info', 'Instructor rating updated successfully', { instructorId, rating });

      return { message: 'Rating updated successfully' };

    } catch (error) {
      this.handleError(error, 'updateRating');
    }
  }

  /**
   * Increment lesson count
   */
  async incrementLessonCount(instructorId: string): Promise<void> {
    try {
      this.log('info', 'Incrementing lesson count', { instructorId });

      await instructorModel.incrementLessonCount(instructorId);

      this.log('info', 'Lesson count incremented successfully', { instructorId });

    } catch (error) {
      this.handleError(error, 'incrementLessonCount');
    }
  }

  /**
   * Update response time
   */
  async updateResponseTime(instructorId: string, responseTimeMinutes: number): Promise<void> {
    try {
      this.log('info', 'Updating response time', { instructorId, responseTimeMinutes });

      await instructorModel.updateResponseTime(instructorId, responseTimeMinutes);

      this.log('info', 'Response time updated successfully', { instructorId });

    } catch (error) {
      this.handleError(error, 'updateResponseTime');
    }
  }

  /**
   * Update acceptance rate
   */
  async updateAcceptanceRate(instructorId: string, accepted: boolean): Promise<void> {
    try {
      this.log('info', 'Updating acceptance rate', { instructorId, accepted });

      await instructorModel.updateAcceptanceRate(instructorId, accepted);

      this.log('info', 'Acceptance rate updated successfully', { instructorId });

    } catch (error) {
      this.handleError(error, 'updateAcceptanceRate');
    }
  }

  /**
   * Get instructor availability summary
   */
  async getAvailabilitySummary(
    instructorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      this.log('info', 'Fetching availability summary', { instructorId, startDate, endDate });

      const summary = await instructorModel.getAvailabilitySummary(instructorId, startDate, endDate);

      return summary;

    } catch (error) {
      this.handleError(error, 'getAvailabilitySummary');
    }
  }

  /**
   * Get instructor dashboard statistics
   */
  async getDashboardStats(instructorId: string): Promise<any> {
    try {
      this.log('info', 'Fetching instructor dashboard stats', { instructorId });

      const stats = await instructorModel.getDashboardStats(instructorId);

      return stats;

    } catch (error) {
      this.handleError(error, 'getDashboardStats');
    }
  }

  /**
   * Find nearby instructors (simplified version)
   */
  async findNearbyInstructors(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    specialty?: LessonType,
    limit: number = 20
  ): Promise<any[]> {
    try {
      this.log('info', 'Finding nearby instructors', { latitude, longitude, radiusKm, specialty, limit });

      // For MVP, we'll return all instructors and filter by travel radius
      // In production, you'd use PostGIS or similar for geospatial queries
      const filters: InstructorSearchFilters = {
        max_travel_radius: radiusKm
      };

      if (specialty) {
        filters.specialties = [specialty];
      }

      const result = await this.searchInstructors(filters, limit, 0);

      return result.instructors;

    } catch (error) {
      this.handleError(error, 'findNearbyInstructors');
    }
  }

  /**
   * Get instructor performance metrics
   */
  async getPerformanceMetrics(instructorId: string): Promise<any> {
    try {
      this.log('info', 'Fetching instructor performance metrics', { instructorId });

      const instructor = await instructorModel.findById(instructorId);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      const metrics = {
        rating_average: instructor.rating_average,
        total_ratings: instructor.total_ratings,
        total_lessons: instructor.total_lessons,
        response_time_minutes: instructor.response_time_minutes,
        acceptance_rate: instructor.acceptance_rate,
        is_verified: instructor.is_verified,
        years_experience: instructor.years_experience,
        specialties: instructor.specialties,
        languages: instructor.languages
      };

      return metrics;

    } catch (error) {
      this.handleError(error, 'getPerformanceMetrics');
    }
  }

  /**
   * Bulk update instructor rates (admin function)
   */
  async bulkUpdateRates(
    updates: Array<{ instructorId: string; hourlyRate: number }>
  ): Promise<{ message: string; updatedCount: number }> {
    try {
      this.log('info', 'Bulk updating instructor rates', { updateCount: updates.length });

      let updatedCount = 0;

      for (const update of updates) {
        try {
          await instructorModel.update(update.instructorId, { hourly_rate: update.hourlyRate });
          updatedCount++;
        } catch (error) {
          this.log('warn', 'Failed to update instructor rate', { 
            instructorId: update.instructorId, 
            error: error.message 
          });
        }
      }

      this.log('info', 'Bulk rate update completed', { updatedCount, totalAttempted: updates.length });

      return {
        message: `Successfully updated rates for ${updatedCount} instructors`,
        updatedCount
      };

    } catch (error) {
      this.handleError(error, 'bulkUpdateRates');
    }
  }
}