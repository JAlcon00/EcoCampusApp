import type { NextFunction, Response, RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
import { authService } from '../services/auth.service';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { AppError } from './error';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Extracts user information and attaches to request
 *
 * Expected header format: Authorization: Bearer <jwt-token>
 *
 * Errors:
 * - 401: Missing, malformed, or invalid token
 */
export const authenticate: RequestHandler = (req, _res, next) => {
	const header = req.headers.authorization;

	// Check for Authorization header
	if (!header || !header.startsWith('Bearer ')) {
		return next(new AppError('Falta el token de autenticación en el encabezado.', 401));
	}

	// Extract token (skip "Bearer " prefix)
	const token = header.slice(7).trim();

	if (!token) {
		return next(new AppError('Token vacío o malformado.', 401));
	}

	try {
		// Verify and decode token
		const payload = authService.verifyToken(token);

		// Attach user to request
		const request = req as AuthenticatedRequest;
		const user: AuthenticatedUser = {
			id: payload.sub,
			email: payload.email,
			name: payload.name,
			role: payload.role,
		};
		request.user = user;

		return next();
	} catch (error) {
		// authService.verifyToken throws AppError with appropriate status code
		return next(error);
	}
};

/**
 * Authorization Middleware
 * Checks if authenticated user has required role(s)
 * Must be used AFTER authenticate middleware
 *
 * Usage: authorize(UserRole.ADMIN, UserRole.MAINTENANCE)
 *
 * Errors:
 * - 401: No authenticated user
 * - 403: User role not in allowed list
 */
export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
	return (req, _res, next) => {
		const request = req as AuthenticatedRequest;

		// Ensure user is authenticated
		if (!request.user) {
			return next(new AppError('No autenticado.', 401));
		}

		// Check if user role is in allowed list
		if (!allowedRoles.includes(request.user.role)) {
			console.warn(`[AUTH] Unauthorized access attempt by ${request.user.email} (${request.user.role})`);
			return next(
				new AppError(
					'No tienes permisos para acceder a este recurso. Contacta al administrador.',
					403
				)
			);
		}

		return next();
	};
};
