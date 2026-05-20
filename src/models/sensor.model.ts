// Modelos y DTOs de Sensor.
// Este archivo define la estructura de sensores simulados y su estado.

export type SensorType = 'ENERGY' | 'AIR_CONDITIONING' | 'LIGHTING' | 'OCCUPANCY';
export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface SensorModel {
	id: string;
	classroomId: string;
	name: string;
	type: SensorType;
	unit: string;
	status: SensorStatus;
	installedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateSensorDTO {
	classroomId: string;
	name: string;
	type: SensorType;
	unit: string;
	status?: SensorStatus;
	installedAt?: Date;
}
