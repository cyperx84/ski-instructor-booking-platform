import { pool } from '../config/database';
import { AvailabilitySlot } from '../../../shared/types';

export class AvailabilityModel {
  static async create(
    instructorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<AvailabilitySlot> {
    const result = await pool.query(
      `INSERT INTO availability_slots (instructor_id, start_time, end_time)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [instructorId, startTime, endTime]
    );

    return this.mapRow(result.rows[0]);
  }

  static async findById(id: string): Promise<AvailabilitySlot | null> {
    const result = await pool.query(
      'SELECT * FROM availability_slots WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async findByInstructor(
    instructorId: string,
    onlyAvailable: boolean = false
  ): Promise<AvailabilitySlot[]> {
    let query = 'SELECT * FROM availability_slots WHERE instructor_id = $1';
    if (onlyAvailable) {
      query += ' AND is_booked = false AND start_time > NOW()';
    }
    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, [instructorId]);
    return result.rows.map(this.mapRow);
  }

  static async findAvailable(
    instructorId: string,
    date?: Date
  ): Promise<AvailabilitySlot[]> {
    let query = `
      SELECT * FROM availability_slots
      WHERE instructor_id = $1 AND is_booked = false AND start_time > NOW()
    `;
    const params: any[] = [instructorId];

    if (date) {
      query += ` AND DATE(start_time) = DATE($2)`;
      params.push(date);
    }

    query += ' ORDER BY start_time ASC';

    const result = await pool.query(query, params);
    return result.rows.map(this.mapRow);
  }

  static async markAsBooked(id: string): Promise<void> {
    await pool.query(
      'UPDATE availability_slots SET is_booked = true WHERE id = $1',
      [id]
    );
  }

  static async markAsAvailable(id: string): Promise<void> {
    await pool.query(
      'UPDATE availability_slots SET is_booked = false WHERE id = $1',
      [id]
    );
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM availability_slots WHERE id = $1', [id]);
  }

  private static mapRow(row: any): AvailabilitySlot {
    return {
      id: row.id,
      instructorId: row.instructor_id,
      startTime: row.start_time,
      endTime: row.end_time,
      isBooked: row.is_booked,
      createdAt: row.created_at,
    };
  }
}
