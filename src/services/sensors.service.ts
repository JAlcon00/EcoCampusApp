import { AppError } from '../middlewares/error';
import { classroomsRepository } from '../repositories/classrooms.repository';
import { sensorsRepository } from '../repositories/sensors.repository';

export const sensorsService = {
	listSensors: (classroomId?: string) => {
		return sensorsRepository.findManyByClassroom(classroomId);
	},
	getSensorById: async (id: string) => {
		const sensor = await sensorsRepository.findById(id);
		if (!sensor) {
			throw new AppError('El sensor no existe.', 404);
		}

		return sensor;
	},
	createSensor: async (input: {
		classroomId: string;
		name: string;
		type: 'ENERGY' | 'AIR_CONDITIONING' | 'LIGHTING' | 'OCCUPANCY';
		unit: string;
		status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
		installedAt?: Date;
	}) => {
		const classroom = await classroomsRepository.findById(input.classroomId);
		if (!classroom) {
			throw new AppError('El salón asociado no existe.', 404);
		}

		return sensorsRepository.create(input);
	},
	updateSensor: async (
		id: string,
		input: Partial<{
			classroomId: string;
			name: string;
			type: 'ENERGY' | 'AIR_CONDITIONING' | 'LIGHTING' | 'OCCUPANCY';
			unit: string;
			status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
			installedAt: Date;
		}>
	) => {
		const sensor = await sensorsRepository.findById(id);
		if (!sensor) {
			throw new AppError('El sensor no existe.', 404);
		}

		if (input.classroomId) {
			const classroom = await classroomsRepository.findById(input.classroomId);
			if (!classroom) {
				throw new AppError('El salón asociado no existe.', 404);
			}
		}

		return sensorsRepository.update(id, input);
	},
	updateSensorState: async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') => {
		const sensor = await sensorsRepository.findById(id);
		if (!sensor) {
			throw new AppError('El sensor no existe.', 404);
		}

		return sensorsRepository.update(id, { status });
	},
	deleteSensor: async (id: string) => {
		const sensor = await sensorsRepository.findById(id);
		if (!sensor) {
			throw new AppError('El sensor no existe.', 404);
		}

		await sensorsRepository.delete(id);
		return null;
	},
};
