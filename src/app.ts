import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { httpLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { mountRoutes } from './routes';

export const app = express();
const publicPath = path.resolve(process.cwd(), 'public');

app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(express.static(publicPath));

app.get('/health', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'EcoCampus API running',
		data: { status: 'ok' },
		errors: null,
		statusCode: 200,
	});
});

mountRoutes(app);

app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
	app.listen(config.port, () => {
		console.log(`EcoCampus API running on port ${config.port}`);
	});
}
