import { Router } from 'express';
import { UserModel } from '../models/User';
import { InstructorModel } from '../models/Instructor';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { RegisterRequest, LoginRequest, UserRole, CreateInstructorRequest } from '../../../shared/types';

const router = Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Create user
    const user = await UserModel.create(email, password, firstName, lastName, role, phoneNumber);

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Complete instructor profile (after registering as instructor)
router.post('/instructor/complete-profile', async (req, res, next) => {
  try {
    const { bio, specialties, hourlyRate, yearsExperience, certifications }: CreateInstructorRequest = req.body;
    const userId = req.body.userId; // In practice, get from JWT token

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    // Check if instructor profile already exists
    const existing = await InstructorModel.findByUserId(userId);
    if (existing) {
      throw new AppError('Instructor profile already exists', 400);
    }

    // Create instructor profile
    const instructor = await InstructorModel.create(
      userId,
      bio,
      specialties,
      hourlyRate,
      yearsExperience,
      certifications
    );

    res.status(201).json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
