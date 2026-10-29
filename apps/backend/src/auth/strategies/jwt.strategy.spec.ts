import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';

// ODD 024: separación first-party vs terceros. Los tokens `oauth_access` con
// claim `api: 'full'` (clientes en OAUTH_FIRST_PARTY_CLIENT_IDS) autentican la
// API completa; los de clientes de terceros quedan limitados a MCP y aquí
// reciben 401.
describe('JwtStrategy (ODD 024: OAuth first-party en /api/v1)', () => {
  let strategy: JwtStrategy;
  let authService: { validateUser: jest.Mock; validateUserById: jest.Mock };
  let tokenBlacklistService: { isBlacklisted: jest.Mock };

  const reqWithBearer = (raw: string) => ({
    get: (header: string) =>
      header.toLowerCase() === 'authorization' ? `Bearer ${raw}` : undefined,
    cookies: {},
  });

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      validateUserById: jest.fn(),
    };
    tokenBlacklistService = {
      isBlacklisted: jest.fn().mockResolvedValue(false),
    };

    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: authService },
        { provide: TokenBlacklistService, useValue: tokenBlacklistService },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('token de sesión regular sigue resolviéndose por email (regresión)', async () => {
    const sessionUser = { id: 'u1', email: 'a@b.c' };
    authService.validateUser.mockResolvedValue(sessionUser);

    const result = await strategy.validate(reqWithBearer('tok'), {
      tokenType: 'access',
      sub: 'u1',
      email: 'a@b.c',
      name: 'Ana',
    });

    expect(authService.validateUser).toHaveBeenCalledWith('a@b.c');
    expect(authService.validateUserById).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'u1', email: 'a@b.c', name: 'Ana' });
  });

  it('oauth_access de cliente first-party (api: full) autentica resolviendo por sub', async () => {
    const user = {
      id: 'u9',
      email: 'o@r.do',
      username: 'owner',
      name: 'Owner',
    };
    authService.validateUserById.mockResolvedValue(user);

    const result = await strategy.validate(reqWithBearer('tok'), {
      tokenType: 'oauth_access',
      sub: 'u9',
      client_id: 'ext-first-party',
      scope: 'tasks:read tasks:write',
      api: 'full',
    });

    expect(authService.validateUserById).toHaveBeenCalledWith('u9');
    expect(authService.validateUser).not.toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it('oauth_access de cliente de tercero (sin api: full) es rechazado — sigue limitado a MCP', async () => {
    await expect(
      strategy.validate(reqWithBearer('tok'), {
        tokenType: 'oauth_access',
        sub: 'u9',
        client_id: 'chatgpt-third-party',
        scope: 'tasks:read',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(authService.validateUserById).not.toHaveBeenCalled();
  });

  it('oauth_access first-party de usuario inexistente o BLOCKED es rechazado', async () => {
    authService.validateUserById.mockResolvedValue(null);

    await expect(
      strategy.validate(reqWithBearer('tok'), {
        tokenType: 'oauth_access',
        sub: 'u-bloqueado',
        client_id: 'ext-first-party',
        api: 'full',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('oauth_access first-party revocado (blacklist) es rechazado', async () => {
    tokenBlacklistService.isBlacklisted.mockResolvedValue(true);

    await expect(
      strategy.validate(reqWithBearer('tok'), {
        tokenType: 'oauth_access',
        sub: 'u9',
        client_id: 'ext-first-party',
        api: 'full',
      }),
    ).rejects.toThrow('Token has been revoked');
    expect(authService.validateUserById).not.toHaveBeenCalled();
  });

  it('token con tokenType distinto de access/oauth_access sigue rechazado', async () => {
    await expect(
      strategy.validate(reqWithBearer('tok'), {
        tokenType: 'refresh',
        sub: 'u1',
      }),
    ).rejects.toThrow('Invalid token type');
  });
});
