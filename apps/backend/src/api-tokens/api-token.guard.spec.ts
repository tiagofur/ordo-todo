import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiTokenGuard } from './api-token.guard';
import { ApiTokensService } from './api-tokens.service';
import { PrismaService } from '../database/prisma.service';

describe('ApiTokenGuard', () => {
  const mockApiTokensService = {
    validateToken: jest.fn(),
  };
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const guard = new ApiTokenGuard(
    mockApiTokensService as unknown as ApiTokensService,
    mockPrismaService as unknown as PrismaService,
  );

  const mockContext = (authorization?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          get: (header: string) =>
            header.toLowerCase() === 'authorization'
              ? authorization
              : undefined,
          headers: { authorization },
        }),
      }),
    }) as unknown as ExecutionContext;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should attach user and token info for a valid PAT', async () => {
    const request: Record<string, unknown> = {
      get: () => 'Bearer ordo_pat_valid0000000000001',
      headers: {},
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
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
    expect(request.apiToken).toEqual({ id: 'token-1', scopes: ['read'] });
  });

  it('should throw 401 when the header is missing, not a PAT, invalid, or ownerless', async () => {
    await expect(guard.canActivate(mockContext(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(
      guard.canActivate(mockContext('Bearer some.jwt.token')),
    ).rejects.toThrow(UnauthorizedException);

    mockApiTokensService.validateToken.mockResolvedValue(null);
    await expect(
      guard.canActivate(mockContext('Bearer ordo_pat_revoked000000001')),
    ).rejects.toThrow(UnauthorizedException);

    mockApiTokensService.validateToken.mockResolvedValue({
      userId: 'ghost',
      tokenId: 'token-9',
      scopes: ['read'],
    });
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    await expect(
      guard.canActivate(mockContext('Bearer ordo_pat_ghost00000000002')),
    ).rejects.toThrow(UnauthorizedException);
  });
});
