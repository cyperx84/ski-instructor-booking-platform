import { BaseModel } from './BaseModel';
import { LessonType, SkillLevel } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface InstructorProfileData {
  id?: string;
  user_id: string;
  bio?: string;
  specialties?: LessonType[];
  years_experience?: number;
  languages?: string[];
  hourly_rate: number;
  minimum_booking_hours?: number;
  maximum_booking_hours?: number;
  advance_booking_days?: number;
  cancellation_policy?: string;
  equipment_provided?: boolean;
  travel_radius_km?: number;
  is_verified?: boolean;
  verification_date?: Date;
  rating_average?: number;
  total_ratings?: number;
  total_lessons?: number;
  response_time_minutes?: number;
  acceptance_rate?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateInstructorData {
  user_id: string;
  bio?: string;
  specialties: LessonType[];
  years_experience: number;
  languages?: string[];
  hourly_rate: number;
  minimum_booking_hours?: number;
  maximum_booking_hours?: number;
  advance_booking_days?: number;
  cancellation_policy?: string;
  equipment_provided?: boolean;
  travel_radius_km?: number;
}

export interface InstructorSearchFilters {
  specialties?: LessonType[];
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  min_rating?: number;
  languages?: string[];
  equipment_provided?: boolean;
  max_travel_radius?: number;
  is_verified?: boolean;
}

export class Instructor extends BaseModel {
  constructor() {
    super('instructor_profiles');
  }

  /**
   * Create instructor profile
   */
  async createProfile(profileData: CreateInstructorData): Promise<InstructorProfileData> {
    const instructorRecord = {
      id: uuidv4(),
      user_id: profileData.user_id,
      bio: profileData.bio,
      specialties: profileData.specialties || ['both'],
      years_experience: profileData.years_experience || 0,
      languages: profileData.languages || ['English'],
      hourly_rate: profileData.hourly_rate,
      minimum_booking_hours: profileData.minimum_booking_hours || 1,
      maximum_booking_hours: profileData.maximum_booking_hours || 8,
      advance_booking_days: profileData.advance_booking_days || 7,
      cancellation_policy: profileData.cancellation_policy,
      equipment_provided: profileData.equipment_provided || false,
      travel_radius_km: profileData.travel_radius_km || 50,
      is_verified: false,
      rating_average: 0.00,
      total_ratings: 0,
      total_lessons: 0,
      response_time_minutes: 60,
      acceptance_rate: 100.00
    };

    return await this.create(instructorRecord);
  }

  /**
   * Find instructor profile by user ID
   */
  async findByUserId(userId: string): Promise<InstructorProfileData | null> {
    const result = await this.query(
      'SELECT * FROM instructor_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get instructor with user details
   */
  async getInstructorWithUser(instructorId: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        ip.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.avatar_url,
        u.is_active,
        u.created_at as user_created_at
      FROM instructor_profiles ip
      JOIN users u ON ip.user_id = u.id
      WHERE ip.id = $1 AND u.is_active = true
    `, [instructorId]);

    return result.rows[0] || null;
  }

  /**
   * Search instructors with filters
   */
  async searchInstructors(
    filters: InstructorSearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    let query = `
      SELECT 
        ip.*,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.phone
      FROM instructor_profiles ip
      JOIN users u ON ip.user_id = u.id
      WHERE u.is_active = true
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (filters.specialties && filters.specialties.length > 0) {
      query += ` AND ip.specialties && $${++paramCount}`;
      params.push(filters.specialties);
    }

    if (filters.min_hourly_rate !== undefined) {
      query += ` AND ip.hourly_rate >= $${++paramCount}`;
      params.push(filters.min_hourly_rate);
    }

    if (filters.max_hourly_rate !== undefined) {
      query += ` AND ip.hourly_rate <= $${++paramCount}`;
      params.push(filters.max_hourly_rate);
    }

    if (filters.min_rating !== undefined) {
      query += ` AND ip.rating_average >= $${++paramCount}`;
      params.push(filters.min_rating);
    }

    if (filters.languages && filters.languages.length > 0) {
      query += ` AND ip.languages && $${++paramCount}`;
      params.push(filters.languages);
    }

    if (filters.equipment_provided !== undefined) {
      query += ` AND ip.equipment_provided = $${++paramCount}`;
      params.push(filters.equipment_provided);
    }

    if (filters.max_travel_radius !== undefined) {
      query += ` AND ip.travel_radius_km >= $${++paramCount}`;
      params.push(filters.max_travel_radius);
    }

    if (filters.is_verified !== undefined) {
      query += ` AND ip.is_verified = $${++paramCount}`;
      params.push(filters.is_verified);
    }

    query += `
      ORDER BY ip.rating_average DESC, ip.total_ratings DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Update instructor rating after a completed lesson
   */
  async updateRating(instructorId: string, newRating: number): Promise<void> {
    await this.transaction(async (client) => {
      // Get current rating data
      const current = await client.query(
        'SELECT rating_average, total_ratings FROM instructor_profiles WHERE id = $1',
        [instructorId]
      );

      const { rating_average, total_ratings } = current.rows[0];
      
      // Calculate new average
      const newTotalRatings = total_ratings + 1;
      const newAverage = ((rating_average * total_ratings) + newRating) / newTotalRatings;

      // Update the instructor profile
      await client.query(`
        UPDATE instructor_profiles 
        SET 
          rating_average = $1,
          total_ratings = $2,
          updated_at = NOW()
        WHERE id = $3
      `, [Number(newAverage.toFixed(2)), newTotalRatings, instructorId]);
    });
  }

  /**
   * Increment lesson count after completion
   */
  async incrementLessonCount(instructorId: string): Promise<void> {
    await this.query(
      'UPDATE instructor_profiles SET total_lessons = total_lessons + 1, updated_at = NOW() WHERE id = $1',
      [instructorId]
    );
  }

  /**
   * Update response time metrics
   */
  async updateResponseTime(instructorId: string, responseTimeMinutes: number): Promise<void> {
    await this.query(`
      UPDATE instructor_profiles 
      SET 
        response_time_minutes = ROUND((response_time_minutes + $1) / 2),
        updated_at = NOW()
      WHERE id = $2
    `, [responseTimeMinutes, instructorId]);
  }

  /**
   * Update acceptance rate
   */
  async updateAcceptanceRate(instructorId: string, accepted: boolean): Promise<void> {
    await this.transaction(async (client) => {
      // This would need to track booking requests vs acceptances
      // For now, we'll implement a simple version
      const current = await client.query(
        'SELECT acceptance_rate FROM instructor_profiles WHERE id = $1',
        [instructorId]
      );

      const currentRate = current.rows[0].acceptance_rate;
      // Simple moving average - in production you'd want more sophisticated tracking
      const newRate = accepted ? 
        Math.min(100, currentRate + 1) : 
        Math.max(0, currentRate - 5);

      await client.query(
        'UPDATE instructor_profiles SET acceptance_rate = $1, updated_at = NOW() WHERE id = $2',
        [newRate, instructorId]
      );
    });
  }

  /**
   * Verify instructor
   */
  async verifyInstructor(instructorId: string): Promise<boolean> {
    const result = await this.update(instructorId, {
      is_verified: true,
      verification_date: new Date()
    });
    return !!result;
  }

  /**
   * Get top-rated instructors
   */
  async getTopRatedInstructors(limit: number = 10): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        ip.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM instructor_profiles ip
      JOIN users u ON ip.user_id = u.id
      WHERE u.is_active = true AND ip.total_ratings > 0
      ORDER BY ip.rating_average DESC, ip.total_ratings DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  /**
   * Get instructor availability summary
   */
  async getAvailabilitySummary(instructorId: string, startDate: Date, endDate: Date): Promise<any> {
    const result = await this.query(`
      SELECT 
        COUNT(*) as total_slots,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_slots,
        COUNT(CASE WHEN status = 'busy' THEN 1 END) as busy_slots
      FROM instructor_availability 
      WHERE instructor_id = $1 
      AND date BETWEEN $2 AND $3
    `, [instructorId, startDate, endDate]);

    return result.rows[0];
  }

  /**
   * Get instructor dashboard stats
   */
  async getDashboardStats(instructorId: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        ip.rating_average,
        ip.total_ratings,
        ip.total_lessons,
        ip.response_time_minutes,
        ip.acceptance_rate,
        COALESCE(recent_bookings.count, 0) as recent_bookings,
        COALESCE(monthly_earnings.total, 0) as monthly_earnings
      FROM instructor_profiles ip
      LEFT JOIN (
        SELECT instructor_id, COUNT(*) as count
        FROM bookings 
        WHERE instructor_id = $1 
        AND created_at >= NOW() - INTERVAL '30 days'
      ) recent_bookings ON ip.id = recent_bookings.instructor_id
      LEFT JOIN (
        SELECT 
          b.instructor_id,
          SUM(t.instructor_amount) as total
        FROM bookings b
        JOIN transactions t ON b.id = t.booking_id
        WHERE b.instructor_id = $1
        AND t.status = 'paid'
        AND b.created_at >= DATE_TRUNC('month', NOW())
      ) monthly_earnings ON ip.id = monthly_earnings.instructor_id
      WHERE ip.id = $1
    `, [instructorId]);

    return result.rows[0];
  }
}