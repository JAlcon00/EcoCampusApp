import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { sensorsController } from '../controllers/sensors.controller';
import { validateBody, validateParams, createSensorSchema, updateSensorSchema, sensorParamsSchema, sensorStateSchema } from '../validators';

const router = Router();

router.use(authenticate);

router.get('/classrooms/:classroomId/sensors', asyncHandler(sensorsController.listByClassroom));
router.get('/:id', validateParams(sensorParamsSchema), asyncHandler(sensorsController.getById));
router.post('/', authorize('ADMIN', 'MAINTENANCE'), validateBody(createSensorSchema), asyncHandler(sensorsController.create));
router.patch('/:id', authorize('ADMIN', 'MAINTENANCE'), validateParams(sensorParamsSchema), validateBody(updateSensorSchema), asyncHandler(sensorsController.update));
router.patch('/:id/state', authorize('ADMIN', 'MAINTENANCE'), validateParams(sensorParamsSchema), validateBody(sensorStateSchema), asyncHandler(sensorsController.updateState));
router.delete('/:id', authorize('ADMIN'), validateParams(sensorParamsSchema), asyncHandler(sensorsController.remove));

export default router;
