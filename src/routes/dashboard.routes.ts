import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validateQuery, dashboardQuerySchema } from '../validators';
import { asyncHandler } from '../utils';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/summary', authenticate, validateQuery(dashboardQuerySchema), asyncHandler(dashboardController.summary));

export default router;
