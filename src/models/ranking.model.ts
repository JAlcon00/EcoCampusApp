// Modelos y DTOs de SavingRanking.
// Este archivo representa rankings de ahorro energético y comparativas.

export type RankingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface SavingRankingModel {
	id: string;
	buildingId: string | null;
	classroomId: string | null;
	period: RankingPeriod;
	previousConsumption: string;
	currentConsumption: string;
	estimatedSaving: string;
	savingPercentage: string;
	position: number;
	calculatedAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateSavingRankingDTO {
	buildingId?: string | null;
	classroomId?: string | null;
	period: RankingPeriod;
	previousConsumption: string;
	currentConsumption: string;
	estimatedSaving: string;
	savingPercentage: string;
	position: number;
	calculatedAt: Date;
}
