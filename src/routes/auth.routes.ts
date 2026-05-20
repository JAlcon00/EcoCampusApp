import { Router } from 'express';
import { validateBody, loginSchema } from '../validators';
import { asyncHandler } from '../utils';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * Authentication Routes
 * POST   /auth/login    - Login with email and password
 * POST   /auth/refresh  - Refresh JWT token
 * POST   /auth/logout   - Logout (requires authentication)
 * GET    /auth/me       - Get current user info (requires authentication)
 */

// Public routes
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));

// Protected routes (require valid JWT)
router.post('/refresh', authenticate, asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));

export default router;
