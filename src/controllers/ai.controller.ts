import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { aiService } from '../services/ai.service';

export const aiController = {
	analyze: async (req: AuthenticatedRequest, res: Response) => {
		const result = await aiService.analyzeCampus(req.query as never);
		return sendSuccess(res, 201, 'Análisis de IA generado correctamente.', result);
	},
	summary: async (req: AuthenticatedRequest, res: Response) => {
		const data = await aiService.getLatestAnalysis(req.query as never);
		return sendSuccess(res, 200, 'Último análisis de IA obtenido correctamente.', data);
	},
	recommendations: async (req: AuthenticatedRequest, res: Response) => {
		const data = await aiService.getLatestAnalysis(req.query as never);
		return sendSuccess(res, 200, 'Recomendaciones de IA obtenidas correctamente.', data?.recommendations ?? []);
	},
};// Controller del módulo ai.
// Este archivo recibirá las solicitudes de análisis y coordinará la respuesta hacia el service.

// Responsabilidades conceptuales:
// - Recibir filtros de periodo, edificio, salón o sensor.
// - Solicitar al service el resumen histórico necesario.
// - Retornar predicciones, alertas de eficiencia y recomendaciones generadas por la IA.
