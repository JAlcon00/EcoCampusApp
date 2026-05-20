// Modelos y DTOs de Building.
// Este archivo define la estructura de edificios y sus datos de intercambio.

export type BuildingStatus = 'ACTIVE' | 'INACTIVE';

export interface BuildingModel {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	status: BuildingStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateBuildingDTO {
	name: string;
	description?: string | null;
	location?: string | null;
	status?: BuildingStatus;
}
