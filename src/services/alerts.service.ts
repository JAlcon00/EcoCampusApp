import type { AlertStatus } from '@prisma/client';
import { alertsRepository } from '../repositories/alerts.repository';
import { readingsRepository } from '../repositories/readings.repository';
import { AppError } from '../middlewares/error';
import { toNumber } from '../utils';

const ALERT_RULES = {
	ENERGY: { threshold: 150, severity: 'HIGH' as const, type: 'HIGH_CONSUMPTION' as const },
	AIR_CONDITIONING: { threshold: 120, severity: 'HIGH' as const, type: 'HIGH_CONSUMPTION' as const },
	LIGHTING: { threshold: 80, severity: 'MEDIUM' as const, type: 'HIGH_CONSUMPTION' as const },
	OCCUPANCY: { threshold: 0, severity: 'MEDIUM' as const, type: 'EMPTY_ROOM_CONSUMPTION' as const },
};

const buildAlertPayload = (input: {
	type: string;
	title: string;
	description: string;
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	buildingId?: string | null;
	classroomId?: string | null;
	sensorId?: string | null;
	readingId?: string | null;
	detectedAt: Date;
}) => {
	return alertsRepository.create(input);
};

export const alertsService = {
	listAlerts: (filters: { status?: AlertStatus; type?: string; buildingId?: string; classroomId?: string; sensorId?: string }) => {
		return alertsRepository.findMany(filters);
	},
	listActiveAlerts: () => {
		return alertsRepository.findMany({ status: 'ACTIVE' });
	},
	resolveAlert: async (alertId: string, userId: string, status: 'RESOLVED' | 'IGNORED') => {
		const alert = await alertsRepository.findById(alertId);
		if (!alert) {
			throw new AppError('La alerta no existe.', 404);
		}

		if (alert.status !== 'ACTIVE') {
			throw new AppError('La alerta ya fue gestionada.', 409);
		}

		return alertsRepository.updateState(alertId, {
			status,
			resolvedByUserId: userId,
			resolvedAt: new Date(),
		});
	},
	listEvents: (alertId: string) => {
		return alertsRepository.findEvents(alertId);
	},
	evaluateReading: async (reading: {
		id: string;
		sensorId: string;
		value: unknown;
		recordedAt: Date;
	}, sensor: {
		id: string;
		type: 'ENERGY' | 'AIR_CONDITIONING' | 'LIGHTING' | 'OCCUPANCY';
		name: string;
		classroomId: string;
		classroom: { buildingId: string };
	}) => {
		const rule = ALERT_RULES[sensor.type];
		const numericValue = toNumber(reading.value);

		if (!rule) {
			return null;
		}

		// OCCUPANCY: only alert when occupancy == 0 and there is consumption reported by other sensors
		if (sensor.type === 'OCCUPANCY') {
			if (numericValue > rule.threshold) {
				return null;
			}

			const description = 'Se detectó consumo en un espacio sin ocupación aparente.';
			return buildAlertPayload({
				type: rule.type,
				title: 'Consumo en sala vacía',
				description,
				severity: rule.severity,
				buildingId: sensor.classroom.buildingId,
				classroomId: sensor.classroomId,
				sensorId: sensor.id,
				readingId: reading.id,
				detectedAt: reading.recordedAt,
			});
		}

		// Non-occupancy sensors: check threshold
		if (numericValue <= rule.threshold) {
			return null;
		}

		// Correlate with recent occupancy readings in the same classroom (last 30 minutes)
		const thirtyMinsAgo = new Date(reading.recordedAt);
		thirtyMinsAgo.setMinutes(thirtyMinsAgo.getMinutes() - 30);

		const occupancyReadings = await readingsRepository.findMany({
			classroomId: sensor.classroomId,
			from: thirtyMinsAgo,
			to: reading.recordedAt,
		});

		const recentOccupancy = occupancyReadings
			.filter((r) => r.sensor.type === 'OCCUPANCY')
			.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];

		const isEmptyRoom = recentOccupancy ? Number(recentOccupancy.value) === 0 : true;

		const description = isEmptyRoom
			? `Consumo alto detectado (${numericValue}) en un salón sin ocupación aparente.`
			: `Se registró un valor de ${numericValue} por encima del umbral esperado para ${sensor.type}.`;

		const alertType = isEmptyRoom ? 'EMPTY_ROOM_CONSUMPTION' : rule.type;
		const severity = isEmptyRoom ? 'CRITICAL' as const : rule.severity;

		return buildAlertPayload({
			type: alertType,
			title: isEmptyRoom ? 'Consumo en sala vacía' : 'Consumo energético alto',
			description,
			severity,
			buildingId: sensor.classroom.buildingId,
			classroomId: sensor.classroomId,
			sensorId: sensor.id,
			readingId: reading.id,
			detectedAt: reading.recordedAt,
		});
	},
	registerAlertFromReading: async (readingId: string) => {
		const reading = await readingsRepository.findById(readingId);
		if (!reading?.sensor) {
			return null;
		}

		return alertsService.evaluateReading(reading, reading.sensor as never);
	},
};// Service del módulo alerts.
// Este archivo servirá para generar y administrar alertas del sistema.
