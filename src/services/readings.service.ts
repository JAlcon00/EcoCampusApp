import type { ReadingSource } from '@prisma/client';
import { AppError } from '../middlewares/error';
import { readingsRepository } from '../repositories/readings.repository';
import { alertsService } from './alerts.service';

export const readingsService = {
	createReading: async (input: {
		sensorId: string;
		value: number;
		unit: string;
		source: ReadingSource;
		recordedAt: Date;
	}) => {
		const sensor = await readingsRepository.findSensorContext(input.sensorId);
		if (!sensor) {
			throw new AppError('El sensor no existe.', 404);
		}

		if (sensor.status !== 'ACTIVE') {
			throw new AppError('El sensor no está activo.', 409);
		}

		const reading = await readingsRepository.create(input);
		const alert = await alertsService.evaluateReading(reading, sensor as never);

		return {
			reading,
			alert,
		};
	},
	listReadings: (filters: {
		sensorId?: string;
		classroomId?: string;
		buildingId?: string;
		from?: Date;
		to?: Date;
		limit?: number;
	}) => {
		return readingsRepository.findMany(filters);
	},
};// Service del módulo readings.
// Este archivo servirá para registrar y consultar lecturas energéticas.
