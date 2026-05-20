// Modelos y DTOs del módulo ai.
// Este archivo define las estructuras de entrada y salida para análisis, predicciones y recomendaciones.

export interface AiAnalysisRequestDTO {
	period?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	buildingId?: string;
	classroomId?: string;
	sensorId?: string;
	from?: Date;
	to?: Date;
}

export interface AiRecommendationDTO {
	title: string;
	description: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	targetType: 'BUILDING' | 'CLASSROOM' | 'SENSOR' | 'GENERAL';
	targetId?: string;
}

export interface AiPredictionDTO {
	forecastPeriod: string;
	predictedConsumption: string;
	confidence: number;
}

export interface AiAnalysisResultDTO {
	summary: string;
	predictions: AiPredictionDTO[];
	recommendations: AiRecommendationDTO[];
	riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	generatedAt: Date;
}
