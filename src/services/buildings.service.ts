import { AppError } from '../middlewares/error';
import { buildingsRepository } from '../repositories/buildings.repository';

export const buildingsService = {
	listBuildings: () => {
		return buildingsRepository.findMany();
	},
	getBuildingById: async (id: string) => {
		const building = await buildingsRepository.findById(id);
		if (!building) {
			throw new AppError('El edificio no existe.', 404);
		}

		return building;
	},
	createBuilding: (input: {
		name: string;
		description?: string | null;
		location?: string | null;
		status?: 'ACTIVE' | 'INACTIVE';
	}) => {
		return buildingsRepository.create(input);
	},
	updateBuilding: async (
		id: string,
		input: Partial<{
			name: string;
			description: string | null;
			location: string | null;
			status: 'ACTIVE' | 'INACTIVE';
		}>
	) => {
		await buildingsRepository.findById(id) ?? (() => { throw new AppError('El edificio no existe.', 404); })();
		return buildingsRepository.update(id, input);
	},
	deleteBuilding: async (id: string) => {
		await buildingsRepository.findById(id) ?? (() => { throw new AppError('El edificio no existe.', 404); })();
		await buildingsRepository.delete(id);
		return null;
	},
	getMetrics: async (id: string) => {
		await buildingsRepository.findById(id) ?? (() => { throw new AppError('El edificio no existe.', 404); })();
		return buildingsRepository.metrics(id);
	},
};
