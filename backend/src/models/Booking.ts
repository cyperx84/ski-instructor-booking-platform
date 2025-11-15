import { pool } from '../config/database';
import { Booking, BookingWithDetails, BookingStatus, Activity, SkillLevel } from '../../../shared/types';

export class BookingModel {
  static async create(
    clientId: string,
    instructorId: string,
    availabilitySlotId: string,
    activity: Activity,
    skillLevel: SkillLevel,
    startTime: Date,
    endTime: Date,
    durationHours: number,
    totalPrice: number,
    specialRequests?: string
  ): Promise<Booking> {
    const result = await pool.query(
      `INSERT INTO bookings (
        client_id, instructor_id, availability_slot_id, activity, skill_level,
        start_time, end_time, duration_hours, total_price, special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        clientId,
        instructorId,
        availabilitySlotId,
        activity,
        skillLevel,
        startTime,
        endTime,
        durationHours,
        totalPrice,
        specialRequests,
      ]
    );

    return this.mapRow(result.rows[0]);
  }

  static async findById(id: string): Promise<Booking | null> {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async findWithDetails(id: string): Promise<BookingWithDetails | null> {
    const result = await pool.query(
      `SELECT
        b.*,
        i.id as instructor_id, i.bio, i.specialties, i.hourly_rate,
        i.years_experience, i.certifications, i.profile_image,
        i.rating, i.total_lessons, i.is_verified,
        iu.id as instructor_user_id, iu.email as instructor_email,
        iu.first_name as instructor_first_name, iu.last_name as instructor_last_name,
        iu.role as instructor_role, iu.phone_number as instructor_phone,
        cu.id as client_user_id, cu.email as client_email,
        cu.first_name as client_first_name, cu.last_name as client_last_name,
        cu.role as client_role, cu.phone_number as client_phone
      FROM bookings b
      JOIN instructors i ON b.instructor_id = i.id
      JOIN users iu ON i.user_id = iu.id
      JOIN users cu ON b.client_id = cu.id
      WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...this.mapRow(row),
      instructor: {
        id: row.instructor_id,
        userId: row.instructor_user_id,
        bio: row.bio,
        specialties: row.specialties,
        hourlyRate: parseFloat(row.hourly_rate),
        yearsExperience: row.years_experience,
        certifications: row.certifications,
        profileImage: row.profile_image,
        rating: parseFloat(row.rating),
        totalLessons: row.total_lessons,
        isVerified: row.is_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
          id: row.instructor_user_id,
          email: row.instructor_email,
          firstName: row.instructor_first_name,
          lastName: row.instructor_last_name,
          role: row.instructor_role,
          phoneNumber: row.instructor_phone,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        },
      },
      client: {
        id: row.client_user_id,
        email: row.client_email,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        role: row.client_role,
        phoneNumber: row.client_phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }

  static async findByClient(clientId: string): Promise<Booking[]> {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE client_id = $1 ORDER BY start_time DESC',
      [clientId]
    );

    return result.rows.map(this.mapRow);
  }

  static async findByInstructor(instructorId: string): Promise<Booking[]> {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE instructor_id = $1 ORDER BY start_time DESC',
      [instructorId]
    );

    return result.rows.map(this.mapRow);
  }

  static async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      [status, id]
    );
  }

  private static mapRow(row: any): Booking {
    return {
      id: row.id,
      clientId: row.client_id,
      instructorId: row.instructor_id,
      availabilitySlotId: row.availability_slot_id,
      activity: row.activity,
      skillLevel: row.skill_level,
      status: row.status,
      startTime: row.start_time,
      endTime: row.end_time,
      durationHours: parseFloat(row.duration_hours),
      totalPrice: parseFloat(row.total_price),
      specialRequests: row.special_requests,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
