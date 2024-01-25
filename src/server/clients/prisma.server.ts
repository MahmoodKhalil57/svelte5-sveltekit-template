import { PrismaClient, Prisma } from '@prisma/client';
export { Prisma };
export const prisma = new PrismaClient();

export type PrismaModels = {
	[M in Prisma.ModelName]: Exclude<
		Awaited<ReturnType<PrismaClient[Uncapitalize<M>]['findUnique']>>,
		null
	>;
};
