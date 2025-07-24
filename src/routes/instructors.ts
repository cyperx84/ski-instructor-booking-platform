import { Router } from 'express';
import {
  getInstructors,
  getInstructorById,
  createInstructorProfile,
  updateInstructorProfile,
  deleteInstructorProfile,
  toggleAvailability,
  getInstructorStats,
} from '@/controllers/instructorController';
import { authenticateToken, authorizeRole, authorizeOwnership } from '@/middleware/auth';
import { UserRole } from '@/types';
import Joi from 'joi';
import {
  validateRequestWithJoi,
  validateParams,
  validateQuery,
  instructorProfileSchema,
  searchFiltersSchema,
  paginationSchema,
  uuidSchema,
} from '@/utils/validation';

const router = Router();

// Public routes
router.get('/', validateQuery(searchFiltersSchema), validateQuery(paginationSchema), getInstructors);
router.get('/:id', validateParams(Joi.object({ id: uuidSchema })), getInstructorById);

// Protected routes
router.use(authenticateToken);

// Instructor-specific routes
router.post(
  '/profile',
  authorizeRole(UserRole.INSTRUCTOR),
  validateRequestWithJoi(instructorProfileSchema),
  createInstructorProfile
);

router.put(
  '/:id',
  validateParams(Joi.object({ id: uuidSchema })),
  validateRequestWithJoi(instructorProfileSchema),
  updateInstructorProfile
);

router.delete(
  '/:id',
  validateParams(Joi.object({ id: uuidSchema })),
  deleteInstructorProfile
);

router.patch(
  '/:id/availability',
  validateParams(Joi.object({ id: uuidSchema })),
  toggleAvailability
);

router.get(
  '/:id/stats',
  validateParams(Joi.object({ id: uuidSchema })),
  getInstructorStats
);

export default router;