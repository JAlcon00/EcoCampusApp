// Modelos y DTOs de EnergyReading.
// Este archivo representa lecturas de consumo energético y sus filtros.

export type ReadingSource = 'SIMULATED' | 'MANUAL' | 'IMPORTED';

export interface EnergyReadingModel {
	id: string;
	sensorId: string;
	value: string;
	unit: string;
	source: ReadingSource;
	recordedAt: Date;
	createdAt: Date;
}

export interface CreateEnergyReadingDTO {
	sensorId: string;
	value: string;
	unit: string;
	source: ReadingSource;
	recordedAt: Date;
}
