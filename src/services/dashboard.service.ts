import type { RankingPeriod } from '@prisma/client';
import { alertsRepository } from '../repositories/alerts.repository';
import { readingsRepository } from '../repositories/readings.repository';
import { getPeriodBounds, groupBy, sumNumbers } from '../utils';

const calculateConsumptionByBuilding = async (period: RankingPeriod) => {
	const bounds = getPeriodBounds(period);
	const readings = await readingsRepository.findMany({ from: bounds.current.from, to: bounds.current.to });
	const grouped = groupBy(readings, (reading) => reading.sensor.classroom.building.id);

	return Object.entries(grouped)
		.map(([buildingId, items]) => ({
			buildingId,
			buildingName: items[0]?.sensor.classroom.building.name ?? 'Sin nombre',
			consumption: sumNumbers(items.map((reading) => Number(reading.value))),
		}))
		.sort((left, right) => right.consumption - left.consumption);
};

export const dashboardService = {
	getSummary: async (period: RankingPeriod, role: 'ADMIN' | 'MAINTENANCE' | 'STUDENT') => {
		const currentBounds = getPeriodBounds(period);
		const [currentReadings, previousReadings, activeAlerts] = await Promise.all([
			readingsRepository.findMany({ from: currentBounds.current.from, to: currentBounds.current.to }),
			readingsRepository.findMany({ from: currentBounds.previous.from, to: currentBounds.previous.to }),
			alertsRepository.countActive(),
		]);

		const currentConsumption = sumNumbers(currentReadings.map((reading) => Number(reading.value)));
		const previousConsumption = sumNumbers(previousReadings.map((reading) => Number(reading.value)));
		const estimatedSaving = Number((previousConsumption - currentConsumption).toFixed(4));
		const buildingConsumption = await calculateConsumptionByBuilding(period);

		const response = {
			period,
			role,
			currentConsumption,
			previousConsumption,
			estimatedSaving,
			activeAlerts,
			mostConsumingBuildings: buildingConsumption.slice(0, 3),
			efficientBuildings: [...buildingConsumption].sort((left, right) => left.consumption - right.consumption).slice(0, 3),
		};

		if (role === 'STUDENT') {
			return {
				period,
				role,
				currentConsumption: response.currentConsumption,
				estimatedSaving: response.estimatedSaving,
				activeAlerts,
				mostConsumingBuildings: response.mostConsumingBuildings,
			};
		}

		return response;
	},
};// Service del módulo dashboard.
// Este archivo servirá para consolidar métricas y KPIs del campus.
