import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { aiRepository } from '../repositories/ai.repository';
import { readingsRepository } from '../repositories/readings.repository';
import { alertsRepository } from '../repositories/alerts.repository';
import { rankingsService } from './rankings.service';
import { getPeriodBounds, groupBy, sumNumbers, toNumber } from '../utils';

const promptPath = path.resolve(process.cwd(), 'src/prompts/ai.master.prompt.md');

const resolveRiskLevel = (savingPercentage: number, activeAlerts: number) => {
	if (activeAlerts >= 8 || savingPercentage < -15) {
		return 'CRITICAL' as const;
	}

	if (activeAlerts >= 4 || savingPercentage < 0) {
		return 'HIGH' as const;
	}

	if (savingPercentage < 8) {
		return 'MEDIUM' as const;
	}

	return 'LOW' as const;
};

const buildCuratedContext = async (filters: {
	period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	buildingId?: string;
	classroomId?: string;
	sensorId?: string;
}) => {
	const bounds = getPeriodBounds(filters.period);
	const [currentReadings, previousReadings, activeAlerts, rankings] = await Promise.all([
		readingsRepository.findMany({
			buildingId: filters.buildingId,
			classroomId: filters.classroomId,
			sensorId: filters.sensorId,
			from: bounds.current.from,
			to: bounds.current.to,
		}),
		readingsRepository.findMany({
			buildingId: filters.buildingId,
			classroomId: filters.classroomId,
			sensorId: filters.sensorId,
			from: bounds.previous.from,
			to: bounds.previous.to,
		}),
		alertsRepository.findMany({
			status: 'ACTIVE',
			buildingId: filters.buildingId,
			classroomId: filters.classroomId,
			sensorId: filters.sensorId,
		}),
		rankingsService.getRankings(filters.period, filters.classroomId ? 'classroom' : 'building'),
	]);

	const currentConsumption = sumNumbers(currentReadings.map((reading) => toNumber(reading.value)));
	const previousConsumption = sumNumbers(previousReadings.map((reading) => toNumber(reading.value)));
	const savingPercentage = previousConsumption === 0 ? 0 : Number((((previousConsumption - currentConsumption) / previousConsumption) * 100).toFixed(2));
	const activeAlertCount = activeAlerts.length;
	const groupedByBuilding = groupBy(currentReadings, (reading) => reading.sensor.classroom.building.id);
	const topBuildings = Object.entries(groupedByBuilding)
		.map(([buildingId, readings]) => ({
			buildingId,
			buildingName: readings[0]?.sensor.classroom.building.name ?? 'Sin nombre',
			consumption: sumNumbers(readings.map((reading) => toNumber(reading.value))),
		}))
		.sort((left, right) => right.consumption - left.consumption)
		.slice(0, 3);

	return {
		period: filters.period,
		buildingId: filters.buildingId ?? null,
		classroomId: filters.classroomId ?? null,
		sensorId: filters.sensorId ?? null,
		currentConsumption,
		previousConsumption,
		savingPercentage,
		activeAlertCount,
		topBuildings,
		rankings: rankings.results.slice(0, 5),
		recommendedRiskLevel: resolveRiskLevel(savingPercentage, activeAlertCount),
	};
};

const buildFallbackAnalysis = (context: Awaited<ReturnType<typeof buildCuratedContext>>) => {
	const summary = `Periodo ${context.period}: consumo actual ${context.currentConsumption} kWh, consumo previo ${context.previousConsumption} kWh, ahorro estimado ${context.savingPercentage}%.`;
	const predictions = [
		{
			forecastPeriod: context.period,
			predictedConsumption: String(Number((context.currentConsumption * 1.05).toFixed(4))),
			confidence: context.activeAlertCount > 5 ? 58 : 72,
		},
	];
	const recommendations = [
		{
			title: 'Revisar consumos más altos',
			description: 'Priorizar los edificios con mayor consumo actual y validar si existen salones vacíos o sensores en mantenimiento.',
			priority: context.recommendedRiskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
			targetType: context.buildingId ? 'BUILDING' : 'GENERAL',
			targetId: context.buildingId ?? undefined,
		},
		{
			title: 'Cruzar ocupación con iluminación y climatización',
			description: 'Buscar escenarios donde existan lecturas de consumo con baja o nula ocupación.',
			priority: 'MEDIUM',
			targetType: 'GENERAL',
		},
	];

	return {
		summary,
		predictions,
		recommendations,
		riskLevel: context.recommendedRiskLevel,
	};
};

const callGemini = async (prompt: string) => {
	if (!config.geminiApiKey) {
		return null;
	}

	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.2,
				responseMimeType: 'application/json',
			},
		}),
	});

	if (!response.ok) {
		return null;
	}

	const payload = (await response.json()) as {
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
	};
	const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text) as {
			summary: string;
			predictions: Array<{ forecastPeriod: string; predictedConsumption: string; confidence: number }>;
			recommendations: Array<{ title: string; description: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; targetType: 'BUILDING' | 'CLASSROOM' | 'SENSOR' | 'GENERAL'; targetId?: string }>;
			riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
		};
	} catch {
		return null;
	}
};

export const aiService = {
	analyzeCampus: async (filters: {
		period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
		buildingId?: string;
		classroomId?: string;
		sensorId?: string;
	}) => {
		const curatedContext = await buildCuratedContext(filters);
		const masterPrompt = await fs.readFile(promptPath, 'utf8');
		const composedPrompt = `${masterPrompt}\n\n### CONTEXTO ESTRUCTURADO\n${JSON.stringify(curatedContext, null, 2)}`;
		const modelResponse = await callGemini(composedPrompt);
		const result = modelResponse ?? buildFallbackAnalysis(curatedContext);

		const saved = await aiRepository.createAnalysis({
			period: filters.period,
			buildingId: filters.buildingId ?? null,
			classroomId: filters.classroomId ?? null,
			sensorId: filters.sensorId ?? null,
			summary: result.summary,
			predictions: result.predictions as never,
			recommendations: result.recommendations as never,
			riskLevel: result.riskLevel,
			modelName: config.geminiModel,
			promptVersion: 'ai.master.prompt.md',
			context: curatedContext as never,
			generatedAt: new Date(),
		});

		return {
			analysis: saved,
			curatedContext,
		};
	},
	getLatestAnalysis: async (filters: {
		period?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
		buildingId?: string;
		classroomId?: string;
		sensorId?: string;
	}) => {
		return aiRepository.findLatest(filters);
	},
};// Service del módulo ai.
// Este archivo construirá el contexto con históricos de consumo y lo enviará al modelo Gemini 2.5 Flash.

// Responsabilidades conceptuales:
// - Consultar lecturas agregadas desde la base de datos.
// - Preparar el contexto con métricas relevantes.
// - Aplicar el prompt maestro.
// - Procesar la respuesta de la IA.
// - Guardar resultados relevantes para el dashboard.
