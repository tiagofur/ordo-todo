import { PrismaService } from '../database/prisma.service';

/**
 * Minimal structural shape of the Prisma `ApiToken` delegate.
 *
 * The generated client in a fresh checkout predates the `ApiToken` model
 * until `prisma generate` runs (normal CI/deploy flow). Accessing the
 * delegate through this structural interface keeps this module compiling
 * and fully testable (unit tests mock the delegate) without coupling to
 * the generated types. At runtime the real delegate exists, so the cast
 * below is a no-op. A typed `apiToken` getter on PrismaService can
 * replace this accessor once the client is regenerated.
 */
export interface ApiTokenRecord {
  id: string;
  userId: string;
  name: string;
  tokenHash: string;
  tokenPrefix: string;
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiTokenDelegate {
  create(args: {
    data: {
      userId: string;
      name: string;
      tokenHash: string;
      tokenPrefix: string;
      scopes: string[];
    };
  }): Promise<ApiTokenRecord>;

  findMany(args: {
    where: { userId?: string; tokenPrefix?: string };
    select?: Record<string, boolean>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Partial<ApiTokenRecord>[]>;

  deleteMany(args: {
    where: { id: string; userId: string };
  }): Promise<{ count: number }>;
}

export function apiTokenDelegate(prisma: PrismaService): ApiTokenDelegate {
  return (prisma as unknown as { apiToken: ApiTokenDelegate }).apiToken;
}
