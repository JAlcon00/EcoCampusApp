import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
	statusCode: number;
	errors?: unknown[];
	code?: string;

	constructor(message: string, statusCode = 500, errors?: unknown[], code?: string) {
		super(message);
		this.name = 'AppError';
		this.statusCode = statusCode;
		this.errors = errors;
		this.code = code;
	}
}

const normalizeError = (error: unknown): AppError => {
	if (error instanceof AppError) {
		return error;
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		if (error.code === 'P2002') {
			return new AppError('Ya existe un registro con esos valores únicos.', 409, undefined, error.code);
		}

		if (error.code === 'P2025') {
			return new AppError('El recurso solicitado no existe.', 404, undefined, error.code);
		}
	}

	if (error instanceof Error) {
		return new AppError(error.message, 500);
	}

	return new AppError('Error inesperado del servidor.', 500);
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
	next(new AppError('Ruta no encontrada.', 404));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
	const normalized = normalizeError(error);
	const statusCode = normalized.statusCode >= 400 ? normalized.statusCode : 500;

	return res.status(statusCode).json({
		success: false,
		message: normalized.message,
		data: null,
		errors: normalized.errors ?? null,
		statusCode,
	});
};
