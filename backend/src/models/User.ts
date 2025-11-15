import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../../../shared/types';

const SALT_ROUNDS = 10;

export class UserModel {
  static async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    phoneNumber?: string
  ): Promise<Omit<User, 'password'>> {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, phone_number, created_at, updated_at`,
      [email, passwordHash, firstName, lastName, role, phoneNumber]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password_hash,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, phone_number, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      phoneNumber: row.phone_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
