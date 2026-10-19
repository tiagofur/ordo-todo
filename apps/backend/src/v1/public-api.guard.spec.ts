import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PublicApiGuard } from './public-api.guard';
import { ApiTokensService } from '../api-tokens/api-tokens.service';
import { PrismaService } from '../database/prisma.service';
import { ApiTokenGuard } from '../api-tokens/api-token.guard';

describe('PublicApiGuard', () => {
  const mockApiTokensService = {
    validateToken: jest.fn(),
  };
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const patGuard = new ApiTokenGuard(
    mockApiTokensService as unknown as ApiTokensService,
    mockPrismaService as unknown as PrismaService,
  );
  const guard = new PublicApiGuard(patGuard);

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockContext = (authorization?: string) => {
    const request: Record<string, unknown> = {
      get: (header: string) =>
        header.toLowerCase() === 'authorization' ? authorization : undefined,
      headers: { authorization },
    };
    return {
      request,
      context: {
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
    };
  };

  it('should accept a valid PAT and require nothing else', async () => {
    const { request, context } = mockContext('Bearer ordo_pat_valid0000001');
    mockApiTokensService.validateToken.mockResolvedValue({
      userId: 'user-123',
      tokenId: 'token-1',
      scopes: ['read'],
    });
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'a@b.c',
      username: 'ana',
      name: 'Ana',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-123',
      email: 'a@b.c',
      username: 'ana',
      name: 'Ana',
    });
  });

  it('should reject missing, non-PAT and invalid tokens with 401', async () => {
    await expect(
      guard.canActivate(mockContext(undefined).context),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      guard.canActivate(mockContext('Bearer some.jwt.token').context),
    ).rejects.toThrow(UnauthorizedException);

    mockApiTokensService.validateToken.mockResolvedValue(null);
    await expect(
      guard.canActivate(mockContext('Bearer ordo_pat_revoked0001').context),
    ).rejects.toThrow(UnauthorizedException);
  });
});
