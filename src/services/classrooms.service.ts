import { AppError } from '../middlewares/error';
import { buildingsRepository } from '../repositories/buildings.repository';
import { classroomsRepository } from '../repositories/classrooms.repository';

export const classroomsService = {
	listClassrooms: (buildingId?: string) => {
		return classroomsRepository.findManyByBuilding(buildingId);
	},
	getClassroomById: async (id: string) => {
		const classroom = await classroomsRepository.findById(id);
		if (!classroom) {
			throw new AppError('El salón no existe.', 404);
		}

		return classroom;
	},
	createClassroom: async (input: {
		buildingId: string;
		name: string;
		floor: number;
		capacity: number;
		type: 'CLASSROOM' | 'LABORATORY' | 'OFFICE' | 'LIBRARY' | 'COMMON_AREA';
		status?: 'ACTIVE' | 'INACTIVE';
	}) => {
		const building = await buildingsRepository.findById(input.buildingId);
		if (!building) {
			throw new AppError('El edificio asociado no existe.', 404);
		}

		return classroomsRepository.create(input);
	},
	updateClassroom: async (
		id: string,
		input: Partial<{
			buildingId: string;
			name: string;
			floor: number;
			capacity: number;
			type: 'CLASSROOM' | 'LABORATORY' | 'OFFICE' | 'LIBRARY' | 'COMMON_AREA';
			status: 'ACTIVE' | 'INACTIVE';
		}>
	) => {
		const classroom = await classroomsRepository.findById(id);
		if (!classroom) {
			throw new AppError('El salón no existe.', 404);
		}

		if (input.buildingId) {
			const building = await buildingsRepository.findById(input.buildingId);
			if (!building) {
				throw new AppError('El edificio asociado no existe.', 404);
			}
		}

		return classroomsRepository.update(id, input);
	},
	deleteClassroom: async (id: string) => {
		const classroom = await classroomsRepository.findById(id);
		if (!classroom) {
			throw new AppError('El salón no existe.', 404);
		}

		await classroomsRepository.delete(id);
		return null;
	},
};
