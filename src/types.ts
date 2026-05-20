import type { Request } from 'express';
import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T | null;
	errors: unknown[] | null;
	statusCode: number;
}

export type ReadingScope = 'building' | 'classroom';

export type DashboardRole = 'ADMIN' | 'MAINTENANCE' | 'STUDENT';

export interface DateRange {
	from: Date;
	to: Date;
}

export interface ListQuery {
	page?: number;
	limit?: number;
}
