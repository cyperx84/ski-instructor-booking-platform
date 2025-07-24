import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/error';
import { ApiResponse, RegisterRequestData, LoginRequestData, UpdateProfileRequestData, UserRole } from '@/types';
import { authService } from '@/services';
import logger from '@/utils/logger';

// Custom Request interface with validation data
interface ValidatedRequest<T = any> extends Request {
  validatedData: T;
}

// Register user
export const register = asyncHandler(async (req: ValidatedRequest<RegisterRequestData>, res: Response) => {
  logger.info('User registration attempt', { email: req.validatedData.email });

  const result = await authService.register(req.validatedData);

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: result,
  };

  res.status(201).json(response);
});

// Login user
export const login = asyncHandler(async (req: ValidatedRequest<LoginRequestData>, res: Response) => {
  logger.info('User login attempt', { email: req.validatedData.email });

  const result = await authService.login(req.validatedData);

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: result,
  };

  res.status(200).json(response);
});

// Get user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info('Fetching user profile', { userId });

  const userProfile = await authService.getProfile(userId);

  const response: ApiResponse = {
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: userProfile },
  };

  res.status(200).json(response);
});

// Update user profile
export const updateProfile = asyncHandler(async (req: ValidatedRequest<UpdateProfileRequestData>, res: Response) => {
  const userId = req.user!.userId;

  logger.info('Updating user profile', { userId });

  const userProfile = await authService.updateProfile(userId, req.validatedData);

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: { user: userProfile },
  };

  res.status(200).json(response);
});

// Request password reset
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  logger.info('Password reset requested', { email });

  const result = await authService.requestPasswordReset(email);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  logger.info('Password reset attempt', { token });

  const result = await authService.resetPassword(token, newPassword);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Verify email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  logger.info('Email verification attempt', { token });

  const result = await authService.verifyEmail(token);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Change password (authenticated user)
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  logger.info('Password change attempt', { userId });

  const result = await authService.changePassword(userId, currentPassword, newPassword);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Deactivate account
export const deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info('Account deactivation request', { userId });

  const result = await authService.deactivateAccount(userId);

  const response: ApiResponse = {
    success: true,
    message: result.message,
    data: null,
  };

  res.status(200).json(response);
});

// Get users by role (admin function)
export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  logger.info('Fetching users by role', { role, limit, offset });

  const result = await authService.getUsersByRole(role as UserRole, limit, offset);

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  };

  res.status(200).json(response);
});

// Search users (admin function)
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { searchTerm, role } = req.query;
  const limit = parseInt(req.query.limit as string) || 20;

  logger.info('Searching users', { searchTerm, role, limit });

  const users = await authService.searchUsers(
    searchTerm as string,
    role as UserRole,
    limit
  );

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: { users },
  };

  res.status(200).json(response);
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required',
      data: null,
    });
  }

  // This would typically verify the refresh token and generate new tokens
  // For now, return a placeholder response
  const response: ApiResponse = {
    success: false,
    message: 'Refresh token functionality not implemented',
    data: null,
  };

  res.status(501).json(response);
});

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  logger.info('User logout', { userId });

  // In a real implementation, you would invalidate the refresh token
  // For now, just return a success response
  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully',
    data: null,
  };

  res.status(200).json(response);
});