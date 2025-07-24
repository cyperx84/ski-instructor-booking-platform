import { BaseService } from './BaseService';
import { userModel, instructorModel } from '@/models';
import { UserRole, RegisterRequestData, LoginRequestData, UpdateProfileRequestData } from '@/types';
import { generateTokens } from '@/middleware/auth';
import { AppError } from '@/middleware/error';

export class AuthService extends BaseService {
  constructor() {
    super('AuthService');
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequestData): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      this.log('info', 'Starting user registration', { email: userData.email, role: userData.role });

      // Validate required fields
      this.validateRequired(userData, ['email', 'password', 'firstName', 'lastName', 'role']);

      // Check if user already exists
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      // Create user
      const user = await userModel.createUser({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone
      });

      // Create instructor profile if user is an instructor
      if (userData.role === 'instructor') {
        await instructorModel.createProfile({
          user_id: user.id!,
          bio: '',
          specialties: ['both' as any],
          years_experience: 0,
          languages: ['English'],
          hourly_rate: 50.00, // Default rate
          minimum_booking_hours: 1,
          maximum_booking_hours: 8,
          advance_booking_days: 7,
          equipment_provided: false,
          travel_radius_km: 50
        });
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id!,
        email: user.email!,
        role: user.role!
      });

      // Update last login
      await userModel.updateLastLogin(user.id!);

      // Remove sensitive data
      const { password_hash, ...safeUser } = user;

      this.log('info', 'User registration successful', { userId: user.id, role: user.role });

      return {
        user: safeUser,
        tokens
      };

    } catch (error) {
      this.handleError(error, 'register');
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginRequestData): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      this.log('info', 'User login attempt', { email: loginData.email });

      // Validate required fields
      this.validateRequired(loginData, ['email', 'password']);

      // Find user
      const user = await userModel.findByEmail(loginData.email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.is_active) {
        throw new AppError('Account is deactivated', 401);
      }

      // Verify password
      const isValidPassword = await userModel.verifyPassword(loginData.password, user.password_hash!);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id!,
        email: user.email!,
        role: user.role!
      });

      // Update last login
      await userModel.updateLastLogin(user.id!);

      // Get user profile with role-specific data
      const userProfile = await userModel.getUserProfile(user.id!);

      this.log('info', 'User login successful', { userId: user.id, role: user.role });

      return {
        user: userProfile,
        tokens
      };

    } catch (error) {
      this.handleError(error, 'login');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<any> {
    try {
      this.log('info', 'Fetching user profile', { userId });

      const userProfile = await userModel.getUserProfile(userId);
      if (!userProfile) {
        throw new AppError('User not found', 404);
      }

      return userProfile;

    } catch (error) {
      this.handleError(error, 'getProfile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: UpdateProfileRequestData): Promise<any> {
    try {
      this.log('info', 'Updating user profile', { userId });

      // Check if user exists
      const user = await userModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Sanitize update data
      const sanitizedData = this.sanitizeData({
        first_name: updateData.firstName,
        last_name: updateData.lastName,
        phone: updateData.phone
      });

      // Update user
      const updatedUser = await userModel.update(userId, sanitizedData);

      // Get updated profile with role-specific data
      const userProfile = await userModel.getUserProfile(userId);

      this.log('info', 'User profile updated successfully', { userId });

      return userProfile;

    } catch (error) {
      this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Password reset requested', { email });

      const resetToken = await userModel.generatePasswordResetToken(email);
      
      if (!resetToken) {
        // Don't reveal if email exists or not for security
        this.log('warn', 'Password reset requested for non-existent email', { email });
      } else {
        // In a real application, you would send an email here
        this.log('info', 'Password reset token generated', { email, token: resetToken });
      }

      return { message: 'If your email is registered, you will receive a password reset link' };

    } catch (error) {
      this.handleError(error, 'requestPasswordReset');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Password reset attempt', { token });

      // Validate required fields
      this.validateRequired({ token, newPassword }, ['token', 'newPassword']);

      const success = await userModel.resetPassword(token, newPassword);
      
      if (!success) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      this.log('info', 'Password reset successful');

      return { message: 'Password reset successfully' };

    } catch (error) {
      this.handleError(error, 'resetPassword');
    }
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Email verification attempt', { token });

      const success = await userModel.verifyEmail(token);
      
      if (!success) {
        throw new AppError('Invalid verification token', 400);
      }

      this.log('info', 'Email verification successful');

      return { message: 'Email verified successfully' };

    } catch (error) {
      this.handleError(error, 'verifyEmail');
    }
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      this.log('info', 'Password change attempt', { userId });

      // Validate required fields
      this.validateRequired({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);

      // Get user
      const user = await userModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await userModel.verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Update password (using password reset functionality)
      const resetToken = await userModel.generatePasswordResetToken(user.email);
      if (!resetToken) {
        throw new AppError('Failed to generate reset token', 500);
      }

      await userModel.resetPassword(resetToken, newPassword);

      this.log('info', 'Password changed successfully', { userId });

      return { message: 'Password changed successfully' };

    } catch (error) {
      this.handleError(error, 'changePassword');
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Account deactivation', { userId });

      const success = await userModel.deactivateUser(userId);
      
      if (!success) {
        throw new AppError('Failed to deactivate account', 500);
      }

      this.log('info', 'Account deactivated successfully', { userId });

      return { message: 'Account deactivated successfully' };

    } catch (error) {
      this.handleError(error, 'deactivateAccount');
    }
  }

  /**
   * Get users by role (admin function)
   */
  async getUsersByRole(
    role: UserRole,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    users: any[];
    pagination: any;
  }> {
    try {
      this.log('info', 'Fetching users by role', { role, limit, offset });

      const users = await userModel.getUsersByRole(role, limit, offset);
      const total = await userModel.count({ role });

      const pagination = this.createPaginationInfo(total, limit, offset);

      return {
        users,
        pagination
      };

    } catch (error) {
      this.handleError(error, 'getUsersByRole');
    }
  }

  /**
   * Search users (admin function)
   */
  async searchUsers(
    searchTerm: string,
    role?: UserRole,
    limit: number = 20
  ): Promise<any[]> {
    try {
      this.log('info', 'Searching users', { searchTerm, role, limit });

      const users = await userModel.searchUsers(searchTerm, role, limit);

      return users;

    } catch (error) {
      this.handleError(error, 'searchUsers');
    }
  }
}