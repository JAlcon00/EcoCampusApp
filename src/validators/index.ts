import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import type { RankingPeriod, AlertStatus, ReadingSource } from '@prisma/client';
import { AppError } from '../middlewares/error';

export const uuidSchema = z.string().uuid('Debe ser un UUID válido.');

export const loginSchema = z.object({
	email: z.string().email('El correo no es válido.'),
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export const userRoleSchema = z.enum(['ADMIN', 'MAINTENANCE', 'STUDENT']);
export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const buildingStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const classroomStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const classroomTypeSchema = z.enum(['CLASSROOM', 'LABORATORY', 'OFFICE', 'LIBRARY', 'COMMON_AREA']);
export const sensorTypeSchema = z.enum(['ENERGY', 'AIR_CONDITIONING', 'LIGHTING', 'OCCUPANCY']);
export const sensorStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']);

export const createReadingSchema = z.object({
	sensorId: uuidSchema,
	value: z.coerce.number().finite('El valor debe ser numérico.'),
	unit: z.string().min(1, 'La unidad es obligatoria.').max(50),
	source: z.enum(['SIMULATED', 'MANUAL', 'IMPORTED'] satisfies [ReadingSource, ...ReadingSource[]]).default('SIMULATED'),
	recordedAt: z.coerce.date(),
});

export const listReadingsQuerySchema = z.object({
	sensorId: uuidSchema.optional(),
	classroomId: uuidSchema.optional(),
	buildingId: uuidSchema.optional(),
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),
});

export const listAlertsQuerySchema = z.object({
	status: z.enum(['ACTIVE', 'RESOLVED', 'IGNORED'] satisfies [AlertStatus, ...AlertStatus[]]).optional(),
	type: z.string().optional(),
	buildingId: uuidSchema.optional(),
	classroomId: uuidSchema.optional(),
	sensorId: uuidSchema.optional(),
	period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'] satisfies [RankingPeriod, ...RankingPeriod[]]).optional(),
});

export const updateAlertStateSchema = z.object({
	status: z.enum(['RESOLVED', 'IGNORED'] satisfies ['RESOLVED', 'IGNORED']),
});

export const alertParamsSchema = z.object({
	id: uuidSchema,
});

export const readingSensorParamsSchema = z.object({
	sensorId: uuidSchema,
});

export const readingClassroomParamsSchema = z.object({
	classroomId: uuidSchema,
});

export const rankingQuerySchema = z.object({
	period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'] satisfies [RankingPeriod, ...RankingPeriod[]]).default('DAILY'),
	scope: z.enum(['building', 'classroom']).default('building'),
});

export const dashboardQuerySchema = z.object({
	period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'] satisfies [RankingPeriod, ...RankingPeriod[]]).default('DAILY'),
});

export const aiAnalysisQuerySchema = z.object({
	period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'] satisfies [RankingPeriod, ...RankingPeriod[]]).default('DAILY'),
	buildingId: uuidSchema.optional(),
	classroomId: uuidSchema.optional(),
	sensorId: uuidSchema.optional(),
});

export const aiAnalyzeSchema = aiAnalysisQuerySchema;

export const createUserSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio.').max(150),
	email: z.string().email('El correo no es válido.'),
	password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
	role: userRoleSchema,
	status: userStatusSchema.optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
	password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').optional(),
});

export const userParamsSchema = z.object({
	id: uuidSchema,
});

export const createBuildingSchema = z.object({
	name: z.string().min(1, 'El nombre es obligatorio.').max(150),
	description: z.string().max(2000).nullable().optional(),
	location: z.string().max(255).nullable().optional(),
	status: buildingStatusSchema.optional(),
});

export const updateBuildingSchema = createBuildingSchema.partial();

export const buildingParamsSchema = z.object({
	id: uuidSchema,
});

export const buildingClassroomsParamsSchema = z.object({
	buildingId: uuidSchema,
});

export const createClassroomSchema = z.object({
	buildingId: uuidSchema,
	name: z.string().min(1, 'El nombre es obligatorio.').max(150),
	floor: z.coerce.number().int('El piso debe ser entero.'),
	capacity: z.coerce.number().int('La capacidad debe ser entera.').min(0),
	type: classroomTypeSchema,
	status: classroomStatusSchema.optional(),
});

export const updateClassroomSchema = createClassroomSchema.partial();

export const classroomParamsSchema = z.object({
	id: uuidSchema,
	buildingId: uuidSchema.optional(),
});

export const createSensorSchema = z.object({
	classroomId: uuidSchema,
	name: z.string().min(1, 'El nombre es obligatorio.').max(150),
	type: sensorTypeSchema,
	unit: z.string().min(1, 'La unidad es obligatoria.').max(50),
	status: sensorStatusSchema.optional(),
	installedAt: z.coerce.date().optional(),
});

export const updateSensorSchema = createSensorSchema.partial();

export const sensorParamsSchema = z.object({
	id: uuidSchema,
	classroomId: uuidSchema.optional(),
});

export const sensorStateSchema = z.object({
	status: sensorStatusSchema,
});

const formatZodError = (error: z.ZodError) => {
	return error.issues.map((issue) => ({
		path: issue.path.join('.'),
		message: issue.message,
	}));
};

const validate = <T extends z.ZodTypeAny>(schema: T, target: 'body' | 'query' | 'params'): RequestHandler => {
	return (req: Request, _res: Response, next: NextFunction) => {
		const result = schema.safeParse(req[target]);
		if (!result.success) {
			return next(new AppError('Validación fallida.', 400, formatZodError(result.error)));
		}

		Object.defineProperty(req, target, {
			value: result.data,
			writable: true,
			enumerable: true,
			configurable: true,
		});
		return next();
	};
};

export const validateBody = <T extends z.ZodTypeAny>(schema: T) => validate(schema, 'body');
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => validate(schema, 'query');
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => validate(schema, 'params');
