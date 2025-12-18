import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client
 * Prevents multiple instances in development hot reloading
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
