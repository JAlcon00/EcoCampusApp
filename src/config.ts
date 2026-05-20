import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value: string | undefined): string[] => {
	if (!value) {
		return ['http://localhost:3000'];
	}

	return value
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
};

export const config = {
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number(process.env.PORT ?? 3000),
	databaseUrl: process.env.DATABASE_URL ?? '',
	jwtSecret: process.env.JWT_SECRET ?? (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-key'),
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
	geminiApiKey: process.env.GEMINI_API_KEY ?? '',
	geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
	corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
};

export const isProduction = config.nodeEnv === 'production';
