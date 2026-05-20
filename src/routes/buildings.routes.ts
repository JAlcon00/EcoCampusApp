import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { buildingsController } from '../controllers/buildings.controller';
import { validateBody, validateParams, createBuildingSchema, updateBuildingSchema, buildingParamsSchema, buildingClassroomsParamsSchema } from '../validators';
import { classroomsService } from '../services/classrooms.service';
import { sendSuccess } from '../utils';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(buildingsController.list));
router.get('/:id', validateParams(buildingParamsSchema), asyncHandler(buildingsController.getById));
router.get('/:buildingId/classrooms', validateParams(buildingClassroomsParamsSchema), asyncHandler(async (req, res) => {
	const data = await classroomsService.listClassrooms(String(req.params.buildingId));
	return sendSuccess(res, 200, 'Salones del edificio obtenidos correctamente.', data);
}));
router.get('/:id/metrics', authorize('ADMIN', 'MAINTENANCE'), validateParams(buildingParamsSchema), asyncHandler(buildingsController.metrics));
router.post('/', authorize('ADMIN'), validateBody(createBuildingSchema), asyncHandler(buildingsController.create));
router.patch('/:id', authorize('ADMIN'), validateParams(buildingParamsSchema), validateBody(updateBuildingSchema), asyncHandler(buildingsController.update));
router.delete('/:id', authorize('ADMIN'), validateParams(buildingParamsSchema), asyncHandler(buildingsController.remove));

export default router;
