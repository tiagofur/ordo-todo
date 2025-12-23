"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// @ts-expect-error - PrismaClient may not be generated yet
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
/**
 * Singleton Prisma Client
 * Prevents multiple instances in development hot reloading
 * Note: Run `npx prisma generate` to generate the Prisma client
 */
exports.prisma = globalForPrisma.prisma ??
    (client_1.PrismaClient ? new client_1.PrismaClient() : null);
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
