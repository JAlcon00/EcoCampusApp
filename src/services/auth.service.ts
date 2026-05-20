import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { config } from '../config';
import { AppError } from '../middlewares/error';
import type { UserRole } from '@prisma/client';

interface LoginPayload {
	email: string;
	password: string;
}

interface AuthResponse {
	accessToken: string;
	expiresIn: string;
	tokenType: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: UserRole;
		status: string;
	};
}

interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	role: UserRole;
}

/**
 * Create JWT token with proper configuration
 * Token includes user identification data and role for authorization
 * Expiration is configured via config.jwtExpiresIn (default: 8h)
 */
const createJwt = (payload: JwtPayload): string => {
	if (!config.jwtSecret) {
		throw new AppError('La configuración JWT no está disponible.', 500);
	}

	try {
		const opts: SignOptions = {
			expiresIn: config.jwtExpiresIn as any,
			algorithm: 'HS256',
			issuer: 'ecocampus-api',
		};

		return jwt.sign(payload as any, config.jwtSecret as any, opts as any);
	} catch (error) {
		throw new AppError('No se pudo generar el token de autenticación.', 500);
	}
};

/**
 * Verify JWT token and return payload
 * Handles expired, invalid, and malformed tokens with specific error messages
 */
const verifyJwt = (token: string): JwtPayload => {
	if (!config.jwtSecret) {
		throw new AppError('La configuración JWT no está disponible.', 500);
	}

	try {
		const decoded = jwt.verify(token, config.jwtSecret, {
			algorithms: ['HS256'],
		}) as JwtPayload;

		return decoded;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new AppError('El token ha expirado. Por favor, inicie sesión nuevamente.', 401);
		}

		if (error instanceof jwt.JsonWebTokenError) {
			throw new AppError('Token inválido o malformado.', 401);
		}

		throw new AppError('Error al verificar el token.', 401);
	}
};

export const authService = {
	/**
	 * Authenticate user with email and password
	 * Validates credentials against database and returns JWT token
	 *
	 * Error Handling for Failed Credentials:
	 * - Returns generic "Credenciales inválidas" for both user-not-found and wrong-password
	 *   to prevent email enumeration attacks
	 * - Logs failed attempts for security monitoring
	 * - Returns 401 Unauthorized for invalid credentials
	 * - Returns 403 Forbidden if user account is inactive
	 */
	login: async ({ email, password }: LoginPayload): Promise<AuthResponse> => {
		// Validate inputs
		if (!email || !password) {
			throw new AppError('El correo y la contraseña son obligatorios.', 400);
		}

		// Find user by email (case-insensitive query recommended in production)
		const user = await prisma.user.findUnique({
			where: { email },
		});

		// User not found - generic error to prevent email enumeration
		if (!user) {
			// Log attempt for security monitoring
			console.warn(`[AUTH] Failed login attempt - user not found: ${email}`);
			throw new AppError(
				'Credenciales inválidas. Verifique su correo y contraseña.',
				401,
				undefined,
				'INVALID_CREDENTIALS'
			);
		}

		// Check if user account is active
		if (user.status !== 'ACTIVE') {
			console.warn(`[AUTH] Login attempt on inactive account: ${email}`);
			throw new AppError(
				'Esta cuenta ha sido desactivada. Contacte al administrador del sistema.',
				403,
				undefined,
				'ACCOUNT_INACTIVE'
			);
		}

		// Verify password
		let isValidPassword = false;
		try {
			isValidPassword = await bcrypt.compare(password, user.passwordHash);
		} catch (error) {
			console.error('[AUTH] Error comparing passwords:', error);
			throw new AppError('Error al validar las credenciales.', 500);
		}

		// Invalid password - generic error to prevent email enumeration
		if (!isValidPassword) {
			console.warn(`[AUTH] Failed login attempt - invalid password: ${email}`);
			// TODO: Implement failed login attempt tracking/rate limiting here
			// Example: increment failed attempt counter, lock account after N attempts
			throw new AppError(
				'Credenciales inválidas. Verifique su correo y contraseña.',
				401,
				undefined,
				'INVALID_CREDENTIALS'
			);
		}

		// Generate JWT token
		const token = createJwt({
			sub: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		});

		console.info(`[AUTH] Successful login: ${email}`);

		return {
			accessToken: token,
			expiresIn: config.jwtExpiresIn,
			tokenType: 'Bearer',
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
			},
		};
	},

	/**
	 * Verify and decode JWT token
	 * Returns decoded payload if valid
	 * Throws specific errors for expired, invalid, or malformed tokens
	 */
	verifyToken: (token: string): JwtPayload => {
		return verifyJwt(token);
	},

	/**
	 * Refresh JWT token
	 * Validates current token and issues new one with fresh expiration
	 * Useful for extending user session without requiring re-authentication
	 */
	refreshToken: async (token: string): Promise<AuthResponse> => {
		// Verify current token
		const payload = verifyJwt(token);

		// Verify user still exists and is active
		const user = await prisma.user.findUnique({
			where: { id: payload.sub },
		});

		if (!user) {
			throw new AppError('Usuario no encontrado.', 404);
		}

		if (user.status !== 'ACTIVE') {
			throw new AppError('No se puede renovar el token. Esta cuenta ha sido desactivada.', 403);
		}

		// Generate new token
		const newToken = createJwt({
			sub: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		});

		console.info(`[AUTH] Token refreshed for user: ${user.email}`);

		return {
			accessToken: newToken,
			expiresIn: config.jwtExpiresIn,
			tokenType: 'Bearer',
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
			},
		};
	},
};
