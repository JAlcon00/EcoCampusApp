import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { readingsService } from '../services/readings.service';

export const readingsController = {
	create: async (req: AuthenticatedRequest, res: Response) => {
		const result = await readingsService.createReading(req.body);
		return sendSuccess(res, 201, 'Lectura registrada correctamente.', result);
	},
	list: async (req: AuthenticatedRequest, res: Response) => {
		const data = await readingsService.listReadings(req.query as never);
		return sendSuccess(res, 200, 'Lecturas obtenidas correctamente.', data);
	},
 	listBySensor: async (req: AuthenticatedRequest, res: Response) => {
		const sensorId = Array.isArray(req.params.sensorId) ? req.params.sensorId[0] : req.params.sensorId;
		const query = req.query as Record<string, unknown>;
		const data = await readingsService.listReadings({
			...query,
			sensorId: String(sensorId),
		});
		return sendSuccess(res, 200, 'Lecturas del sensor obtenidas correctamente.', data);
	},
	listByClassroom: async (req: AuthenticatedRequest, res: Response) => {
		const classroomId = Array.isArray(req.params.classroomId) ? req.params.classroomId[0] : req.params.classroomId;
		const query = req.query as Record<string, unknown>;
		const data = await readingsService.listReadings({
			...query,
			classroomId: String(classroomId),
		});
		return sendSuccess(res, 200, 'Lecturas del salón obtenidas correctamente.', data);
	},
};

// Controller del módulo readings.
// Este archivo servirá para recibir y responder solicitudes de lecturas energéticas.
