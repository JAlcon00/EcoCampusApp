import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../utils';
import { usersController } from '../controllers/users.controller';
import { validateBody, validateParams, createUserSchema, updateUserSchema, userParamsSchema } from '../validators';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', asyncHandler(usersController.list));
router.post('/', validateBody(createUserSchema), asyncHandler(usersController.create));
router.get('/:id', validateParams(userParamsSchema), asyncHandler(usersController.getById));
router.patch('/:id', validateParams(userParamsSchema), validateBody(updateUserSchema), asyncHandler(usersController.update));
router.delete('/:id', validateParams(userParamsSchema), asyncHandler(usersController.remove));

export default router;
