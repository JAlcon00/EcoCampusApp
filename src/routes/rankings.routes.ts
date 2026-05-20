import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { rankingsController } from '../controllers/rankings.controller';
import { authorize } from '../middlewares/auth';

const router = Router();

router.get('/buildings', authenticate, asyncHandler(rankingsController.listBuildings));
router.get('/classrooms', authenticate, asyncHandler(rankingsController.listClassrooms));
router.post('/compute', authenticate, authorize('ADMIN'), asyncHandler(rankingsController.compute));

export default router;
