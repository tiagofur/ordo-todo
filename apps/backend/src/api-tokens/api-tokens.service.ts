import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { AuthAuditService } from '../auth/auth-audit.service';
import { AuthEventType } from '../auth/types/auth-event.types';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { apiTokenDelegate } from './api-token.delegate';
import {
  API_TOKEN_PREFIX,
  API_TOKEN_SCOPES,
  BCRYPT_ROUNDS,
} from './api-token.constants';

export interface CreatedApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  createdAt: Date;
  token: string;
}

export interface ApiTokenSummary {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  createdAt: Date;
}

export interface ValidatedApiToken {
  userId: string;
  tokenId: string;
  scopes: string[];
}

@Injectable()
export class ApiTokensService {
  private readonly logger = new Logger(ApiTokensService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(AuthAuditService)
    private readonly audit?: AuthAuditService,
  ) {}

  async create(
    userId: string,
    dto: CreateApiTokenDto,
  ): Promise<CreatedApiToken> {
    const unknown = dto.scopes.filter(
      (scope) => !(API_TOKEN_SCOPES as readonly string[]).includes(scope),
    );
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown scopes: ${unknown.join(', ')}`);
    }

    const token = `${API_TOKEN_PREFIX}${randomBytes(24).toString('base64url')}`;
    const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
    const tokenPrefix = token.slice(-8);

    const created = await apiTokenDelegate(this.prisma).create({
      data: {
        userId,
        name: dto.name,
        tokenHash,
        tokenPrefix,
        scopes: dto.scopes,
      },
    });

    this.logger.log(
      `API token created for user ${userId} (token ${created.id})`,
    );
    await this.audit?.logEvent({
      type: AuthEventType.PAT_CREATED,
      userId,
      timestamp: new Date(),
      metadata: { tokenId: created.id, tokenPrefix, scopes: dto.scopes },
    });

    return {
      id: created.id,
      name: created.name,
      tokenPrefix: created.tokenPrefix,
      scopes: created.scopes,
      createdAt: created.createdAt,
      token,
    };
  }

  async list(userId: string): Promise<ApiTokenSummary[]> {
    const tokens = await apiTokenDelegate(this.prisma).findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens.map((token) => ({
      id: token.id as string,
      name: token.name as string,
      tokenPrefix: token.tokenPrefix as string,
      scopes: token.scopes ?? [],
      createdAt: token.createdAt as Date,
    }));
  }

  async revoke(userId: string, tokenId: string): Promise<void> {
    const result = await apiTokenDelegate(this.prisma).deleteMany({
      where: { id: tokenId, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('API token not found');
    }

    this.logger.log(`API token ${tokenId} revoked by user ${userId}`);
    await this.audit?.logEvent({
      type: AuthEventType.PAT_REVOKED,
      userId,
      timestamp: new Date(),
      metadata: { tokenId },
    });
  }

  async validateToken(rawToken: string): Promise<ValidatedApiToken | null> {
    if (
      !rawToken ||
      !rawToken.startsWith(API_TOKEN_PREFIX) ||
      rawToken.length < API_TOKEN_PREFIX.length + 8
    ) {
      return null;
    }

    const candidates = await apiTokenDelegate(this.prisma).findMany({
      where: { tokenPrefix: rawToken.slice(-8) },
    });

    for (const candidate of candidates) {
      if (
        candidate.tokenHash &&
        (await bcrypt.compare(rawToken, candidate.tokenHash))
      ) {
        return {
          userId: candidate.userId as string,
          tokenId: candidate.id as string,
          scopes: candidate.scopes ?? [],
        };
      }
    }

    return null;
  }
}
