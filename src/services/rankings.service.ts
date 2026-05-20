import type { RankingPeriod } from '@prisma/client';
import { readingsRepository } from '../repositories/readings.repository';
import { getPeriodBounds, groupBy, sumNumbers, calculatePercentage } from '../utils';

const buildScopeKey = (reading: Awaited<ReturnType<typeof readingsRepository.findMany>>[number], scope: 'building' | 'classroom') => {
	if (scope === 'building') {
		return reading.sensor.classroom.building.id;
	}

	return reading.sensor.classroom.id;
};

const buildScopeLabel = (reading: Awaited<ReturnType<typeof readingsRepository.findMany>>[number], scope: 'building' | 'classroom') => {
	if (scope === 'building') {
		return reading.sensor.classroom.building.name;
	}

	return reading.sensor.classroom.name;
};

export const rankingsService = {
	getRankings: async (period: RankingPeriod, scope: 'building' | 'classroom') => {
		const bounds = getPeriodBounds(period);
		const currentReadings = await readingsRepository.findMany({ from: bounds.current.from, to: bounds.current.to });
		const previousReadings = await readingsRepository.findMany({ from: bounds.previous.from, to: bounds.previous.to });

		const currentGroups = groupBy(currentReadings, (reading) => buildScopeKey(reading, scope));
		const previousGroups = groupBy(previousReadings, (reading) => buildScopeKey(reading, scope));
		const identifiers = new Set([...Object.keys(currentGroups), ...Object.keys(previousGroups)]);

		const results = Array.from(identifiers)
			.map((identifier) => {
				const currentConsumption = sumNumbers((currentGroups[identifier] ?? []).map((reading) => Number(reading.value)));
				const previousConsumption = sumNumbers((previousGroups[identifier] ?? []).map((reading) => Number(reading.value)));
				const estimatedSaving = Number((previousConsumption - currentConsumption).toFixed(4));
				const savingPercentage = calculatePercentage(previousConsumption, currentConsumption);
				const sampleReading = currentGroups[identifier]?.[0] ?? previousGroups[identifier]?.[0];

				if (!sampleReading) {
					return null;
				}

				return {
					id: identifier,
					name: buildScopeLabel(sampleReading, scope),
					previousConsumption,
					currentConsumption,
					estimatedSaving,
					savingPercentage,
				};
			})
			.filter((item): item is NonNullable<typeof item> => item !== null)
			.sort((left, right) => right.savingPercentage - left.savingPercentage)
			.map((item, index) => ({
				...item,
				position: index + 1,
			}));

		return {
			period,
			scope,
			results,
		};
	},
	computeAndPersist: async (period: RankingPeriod, scope: 'building' | 'classroom') => {
		const computed = await rankingsService.getRankings(period, scope);
		const now = new Date();
		const items = computed.results.map((r) => ({
			buildingId: scope === 'building' ? r.id : null,
			classroomId: scope === 'classroom' ? r.id : null,
			period,
			previousConsumption: r.previousConsumption,
			currentConsumption: r.currentConsumption,
			estimatedSaving: r.estimatedSaving,
			savingPercentage: r.savingPercentage,
			position: r.position,
			calculatedAt: now,
		}));

		const { rankingsRepository } = await import('../repositories/rankings.repository');
		await rankingsRepository.saveMany(items);
		return { period, scope, persisted: items.length };
	},
};// Service del módulo rankings.
// Este archivo servirá para calcular y consultar rankings de ahorro.
