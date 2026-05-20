import type { Response, NextFunction, RequestHandler } from 'express';
import type { RankingPeriod } from '@prisma/client';
import { AppError } from '../middlewares/error';

export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(handler: T): RequestHandler => {
	return (req, res, next) => {
		void handler(req, res, next).catch(next);
	};
};

export const sendSuccess = <T>(
	res: Response,
	statusCode: number,
	message: string,
	data: T | null = null,
) => {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
		errors: null,
		statusCode,
	});
};

export const toNumber = (value: unknown): number => {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'string') {
		return Number(value);
	}

	if (value && typeof value === 'object' && 'toString' in value) {
		return Number((value as { toString: () => string }).toString());
	}

	return Number(value ?? 0);
};

const startOfDay = (date: Date): Date => {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
};

const endOfDay = (date: Date): Date => {
	const copy = new Date(date);
	copy.setHours(23, 59, 59, 999);
	return copy;
};

const startOfWeek = (date: Date): Date => {
	const copy = startOfDay(date);
	const day = copy.getDay();
	const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
	copy.setDate(diff);
	return copy;
};

const endOfWeek = (date: Date): Date => {
	const copy = startOfWeek(date);
	copy.setDate(copy.getDate() + 6);
	return endOfDay(copy);
};

const startOfMonth = (date: Date): Date => {
	const copy = new Date(date);
	copy.setDate(1);
	return startOfDay(copy);
};

const endOfMonth = (date: Date): Date => {
	const copy = new Date(date);
	copy.setMonth(copy.getMonth() + 1, 0);
	return endOfDay(copy);
};

const shiftPeriod = (date: Date, period: RankingPeriod, direction: 'previous' | 'current'): Date => {
	const copy = new Date(date);
	const multiplier = direction === 'previous' ? -1 : 0;

	if (period === 'DAILY') {
		copy.setDate(copy.getDate() + multiplier);
		return copy;
	}

	if (period === 'WEEKLY') {
		copy.setDate(copy.getDate() + multiplier * 7);
		return copy;
	}

	copy.setMonth(copy.getMonth() + multiplier);
	return copy;
};

export const getPeriodBounds = (period: RankingPeriod, anchor: Date = new Date()) => {
	if (period === 'DAILY') {
		const currentStart = startOfDay(anchor);
		const currentEnd = endOfDay(anchor);
		const previousAnchor = shiftPeriod(anchor, period, 'previous');
		return {
			current: { from: currentStart, to: currentEnd },
			previous: { from: startOfDay(previousAnchor), to: endOfDay(previousAnchor) },
		};
	}

	if (period === 'WEEKLY') {
		const currentStart = startOfWeek(anchor);
		const currentEnd = endOfWeek(anchor);
		const previousAnchor = shiftPeriod(anchor, period, 'previous');
		return {
			current: { from: currentStart, to: currentEnd },
			previous: { from: startOfWeek(previousAnchor), to: endOfWeek(previousAnchor) },
		};
	}

	const currentStart = startOfMonth(anchor);
	const currentEnd = endOfMonth(anchor);
	const previousAnchor = shiftPeriod(anchor, period, 'previous');
	return {
		current: { from: currentStart, to: currentEnd },
		previous: { from: startOfMonth(previousAnchor), to: endOfMonth(previousAnchor) },
	};
};

export const calculatePercentage = (previous: number, current: number): number => {
	if (previous === 0) {
		return 0;
	}

	return Number((((previous - current) / previous) * 100).toFixed(2));
};

export const sumNumbers = (values: number[]): number => {
	return Number(values.reduce((accumulator, value) => accumulator + value, 0).toFixed(4));
};

export const groupBy = <T, K extends string | number>(items: T[], selector: (item: T) => K) => {
	return items.reduce((accumulator, item) => {
		const key = selector(item);
		if (!accumulator[key]) {
			accumulator[key] = [];
		}
		accumulator[key].push(item);
		return accumulator;
	}, {} as Record<K, T[]>);
};

export const assertPresent = <T>(value: T | null | undefined, message: string): T => {
	if (value === null || value === undefined) {
		throw new AppError(message, 404);
	}

	return value;
};
// Utilidades compartidas.
// Este archivo servirá para concentrar helpers reutilizables en toda la aplicación.
