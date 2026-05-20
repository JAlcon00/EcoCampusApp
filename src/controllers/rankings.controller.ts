import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { rankingsService } from '../services/rankings.service';

export const rankingsController = {
	listBuildings: async (req: AuthenticatedRequest, res: Response) => {
		const period = (req.query.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') ?? 'DAILY';
		const data = await rankingsService.getRankings(period, 'building');
		return sendSuccess(res, 200, 'Rankings por edificio obtenidos correctamente.', data);
	},
	listClassrooms: async (req: AuthenticatedRequest, res: Response) => {
		const period = (req.query.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') ?? 'DAILY';
		const data = await rankingsService.getRankings(period, 'classroom');
		return sendSuccess(res, 200, 'Rankings por salón obtenidos correctamente.', data);
	},
	compute: async (req: AuthenticatedRequest, res: Response) => {
		const period = (req.body.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') ?? 'DAILY';
		const scope = (req.body.scope as 'building' | 'classroom') ?? 'building';
		const result = await rankingsService.computeAndPersist(period, scope);
		return sendSuccess(res, 200, 'Rankings calculados y persistidos.', result);
	},
};// Controller del módulo rankings.
// Este archivo servirá para exponer rankings y comparativas de ahorro.
