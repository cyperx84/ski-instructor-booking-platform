import { Router } from 'express';
import { InstructorModel } from '../models/Instructor';
import { AvailabilityModel } from '../models/Availability';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { UserRole, SearchInstructorsQuery, CreateAvailabilityRequest } from '../../../shared/types';

const router = Router();

// Search instructors (public)
router.get('/search', async (req, res, next) => {
  try {
    const filters: SearchInstructorsQuery = {
      activity: req.query.activity as any,
      minRate: req.query.minRate ? parseFloat(req.query.minRate as string) : undefined,
      maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      date: req.query.date as string,
    };

    const instructors = await InstructorModel.search(filters);

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    next(error);
  }
});

// Get instructor by ID with user details (public)
router.get('/:id', async (req, res, next) => {
  try {
    const instructor = await InstructorModel.findWithUser(req.params.id);

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    next(error);
  }
});

// Get instructor availability (public)
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { date } = req.query;
    const dateFilter = date ? new Date(date as string) : undefined;

    const slots = await AvailabilityModel.findAvailable(req.params.id, dateFilter);

    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
});

// Create availability slot (instructor only)
router.post(
  '/:id/availability',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const { startTime, endTime }: CreateAvailabilityRequest = req.body;

      // Verify instructor owns this profile
      const instructor = await InstructorModel.findById(req.params.id);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      if (instructor.userId !== req.user?.id) {
        throw new AppError('Unauthorized to modify this instructor profile', 403);
      }

      const slot = await AvailabilityModel.create(
        req.params.id,
        new Date(startTime),
        new Date(endTime)
      );

      res.status(201).json({
        success: true,
        data: slot,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete availability slot (instructor only)
router.delete(
  '/:id/availability/:slotId',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const instructor = await InstructorModel.findById(req.params.id);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      if (instructor.userId !== req.user?.id) {
        throw new AppError('Unauthorized to modify this instructor profile', 403);
      }

      const slot = await AvailabilityModel.findById(req.params.slotId);
      if (!slot) {
        throw new AppError('Availability slot not found', 404);
      }

      if (slot.isBooked) {
        throw new AppError('Cannot delete a booked availability slot', 400);
      }

      await AvailabilityModel.delete(req.params.slotId);

      res.json({
        success: true,
        message: 'Availability slot deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
