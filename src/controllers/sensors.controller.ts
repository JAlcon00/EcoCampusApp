import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { sensorsService } from '../services/sensors.service';

export const sensorsController = {
	listByClassroom: async (req: AuthenticatedRequest, res: Response) => {
		const data = await sensorsService.listSensors(String(req.params.classroomId));
		return sendSuccess(res, 200, 'Sensores obtenidos correctamente.', data);
	},
	getById: async (req: AuthenticatedRequest, res: Response) => {
		const data = await sensorsService.getSensorById(String(req.params.id));
		return sendSuccess(res, 200, 'Sensor obtenido correctamente.', data);
	},
	create: async (req: AuthenticatedRequest, res: Response) => {
		const data = await sensorsService.createSensor(req.body);
		return sendSuccess(res, 201, 'Sensor creado correctamente.', data);
	},
	update: async (req: AuthenticatedRequest, res: Response) => {
		const data = await sensorsService.updateSensor(String(req.params.id), req.body);
		return sendSuccess(res, 200, 'Sensor actualizado correctamente.', data);
	},
	updateState: async (req: AuthenticatedRequest, res: Response) => {
		const data = await sensorsService.updateSensorState(String(req.params.id), req.body.status);
		return sendSuccess(res, 200, 'Estado del sensor actualizado correctamente.', data);
	},
	remove: async (req: AuthenticatedRequest, res: Response) => {
		await sensorsService.deleteSensor(String(req.params.id));
		return sendSuccess(res, 200, 'Sensor eliminado correctamente.', null);
	},
};
