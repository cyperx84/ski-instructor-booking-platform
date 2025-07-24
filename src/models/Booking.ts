import { BaseModel } from './BaseModel';
import { LessonType, SkillLevel, BookingStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface BookingData {
  id?: string;
  client_id: string;
  instructor_id: string;
  resort_id: string;
  lesson_type: LessonType;
  skill_level: SkillLevel;
  lesson_date: Date;
  start_time: string;
  end_time: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  status?: BookingStatus;
  special_requests?: string;
  equipment_needed?: boolean;
  group_size?: number;
  meeting_location_id?: string;
  weather_conditions?: string;
  instructor_notes?: string;
  client_notes?: string;
  cancellation_reason?: string;
  cancelled_at?: Date;
  cancelled_by?: string;
  confirmed_at?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBookingData {
  client_id: string;
  instructor_id: string;
  resort_id: string;
  lesson_type: LessonType;
  skill_level: SkillLevel;
  lesson_date: Date;
  start_time: string;
  end_time: string;
  duration_hours: number;
  hourly_rate: number;
  total_amount: number;
  special_requests?: string;
  equipment_needed?: boolean;
  group_size?: number;
  meeting_location_id?: string;
}

export interface BookingSearchFilters {
  client_id?: string;
  instructor_id?: string;
  resort_id?: string;
  status?: BookingStatus;
  lesson_type?: LessonType;
  start_date?: Date;
  end_date?: Date;
}

export class Booking extends BaseModel {
  constructor() {
    super('bookings');
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingData): Promise<BookingData> {
    const bookingRecord = {
      id: uuidv4(),
      client_id: bookingData.client_id,
      instructor_id: bookingData.instructor_id,
      resort_id: bookingData.resort_id,
      lesson_type: bookingData.lesson_type,
      skill_level: bookingData.skill_level,
      lesson_date: bookingData.lesson_date,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      duration_hours: bookingData.duration_hours,
      hourly_rate: bookingData.hourly_rate,
      total_amount: bookingData.total_amount,
      status: 'pending' as BookingStatus,
      special_requests: bookingData.special_requests,
      equipment_needed: bookingData.equipment_needed || false,
      group_size: bookingData.group_size || 1,
      meeting_location_id: bookingData.meeting_location_id
    };

    return await this.create(bookingRecord);
  }

  /**
   * Get booking with related data (client, instructor, resort)
   */
  async getBookingWithDetails(bookingId: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        b.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.email as client_email,
        c.phone as client_phone,
        i.first_name as instructor_first_name,
        i.last_name as instructor_last_name,
        i.email as instructor_email,
        i.phone as instructor_phone,
        ip.hourly_rate as instructor_hourly_rate,
        ip.rating_average as instructor_rating,
        r.name as resort_name,
        r.location as resort_location
      FROM bookings b
      JOIN users c ON b.client_id = c.id
      JOIN instructor_profiles ip ON b.instructor_id = ip.id
      JOIN users i ON ip.user_id = i.id
      JOIN resorts r ON b.resort_id = r.id
      WHERE b.id = $1
    `, [bookingId]);

    return result.rows[0] || null;
  }

  /**
   * Search bookings with filters
   */
  async searchBookings(
    filters: BookingSearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    let query = `
      SELECT 
        b.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        i.first_name as instructor_first_name,
        i.last_name as instructor_last_name,
        r.name as resort_name
      FROM bookings b
      JOIN users c ON b.client_id = c.id
      JOIN instructor_profiles ip ON b.instructor_id = ip.id
      JOIN users i ON ip.user_id = i.id
      JOIN resorts r ON b.resort_id = r.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (filters.client_id) {
      query += ` AND b.client_id = $${++paramCount}`;
      params.push(filters.client_id);
    }

    if (filters.instructor_id) {
      query += ` AND b.instructor_id = $${++paramCount}`;
      params.push(filters.instructor_id);
    }

    if (filters.resort_id) {
      query += ` AND b.resort_id = $${++paramCount}`;
      params.push(filters.resort_id);
    }

    if (filters.status) {
      query += ` AND b.status = $${++paramCount}`;
      params.push(filters.status);
    }

    if (filters.lesson_type) {
      query += ` AND b.lesson_type = $${++paramCount}`;
      params.push(filters.lesson_type);
    }

    if (filters.start_date) {
      query += ` AND b.lesson_date >= $${++paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND b.lesson_date <= $${++paramCount}`;
      params.push(filters.end_date);
    }

    query += `
      ORDER BY b.lesson_date DESC, b.start_time DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId: string, status: BookingStatus, userId?: string): Promise<BookingData | null> {
    const updateData: any = { status };

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    } else if (status === 'cancelled_by_client' || status === 'cancelled_by_instructor') {
      updateData.cancelled_at = new Date();
      if (userId) {
        updateData.cancelled_by = userId;
      }
    }

    return await this.update(bookingId, updateData);
  }

  /**
   * Cancel booking with reason
   */
  async cancelBooking(bookingId: string, reason: string, cancelledBy: string): Promise<BookingData | null> {
    const updateData = {
      status: 'cancelled' as BookingStatus,
      cancellation_reason: reason,
      cancelled_at: new Date(),
      cancelled_by: cancelledBy
    };

    return await this.update(bookingId, updateData);
  }

  /**
   * Add instructor notes
   */
  async addInstructorNotes(bookingId: string, notes: string): Promise<BookingData | null> {
    return await this.update(bookingId, { instructor_notes: notes });
  }

  /**
   * Add client notes
   */
  async addClientNotes(bookingId: string, notes: string): Promise<BookingData | null> {
    return await this.update(bookingId, { client_notes: notes });
  }

  /**
   * Get upcoming bookings for instructor
   */
  async getUpcomingBookingsForInstructor(instructorId: string, limit: number = 10): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        b.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.phone as client_phone,
        r.name as resort_name
      FROM bookings b
      JOIN users c ON b.client_id = c.id
      JOIN resorts r ON b.resort_id = r.id
      WHERE b.instructor_id = $1
      AND b.lesson_date >= CURRENT_DATE
      AND b.status IN ('confirmed', 'pending')
      ORDER BY b.lesson_date ASC, b.start_time ASC
      LIMIT $2
    `, [instructorId, limit]);

    return result.rows;
  }

  /**
   * Get booking history for client
   */
  async getBookingHistoryForClient(clientId: string, limit: number = 20): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        b.*,
        i.first_name as instructor_first_name,
        i.last_name as instructor_last_name,
        ip.rating_average as instructor_rating,
        r.name as resort_name
      FROM bookings b
      JOIN instructor_profiles ip ON b.instructor_id = ip.id
      JOIN users i ON ip.user_id = i.id
      JOIN resorts r ON b.resort_id = r.id
      WHERE b.client_id = $1
      ORDER BY b.lesson_date DESC, b.start_time DESC
      LIMIT $2
    `, [clientId, limit]);

    return result.rows;
  }

  /**
   * Check for booking conflicts
   */
  async checkInstructorAvailability(
    instructorId: string,
    lessonDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE instructor_id = $1
      AND lesson_date = $2
      AND status IN ('confirmed', 'pending')
      AND (
        (start_time <= $3 AND end_time > $3) OR
        (start_time < $4 AND end_time >= $4) OR
        (start_time >= $3 AND end_time <= $4)
      )
    `;
    
    const params = [instructorId, lessonDate, startTime, endTime];

    if (excludeBookingId) {
      query += ` AND id != $5`;
      params.push(excludeBookingId);
    }

    const result = await this.query(query, params);
    return parseInt(result.rows[0].count, 10) === 0;
  }

  /**
   * Get booking statistics for a date range
   */
  async getBookingStats(startDate: Date, endDate: Date, instructorId?: string): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as average_booking_value
      FROM bookings
      WHERE lesson_date BETWEEN $1 AND $2
    `;
    
    const params: any[] = [startDate, endDate];

    if (instructorId) {
      query += ` AND instructor_id = $3`;
      params.push(instructorId);
    }

    const result = await this.query(query, params);
    return result.rows[0];
  }

  /**
   * Get bookings requiring attention (pending confirmation, etc.)
   */
  async getBookingsRequiringAttention(instructorId?: string): Promise<any[]> {
    let query = `
      SELECT 
        b.*,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        c.phone as client_phone,
        r.name as resort_name,
        EXTRACT(EPOCH FROM (NOW() - b.created_at))/3600 as hours_since_created
      FROM bookings b
      JOIN users c ON b.client_id = c.id
      JOIN resorts r ON b.resort_id = r.id
      WHERE b.status = 'pending'
      AND b.lesson_date >= CURRENT_DATE
    `;
    
    const params: any[] = [];

    if (instructorId) {
      query += ` AND b.instructor_id = $1`;
      params.push(instructorId);
    }

    query += ` ORDER BY b.lesson_date ASC, b.created_at ASC`;

    const result = await this.query(query, params);
    return result.rows;
  }
}