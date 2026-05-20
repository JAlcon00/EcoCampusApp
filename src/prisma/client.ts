import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: isProduction ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
	});

if (!isProduction) {
	globalForPrisma.prisma = prisma;
}
