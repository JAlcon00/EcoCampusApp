import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { classroomsController } from '../controllers/classrooms.controller';
import { validateBody, validateParams, createClassroomSchema, updateClassroomSchema, classroomParamsSchema } from '../validators';
import { sensorsController } from '../controllers/sensors.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(classroomsController.listByBuilding));
router.get('/:id', validateParams(classroomParamsSchema), asyncHandler(classroomsController.getById));
router.get('/:classroomId/sensors', asyncHandler(sensorsController.listByClassroom));
router.post('/', authorize('ADMIN', 'MAINTENANCE'), validateBody(createClassroomSchema), asyncHandler(classroomsController.create));
router.patch('/:id', authorize('ADMIN', 'MAINTENANCE'), validateParams(classroomParamsSchema), validateBody(updateClassroomSchema), asyncHandler(classroomsController.update));
router.delete('/:id', authorize('ADMIN'), validateParams(classroomParamsSchema), asyncHandler(classroomsController.remove));

export default router;
