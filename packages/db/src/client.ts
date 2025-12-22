// @ts-expect-error - PrismaClient may not be generated yet
import { PrismaClient } from "@prisma/client";

type PrismaClientType = typeof PrismaClient extends new () => infer T ? T : any;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientType | undefined;
};

/**
 * Singleton Prisma Client
 * Prevents multiple instances in development hot reloading
 * Note: Run `npx prisma generate` to generate the Prisma client
 */
export const prisma: PrismaClientType =
    globalForPrisma.prisma ??
    (PrismaClient ? new PrismaClient() : null);

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
