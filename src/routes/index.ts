import type { Express } from 'express';
import readingsRoutes from './readings.routes';
import alertsRoutes from './alerts.routes';
import rankingsRoutes from './rankings.routes';
import dashboardRoutes from './dashboard.routes';
import aiRoutes from './ai.routes';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import buildingsRoutes from './buildings.routes';
import classroomsRoutes from './classrooms.routes';
import sensorsRoutes from './sensors.routes';

export const mountRoutes = (app: Express) => {
	app.use('/api/auth', authRoutes);
	app.use('/api/users', usersRoutes);
	app.use('/api/buildings', buildingsRoutes);
	app.use('/api/classrooms', classroomsRoutes);
	app.use('/api/sensors', sensorsRoutes);
	app.use('/api/readings', readingsRoutes);
	app.use('/api/alerts', alertsRoutes);
	app.use('/api/rankings', rankingsRoutes);
	app.use('/api/dashboard', dashboardRoutes);
	app.use('/api/ai', aiRoutes);
};
