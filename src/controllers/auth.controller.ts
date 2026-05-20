import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { authService } from '../services/auth.service';
import { AppError } from '../middlewares/error';

/**
 * Authentication Controller
 * Handles HTTP requests/responses for authentication endpoints
 */
export const authController = {
	/**
	 * POST /auth/login
	 * Authenticate user with email and password
	 * Returns JWT token with configured expiration time
	 *
	 * Success Response (200):
	 * {
	 *   accessToken: string,    // JWT token for Authorization header
	 *   expiresIn: string,      // Token expiration time (e.g., "8h")
	 *   tokenType: "Bearer",    // Use as: Authorization: Bearer <token>
	 *   user: { id, name, email, role, status }
	 * }
	 *
	 * Error Responses:
	 * - 400: Missing or invalid email/password
	 * - 401: Invalid credentials or user not found
	 * - 403: User account is inactive
	 */
	login: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const credentials = req.body as { email: string; password: string };
			const result = await authService.login(credentials);
			return sendSuccess(res, 200, 'Inicio de sesión exitoso.', result);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * POST /auth/refresh
	 * Refresh JWT token to extend session
	 * Requires valid JWT in Authorization header
	 *
	 * Success Response (200):
	 * Returns new token with fresh expiration
	 *
	 * Error Responses:
	 * - 401: Token invalid, expired, or missing
	 * - 403: User account is inactive
	 * - 404: User no longer exists
	 */
	refreshToken: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const header = req.headers.authorization;

			if (!header || !header.startsWith('Bearer ')) {
				return next(new AppError('Token de autenticación faltante en el encabezado.', 401));
			}

			const token = header.slice(7).trim();

			if (!token) {
				return next(new AppError('Token vacío.', 401));
			}

			const result = await authService.refreshToken(token);
			return sendSuccess(res, 200, 'Token renovado correctamente.', result);
		} catch (error) {
			next(error);
		}
	},

	/**
	 * POST /auth/logout
	 * Logout user (client-side token deletion)
	 * In a stateless JWT system, logout is primarily client-side
	 * Server-side: could implement token blacklist in production
	 *
	 * Success Response (200):
	 * Message confirming logout
	 */
	logout: async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
		try {
			if (!req.user) {
				throw new AppError('No autenticado.', 401);
			}

			console.info(`[AUTH] Logout: ${req.user.email}`);
			return sendSuccess(res, 200, 'Sesión cerrada correctamente.', null);
		} catch (error) {
			_next(error);
		}
	},

	/**
	 * GET /auth/me
	 * Get current authenticated user information
	 * Requires valid JWT in Authorization header
	 *
	 * Success Response (200):
	 * Returns current user data extracted from JWT
	 *
	 * Error Responses:
	 * - 401: No valid authentication token
	 */
	getCurrentUser: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				return next(new AppError('No autenticado.', 401));
			}

			return sendSuccess(res, 200, 'Información de usuario obtenida.', req.user);
		} catch (error) {
			next(error);
		}
	},
};
