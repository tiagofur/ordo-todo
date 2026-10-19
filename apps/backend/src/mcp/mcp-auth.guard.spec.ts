import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { McpAuthGuard } from './mcp-auth.guard';
import { OAuthGuard } from '../oauth/oauth.guard';
import { ApiTokenGuard } from '../api-tokens/api-token.guard';
import { ApiTokensService } from '../api-tokens/api-tokens.service';
import { PrismaService } from '../database/prisma.service';

describe('McpAuthGuard', () => {
  const mockJwtService = { verifyAsync: jest.fn() };
  const mockApiTokensService = { validateToken: jest.fn() };
  const mockPrismaService = { user: { findUnique: jest.fn() } };
  const mockReflector = { getAllAndOverride: jest.fn() };

  const oAuthGuard = new OAuthGuard(
    mockJwtService as unknown as JwtService,
    mockPrismaService as unknown as PrismaService,
  );
  const patGuard = new ApiTokenGuard(
    mockApiTokensService as unknown as ApiTokensService,
    mockPrismaService as unknown as PrismaService,
  );
  const guard = new McpAuthGuard(
    mockReflector as unknown as Reflector,
    oAuthGuard,
    patGuard,
  );

  const userRow = {
    id: 'user-123',
    email: 'a@b.c',
    username: 'ana',
    name: 'Ana',
  };

  function mockContext(authorization?: string) {
    const request: Record<string, unknown> = {
      get: (header: string) =>
        header.toLowerCase() === 'authorization' ? authorization : undefined,
      headers: { authorization },
    };
    const responseHeaders: Record<string, string> = {};
    const response = {
      header: jest.fn((name: string, value: string) => {
        responseHeaders[name] = value;
      }),
    };
    return {
      request,
      responseHeaders,
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
  });

  it('should accept an OAuth token with sufficient scopes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['tasks:write']);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-123',
      client_id: 'https://client.test',
      scope: 'read tasks:write',
      tokenType: 'oauth_access',
    });
    mockPrismaService.user.findUnique.mockResolvedValue(userRow);
    const { request, context } = mockContext('Bearer jwt-access-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(userRow);
    expect(request.mcpScopes).toEqual(['read', 'tasks:write']);
  });

  it('should accept a PAT with sufficient scopes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(['read']);
    mockApiTokensService.validateToken.mockResolvedValue({
      userId: 'user-123',
      tokenId: 'token-1',
      scopes: ['read'],
    });
    mockPrismaService.user.findUnique.mockResolvedValue(userRow);
    const { request, context } = mockContext('Bearer ordo_pat_valid0001');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(userRow);
    expect(request.mcpScopes).toEqual(['read']);
  });

  it('should throw 401 without a bearer token', async () => {
    const { context } = mockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw 403 with ALL missing scopes and WWW-Authenticate', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      'tasks:write',
      'projects:write',
      'admin:webhooks',
    ]);
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-123',
      client_id: 'https://client.test',
      scope: 'read',
      tokenType: 'oauth_access',
    });
    mockPrismaService.user.findUnique.mockResolvedValue(userRow);
    const { responseHeaders, context } = mockContext('Bearer jwt-token');

    const promise = guard.canActivate(context);
    await expect(promise).rejects.toThrow(ForbiddenException);
    await promise.catch((error: ForbiddenException) => {
      const body = error.getResponse() as { missingScopes: string[] };
      expect(body.missingScopes).toEqual([
        'tasks:write',
        'projects:write',
        'admin:webhooks',
      ]);
    });
    expect(responseHeaders['WWW-Authenticate']).toContain(
      'scope="tasks:write projects:write admin:webhooks"',
    );
  });

  it('should allow any authenticated token when no scopes are required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    mockApiTokensService.validateToken.mockResolvedValue({
      userId: 'user-123',
      tokenId: 'token-1',
      scopes: [],
    });
    mockPrismaService.user.findUnique.mockResolvedValue(userRow);
    const { context } = mockContext('Bearer ordo_pat_valid0001');

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
