import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/error';
import { usersRepository } from '../repositories/users.repository';

const safeUser = (user: Awaited<ReturnType<typeof usersRepository.findById>> | null) => {
	if (!user) {
		return null;
	}

	const { passwordHash: _passwordHash, ...rest } = user;
	return rest;
};

export const usersService = {
	listUsers: async () => {
		const users = await usersRepository.findMany();
		return users.map((user) => safeUser(user as never));
	},
	getUserById: async (id: string) => {
		const user = await usersRepository.findById(id);
		if (!user) {
			throw new AppError('El usuario no existe.', 404);
		}

		return safeUser(user);
	},
	createUser: async (input: {
		name: string;
		email: string;
		password: string;
		role: 'ADMIN' | 'MAINTENANCE' | 'STUDENT';
		status?: 'ACTIVE' | 'INACTIVE';
	}) => {
		const passwordHash = await bcrypt.hash(input.password, 10);
		const user = await usersRepository.create({
			name: input.name,
			email: input.email,
			passwordHash,
			role: input.role,
			status: input.status,
		});

		return safeUser(user);
	},
	updateUser: async (
		id: string,
		input: Partial<{
			name: string;
			email: string;
			password: string;
			role: 'ADMIN' | 'MAINTENANCE' | 'STUDENT';
			status: 'ACTIVE' | 'INACTIVE';
		}>
	) => {
		const existing = await usersRepository.findById(id);
		if (!existing) {
			throw new AppError('El usuario no existe.', 404);
		}

		const data: Record<string, unknown> = {
			name: input.name,
			email: input.email,
			role: input.role,
			status: input.status,
		};

		if (input.password) {
			data.passwordHash = await bcrypt.hash(input.password, 10);
		}

		const user = await usersRepository.update(id, data as never);
		return safeUser(user);
	},
	deleteUser: async (id: string) => {
		await usersRepository.delete(id);
		return null;
	},
};
