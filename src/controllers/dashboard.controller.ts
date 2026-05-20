import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
	summary: async (req: AuthenticatedRequest, res: Response) => {
		const role = req.user?.role ?? 'STUDENT';
		const period = (req.query.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') ?? 'DAILY';
		const data = await dashboardService.getSummary(period, role);
		return sendSuccess(res, 200, 'Resumen del dashboard obtenido correctamente.', data);
	},
};// Controller del módulo dashboard.
// Este archivo servirá para entregar KPIs y resúmenes generales al frontend.
