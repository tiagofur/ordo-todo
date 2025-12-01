/**
 * @ordo-todo/db
 * Shared database package with Prisma client
 */

// Export Prisma client singleton
export { prisma, default as db } from "./client";

// Re-export all Prisma types for convenience
export * from "@prisma/client";
