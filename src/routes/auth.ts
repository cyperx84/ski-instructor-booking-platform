import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { authRateLimitMiddleware } from '@/middleware/security';
import {
  validateRequestWithJoi,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
} from '@/utils/validation';

const router = Router();

// Public routes
router.post('/register', authRateLimitMiddleware, validateRequestWithJoi(userRegistrationSchema), register);
router.post('/login', authRateLimitMiddleware, validateRequestWithJoi(userLoginSchema), login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', validateRequestWithJoi(userUpdateSchema), updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

export default router;