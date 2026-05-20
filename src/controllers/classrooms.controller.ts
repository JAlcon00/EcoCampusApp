import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { classroomsService } from '../services/classrooms.service';

export const classroomsController = {
	listByBuilding: async (req: AuthenticatedRequest, res: Response) => {
		const paramBuildingId = Array.isArray(req.params.buildingId) ? req.params.buildingId[0] : req.params.buildingId;
		const buildingId = paramBuildingId ?? (typeof req.query.buildingId === 'string' ? req.query.buildingId : undefined);
		const data = await classroomsService.listClassrooms(buildingId);
		return sendSuccess(res, 200, 'Salones obtenidos correctamente.', data);
	},
	getById: async (req: AuthenticatedRequest, res: Response) => {
		const data = await classroomsService.getClassroomById(String(req.params.id));
		return sendSuccess(res, 200, 'Salón obtenido correctamente.', data);
	},
	create: async (req: AuthenticatedRequest, res: Response) => {
		const data = await classroomsService.createClassroom(req.body);
		return sendSuccess(res, 201, 'Salón creado correctamente.', data);
	},
	update: async (req: AuthenticatedRequest, res: Response) => {
		const data = await classroomsService.updateClassroom(String(req.params.id), req.body);
		return sendSuccess(res, 200, 'Salón actualizado correctamente.', data);
	},
	remove: async (req: AuthenticatedRequest, res: Response) => {
		await classroomsService.deleteClassroom(String(req.params.id));
		return sendSuccess(res, 200, 'Salón eliminado correctamente.', null);
	},
};
