// Modelos y DTOs de Classroom.
// Este archivo define la estructura de salones y su relación con edificios.

export type ClassroomStatus = 'ACTIVE' | 'INACTIVE';
export type ClassroomType = 'CLASSROOM' | 'LABORATORY' | 'OFFICE' | 'LIBRARY' | 'COMMON_AREA';

export interface ClassroomModel {
	id: string;
	buildingId: string;
	name: string;
	floor: number;
	capacity: number;
	type: ClassroomType;
	status: ClassroomStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateClassroomDTO {
	buildingId: string;
	name: string;
	floor: number;
	capacity: number;
	type: ClassroomType;
	status?: ClassroomStatus;
}
