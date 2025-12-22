import { PrismaClient } from "@prisma/client";
type PrismaClientType = typeof PrismaClient extends new () => infer T ? T : any;
/**
 * Singleton Prisma Client
 * Prevents multiple instances in development hot reloading
 * Note: Run `npx prisma generate` to generate the Prisma client
 */
export declare const prisma: PrismaClientType;
export default prisma;
//# sourceMappingURL=client.d.ts.map