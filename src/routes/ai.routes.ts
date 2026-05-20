import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { aiController } from '../controllers/ai.controller';
import { aiAnalysisQuerySchema, validateQuery } from '../validators';

const router = Router();

router.get('/summary', authenticate, validateQuery(aiAnalysisQuerySchema), asyncHandler(aiController.summary));
router.get('/recommendations', authenticate, validateQuery(aiAnalysisQuerySchema), asyncHandler(aiController.recommendations));
router.post('/analyze', authenticate, authorize('ADMIN'), validateQuery(aiAnalysisQuerySchema), asyncHandler(aiController.analyze));

export default router;// Rutas del módulo ai.
// Este módulo expone endpoints para análisis histórico, predicción y recomendaciones de ahorro energético.

// Endpoints conceptuales:
// GET /api/ai/summary
// GET /api/ai/predictions
// GET /api/ai/recommendations
// POST /api/ai/analyze

// Aquí se exportaría el router de Express para conectar con ai.controller.ts.
