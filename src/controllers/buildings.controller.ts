import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { buildingsService } from '../services/buildings.service';

export const buildingsController = {
	list: async (_req: AuthenticatedRequest, res: Response) => {
		const data = await buildingsService.listBuildings();
		return sendSuccess(res, 200, 'Edificios obtenidos correctamente.', data);
	},
	getById: async (req: AuthenticatedRequest, res: Response) => {
		const data = await buildingsService.getBuildingById(String(req.params.id));
		return sendSuccess(res, 200, 'Edificio obtenido correctamente.', data);
	},
	create: async (req: AuthenticatedRequest, res: Response) => {
		const data = await buildingsService.createBuilding(req.body);
		return sendSuccess(res, 201, 'Edificio creado correctamente.', data);
	},
	update: async (req: AuthenticatedRequest, res: Response) => {
		const data = await buildingsService.updateBuilding(String(req.params.id), req.body);
		return sendSuccess(res, 200, 'Edificio actualizado correctamente.', data);
	},
	remove: async (req: AuthenticatedRequest, res: Response) => {
		await buildingsService.deleteBuilding(String(req.params.id));
		return sendSuccess(res, 200, 'Edificio eliminado correctamente.', null);
	},
	metrics: async (req: AuthenticatedRequest, res: Response) => {
		const data = await buildingsService.getMetrics(String(req.params.id));
		return sendSuccess(res, 200, 'Métricas del edificio obtenidas correctamente.', data);
	},
};
