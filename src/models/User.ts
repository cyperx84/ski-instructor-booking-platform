import { BaseModel } from './BaseModel';
import { UserRole } from '@/types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface UserData {
  id?: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  email_verified?: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone?: string;
}

export class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Create a new user with hashed password
   */
  async createUser(userData: CreateUserData): Promise<UserData> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const userRecord = {
      id: uuidv4(),
      email: userData.email,
      password_hash: hashedPassword,
      role: userData.role,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_active: true,
      email_verified: false,
    };

    return await this.create(userRecord);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserData | null> {
    const result = await this.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Verify user password
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }

  /**
   * Generate and store password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await this.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    return resetToken;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    ).then(result => result.rows[0]);

    if (!user) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    return true;
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const result = await this.query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE email_verification_token = $1',
      [token]
    );

    return result.rowCount > 0;
  }

  /**
   * Get user profile with role-specific data
   */
  async getUserProfile(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) return null;

    // Remove sensitive data
    const { password_hash, password_reset_token, email_verification_token, ...safeUser } = user;

    if (user.role === 'instructor') {
      // Join with instructor profile
      const result = await this.query(`
        SELECT u.*, ip.*
        FROM users u
        LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
        WHERE u.id = $1
      `, [userId]);
      
      return result.rows[0] || safeUser;
    } else if (user.role === 'client') {
      // Join with client profile
      const result = await this.query(`
        SELECT u.*, cp.*
        FROM users u
        LEFT JOIN client_profiles cp ON u.id = cp.user_id
        WHERE u.id = $1
      `, [userId]);
      
      return result.rows[0] || safeUser;
    }

    return safeUser;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, limit?: number, offset?: number): Promise<UserData[]> {
    return await this.findAll({ role }, limit, offset);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<boolean> {
    const result = await this.update(userId, { is_active: false });
    return !!result;
  }

  /**
   * Activate user account
   */
  async activateUser(userId: string): Promise<boolean> {
    const result = await this.update(userId, { is_active: true });
    return !!result;
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchTerm: string, role?: UserRole, limit: number = 20): Promise<UserData[]> {
    let query = `
      SELECT id, email, first_name, last_name, role, phone, avatar_url, is_active, created_at
      FROM users 
      WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)
      AND is_active = true
    `;
    const params = [`%${searchTerm}%`];

    if (role) {
      query += ' AND role = $2';
      params.push(role);
    }

    query += ` ORDER BY first_name, last_name LIMIT ${limit}`;

    const result = await this.query(query, params);
    return result.rows;
  }
}