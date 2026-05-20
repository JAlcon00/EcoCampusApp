import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils';
import { usersService } from '../services/users.service';

export const usersController = {
	list: async (_req: AuthenticatedRequest, res: Response) => {
		const data = await usersService.listUsers();
		return sendSuccess(res, 200, 'Usuarios obtenidos correctamente.', data);
	},
	getById: async (req: AuthenticatedRequest, res: Response) => {
		const data = await usersService.getUserById(String(req.params.id));
		return sendSuccess(res, 200, 'Usuario obtenido correctamente.', data);
	},
	create: async (req: AuthenticatedRequest, res: Response) => {
		const data = await usersService.createUser(req.body);
		return sendSuccess(res, 201, 'Usuario creado correctamente.', data);
	},
	update: async (req: AuthenticatedRequest, res: Response) => {
		const data = await usersService.updateUser(String(req.params.id), req.body);
		return sendSuccess(res, 200, 'Usuario actualizado correctamente.', data);
	},
	remove: async (req: AuthenticatedRequest, res: Response) => {
		await usersService.deleteUser(String(req.params.id));
		return sendSuccess(res, 200, 'Usuario eliminado correctamente.', null);
	},
};
