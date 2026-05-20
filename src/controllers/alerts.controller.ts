import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { alertsService } from '../services/alerts.service';

export const alertsController = {
	list: async (req: AuthenticatedRequest, res: Response) => {
		const data = await alertsService.listAlerts(req.query as never);
		return sendSuccess(res, 200, 'Alertas obtenidas correctamente.', data);
	},
	listActive: async (_req: AuthenticatedRequest, res: Response) => {
		const data = await alertsService.listActiveAlerts();
		return sendSuccess(res, 200, 'Alertas activas obtenidas correctamente.', data);
	},
	resolve: async (req: AuthenticatedRequest, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			throw new Error('Usuario no autenticado.');
		}

		const alertId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const result = await alertsService.resolveAlert(String(alertId), userId, req.body.status);
		return sendSuccess(res, 200, 'Estado de alerta actualizado correctamente.', result);
	},
	getEvents: async (req: AuthenticatedRequest, res: Response) => {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const events = await alertsService.listEvents(String(id));
		return sendSuccess(res, 200, 'Eventos de la alerta obtenidos correctamente.', events);
	},
};

// Controller del módulo alerts.
// Este archivo servirá para consultar y actualizar alertas del sistema.
