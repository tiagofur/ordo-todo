import { PrismaService } from '../database/prisma.service';

/**
 * Minimal structural shapes of the Prisma OAuth delegates.
 *
 * Same rationale as `api-token.delegate.ts`: the generated client in a
 * fresh checkout predates these models until `prisma generate` runs.
 * Unit tests mock these delegates. A typed getter on PrismaService can
 * replace these accessors once the client is regenerated.
 */
export interface OAuthClientRecord {
  id: string;
  clientId: string;
  clientName: string;
  metadataUrl: string | null;
  redirectUris: string[];
  scopes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthAuthorizationCodeRecord {
  id: string;
  code: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
  codeChallengeMethod: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface OAuthRefreshTokenRecord {
  id: string;
  tokenHash: string;
  tokenPrefix: string;
  userId: string;
  clientId: string;
  scopes: string[];
  expiresAt: Date;
  createdAt: Date;
}

interface DelegateClient {
  create(args: {
    data: {
      clientId: string;
      clientName: string;
      metadataUrl?: string;
      redirectUris: string[];
      scopes: string[];
    };
  }): Promise<OAuthClientRecord>;
  findUnique(args: {
    where: { clientId: string };
  }): Promise<OAuthClientRecord | null>;
}

interface DelegateCode {
  create(args: {
    data: {
      code: string;
      userId: string;
      clientId: string;
      redirectUri: string;
      scopes: string[];
      codeChallenge: string;
      codeChallengeMethod: string;
      expiresAt: Date;
    };
  }): Promise<OAuthAuthorizationCodeRecord>;
  findUnique(args: {
    where: { code: string };
  }): Promise<OAuthAuthorizationCodeRecord | null>;
  delete(args: {
    where: { id: string };
  }): Promise<OAuthAuthorizationCodeRecord>;
}

interface DelegateRefreshToken {
  create(args: {
    data: {
      tokenHash: string;
      tokenPrefix: string;
      userId: string;
      clientId: string;
      scopes: string[];
      expiresAt: Date;
    };
  }): Promise<OAuthRefreshTokenRecord>;
  findUnique(args: {
    where: { id: string };
  }): Promise<OAuthRefreshTokenRecord | null>;
  delete(args: { where: { id: string } }): Promise<OAuthRefreshTokenRecord>;
  deleteMany(args: {
    where: { clientId?: string; id?: string };
  }): Promise<{ count: number }>;
}

interface OAuthDelegates {
  oAuthClient: DelegateClient;
  oAuthAuthorizationCode: DelegateCode;
  oAuthRefreshToken: DelegateRefreshToken;
}

export function oAuthDelegates(prisma: PrismaService): OAuthDelegates {
  return prisma as unknown as OAuthDelegates;
}
