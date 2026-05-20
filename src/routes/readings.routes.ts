import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateQuery, validateParams, createReadingSchema, listReadingsQuerySchema, readingSensorParamsSchema, readingClassroomParamsSchema } from '../validators';
import { asyncHandler } from '../utils';
import { readingsController } from '../controllers/readings.controller';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateBody(createReadingSchema), asyncHandler(readingsController.create));
router.get('/', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateQuery(listReadingsQuerySchema), asyncHandler(readingsController.list));
router.get('/sensors/:sensorId/readings', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateParams(readingSensorParamsSchema), validateQuery(listReadingsQuerySchema), asyncHandler(readingsController.listBySensor));
router.get('/classrooms/:classroomId/readings', authenticate, authorize('ADMIN', 'MAINTENANCE'), validateParams(readingClassroomParamsSchema), validateQuery(listReadingsQuerySchema), asyncHandler(readingsController.listByClassroom));

export default router;
