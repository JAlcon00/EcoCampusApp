import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { alertsController } from '../controllers/alerts.controller';
import { updateAlertStateSchema, validateBody, validateQuery, listAlertsQuerySchema, validateParams, alertParamsSchema } from '../validators';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateQuery(listAlertsQuerySchema), asyncHandler(alertsController.list));
router.get('/active', authenticate, authorize('ADMIN', 'MAINTENANCE'), asyncHandler(alertsController.listActive));
router.patch('/:id/state', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateParams(alertParamsSchema), validateBody(updateAlertStateSchema), asyncHandler(alertsController.resolve));
router.get('/:id/events', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateParams(alertParamsSchema), asyncHandler(alertsController.getEvents));

export default router;
