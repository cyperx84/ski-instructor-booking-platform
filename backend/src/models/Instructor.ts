import { pool } from '../config/database';
import { Instructor, InstructorWithUser, Activity, SearchInstructorsQuery } from '../../../shared/types';

export class InstructorModel {
  static async create(
    userId: string,
    bio: string,
    specialties: Activity[],
    hourlyRate: number,
    yearsExperience: number,
    certifications: string[]
  ): Promise<Instructor> {
    const result = await pool.query(
      `INSERT INTO instructors (user_id, bio, specialties, hourly_rate, years_experience, certifications)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, bio, specialties, hourlyRate, yearsExperience, certifications]
    );

    return this.mapRow(result.rows[0]);
  }

  static async findById(id: string): Promise<Instructor | null> {
    const result = await pool.query(
      'SELECT * FROM instructors WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<Instructor | null> {
    const result = await pool.query(
      'SELECT * FROM instructors WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async findWithUser(instructorId: string): Promise<InstructorWithUser | null> {
    const result = await pool.query(
      `SELECT
        i.*,
        u.id as user_id, u.email, u.first_name, u.last_name,
        u.role, u.phone_number, u.created_at as user_created_at,
        u.updated_at as user_updated_at
       FROM instructors i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [instructorId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...this.mapRow(row),
      user: {
        id: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        phoneNumber: row.phone_number,
        createdAt: row.user_created_at,
        updatedAt: row.user_updated_at,
      },
    };
  }

  static async search(filters: SearchInstructorsQuery): Promise<InstructorWithUser[]> {
    let query = `
      SELECT
        i.*,
        u.id as user_id, u.email, u.first_name, u.last_name,
        u.role, u.phone_number, u.created_at as user_created_at,
        u.updated_at as user_updated_at
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters.activity) {
      query += ` AND $${paramCount} = ANY(i.specialties)`;
      params.push(filters.activity);
      paramCount++;
    }

    if (filters.minRate !== undefined) {
      query += ` AND i.hourly_rate >= $${paramCount}`;
      params.push(filters.minRate);
      paramCount++;
    }

    if (filters.maxRate !== undefined) {
      query += ` AND i.hourly_rate <= $${paramCount}`;
      params.push(filters.maxRate);
      paramCount++;
    }

    if (filters.minRating !== undefined) {
      query += ` AND i.rating >= $${paramCount}`;
      params.push(filters.minRating);
      paramCount++;
    }

    query += ' ORDER BY i.rating DESC, i.total_lessons DESC';

    const result = await pool.query(query, params);

    return result.rows.map((row) => ({
      ...this.mapRow(row),
      user: {
        id: row.user_id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        phoneNumber: row.phone_number,
        createdAt: row.user_created_at,
        updatedAt: row.user_updated_at,
      },
    }));
  }

  static async updateRating(instructorId: string, newRating: number): Promise<void> {
    await pool.query(
      'UPDATE instructors SET rating = $1 WHERE id = $2',
      [newRating, instructorId]
    );
  }

  static async incrementLessons(instructorId: string): Promise<void> {
    await pool.query(
      'UPDATE instructors SET total_lessons = total_lessons + 1 WHERE id = $2',
      [instructorId]
    );
  }

  private static mapRow(row: any): Instructor {
    return {
      id: row.id,
      userId: row.user_id,
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
    };
  }
}
