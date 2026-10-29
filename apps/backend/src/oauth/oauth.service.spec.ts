import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { OAuthService } from './oauth.service';
import { PrismaService } from '../database/prisma.service';

function sha256Base64Url(input: string): string {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

describe('OAuthService', () => {
  let service: OAuthService;

  const mockPrismaService = {
    oAuthClient: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    oAuthAuthorizationCode: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    oAuthRefreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'APP_URL') return 'https://ordo.test';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerClient (Client ID Metadata Document / DCR)', () => {
    const metadata = {
      client_name: 'Hermes',
      redirect_uris: ['https://hermes.test/callback'],
      scope: 'read tasks:write',
    };

    it('should register a client from a metadata URL, deriving client_id from origin', async () => {
      mockPrismaService.oAuthClient.create.mockImplementation(
        async ({ data }: any) => ({
          id: data.clientId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.registerClient(
        'https://hermes.test/.well-known/oauth-client',
        metadata,
      );

      expect(result.client_id).toBe('https://hermes.test');
      expect(result.client_name).toBe('Hermes');
      expect(result.redirect_uris).toEqual(['https://hermes.test/callback']);
      expect(result.scope).toBe('read tasks:write');
      expect(mockPrismaService.oAuthClient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clientId: 'https://hermes.test',
            metadataUrl: 'https://hermes.test/.well-known/oauth-client',
          }),
        }),
      );
    });

    it('should reject metadata URL mismatch and invalid redirects', async () => {
      await expect(
        service.registerClient('https://evil.test/meta', metadata),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.registerClient('https://hermes.test/meta', {
          ...metadata,
          redirect_uris: ['http://hermes.test/callback'],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.oAuthClient.create).not.toHaveBeenCalled();
    });

    it('should register a client via RFC 7591 DCR without a metadata URL', async () => {
      mockPrismaService.oAuthClient.create.mockImplementation(
        async ({ data }: any) => ({
          id: data.clientId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.registerClient(undefined, {
        client_name: 'ChatGPT',
        redirect_uris: [
          'https://chatgpt.com/connector_platform/oauth/callback',
        ],
        scope: 'read',
      });

      expect(result.client_id).toMatch(/^ordo_cl_/);
      expect(result.client_name).toBe('ChatGPT');
      expect(mockPrismaService.oAuthClient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadataUrl: undefined,
            redirectUris: [
              'https://chatgpt.com/connector_platform/oauth/callback',
            ],
          }),
        }),
      );
    });

    it('should drop OIDC and unknown scopes from a ChatGPT-style DCR request', async () => {
      mockPrismaService.oAuthClient.create.mockImplementation(
        async ({ data }: any) => ({ id: data.clientId, ...data }),
      );

      const result = await service.registerClient(undefined, {
        client_name: 'ChatGPT',
        redirect_uris: [
          'https://chatgpt.com/connector_platform/oauth/callback',
        ],
        scope: 'openid email profile read tasks:write banana',
      });

      expect(result.scope).toBe('read tasks:write');
      expect(mockPrismaService.oAuthClient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ scopes: ['read', 'tasks:write'] }),
        }),
      );
    });

    it('should create an open client when the registration only asks OIDC scopes', async () => {
      mockPrismaService.oAuthClient.create.mockImplementation(
        async ({ data }: any) => ({ id: data.clientId, ...data }),
      );

      const result = await service.registerClient(undefined, {
        client_name: 'ChatGPT',
        redirect_uris: [
          'https://chatgpt.com/connector_platform/oauth/callback',
        ],
        scope: 'openid email profile',
      });

      expect(result.scope).toBe('');
      expect(mockPrismaService.oAuthClient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ scopes: [] }),
        }),
      );
    });

    it('should re-register an open client idempotently even when scopes are requested', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValueOnce({
        clientId: 'ordo_cl_open',
        clientName: 'ChatGPT',
        metadataUrl: null,
        redirectUris: ['https://chatgpt.com/connector_platform/oauth/callback'],
        scopes: [],
      });

      const result = await service.registerClient(undefined, {
        client_name: 'ChatGPT',
        redirect_uris: [
          'https://chatgpt.com/connector_platform/oauth/callback',
        ],
        scope: 'read',
      });

      expect(result.client_id).toBe('ordo_cl_open');
      expect(result.scope).toBe('');
      expect(mockPrismaService.oAuthClient.create).not.toHaveBeenCalled();
    });

    it('should derive a DCR client_id from client_uri when provided', async () => {
      mockPrismaService.oAuthClient.create.mockImplementation(
        async ({ data }: any) => ({ id: data.clientId, ...data }),
      );

      const result = await service.registerClient(undefined, {
        client_name: 'Claude',
        redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
        client_uri: 'https://claude.ai',
      });

      // client_uri must NOT become the client id: anyone could
      // re-register a well-known origin and graft callbacks onto the
      // existing client (code phishing). DCR ids are always minted.
      expect(result.client_id).toMatch(/^ordo_cl_/);
      expect(result.client_id).not.toBe('https://claude.ai');
    });

    it('should reject DCR redirect URIs that are neither https nor loopback', async () => {
      await expect(
        service.registerClient(undefined, {
          client_name: 'Evil',
          redirect_uris: ['http://evil.test/callback'],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.oAuthClient.create).not.toHaveBeenCalled();
    });

    it('should re-register a CIMD client idempotently without widening it', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue({
        clientId: 'https://hermes.test',
        clientName: 'Hermes',
        redirectUris: ['https://hermes.test/callback'],
        scopes: ['read'],
      });

      const result = await service.registerClient(
        'https://hermes.test/.well-known/oauth-client',
        {
          client_name: 'Hermes',
          redirect_uris: ['https://hermes.test/callback'],
          scope: 'read',
        },
      );

      expect(result.client_id).toBe('https://hermes.test');
      expect(result.redirect_uris).toEqual(['https://hermes.test/callback']);
      expect(mockPrismaService.oAuthClient.create).not.toHaveBeenCalled();
      expect(mockPrismaService.oAuthClient.update).not.toHaveBeenCalled();
    });

    it('should reject a re-registration that tries to add redirect URIs or scopes', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue({
        clientId: 'https://hermes.test',
        clientName: 'Hermes',
        redirectUris: ['https://hermes.test/callback'],
        scopes: ['read'],
      });

      await expect(
        service.registerClient('https://hermes.test/.well-known/oauth-client', {
          client_name: 'Hermes',
          redirect_uris: ['https://hermes.test/callback-2'],
          scope: 'read',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.registerClient('https://hermes.test/.well-known/oauth-client', {
          client_name: 'Hermes',
          redirect_uris: ['https://hermes.test/callback'],
          scope: 'read tasks:write',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.oAuthClient.create).not.toHaveBeenCalled();
      expect(mockPrismaService.oAuthClient.update).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    const clientRecord = {
      id: 'client-1',
      clientId: 'https://hermes.test',
      clientName: 'Hermes',
      redirectUris: ['https://hermes.test/callback'],
      scopes: ['read', 'tasks:write'],
    };
    const verifier = 'verifier-0123456789abcdef-0123456789abcdef';
    const challenge = sha256Base64Url(verifier);

    it('should issue a single-use code bound to client, redirect, challenge and scope', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      mockPrismaService.oAuthAuthorizationCode.create.mockImplementation(
        async ({ data }: any) => ({ id: 'code-1', ...data }),
      );

      const result = await service.authorize({
        userId: 'user-123',
        clientId: 'https://hermes.test',
        redirectUri: 'https://hermes.test/callback',
        scope: 'read',
        state: 'xyz',
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      expect(result.redirectUri).toContain(
        'https://hermes.test/callback?code=',
      );
      expect(result.redirectUri).toContain('state=xyz');
      const stored =
        mockPrismaService.oAuthAuthorizationCode.create.mock.calls[0][0].data;
      expect(stored.userId).toBe('user-123');
      expect(stored.codeChallenge).toBe(challenge);
      expect(stored.code).not.toBe(result.redirectUri);
    });

    it('should reject unknown clients, bad redirects and out-of-scope requests', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(null);
      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://unknown.test',
          redirectUri: 'https://unknown.test/cb',
          scope: 'read',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        }),
      ).rejects.toThrow(NotFoundException);

      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://hermes.test',
          redirectUri: 'https://evil.test/cb',
          scope: 'read',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          scope: 'admin:webhooks',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(
        mockPrismaService.oAuthAuthorizationCode.create,
      ).not.toHaveBeenCalled();
    });

    it('should reject non-S256 PKCE', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          scope: 'read',
          codeChallenge: challenge,
          codeChallengeMethod: 'plain',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow any known scope for DCR clients registered without scopes', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue({
        ...clientRecord,
        scopes: [],
      });
      mockPrismaService.oAuthAuthorizationCode.create.mockImplementation(
        async ({ data }: any) => ({ id: 'code-1', ...data }),
      );

      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          scope: 'read tasks:write',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        }),
      ).resolves.toHaveProperty('redirectUri');

      const stored =
        mockPrismaService.oAuthAuthorizationCode.create.mock.calls[0][0].data;
      expect(stored.scopes).toEqual(['read', 'tasks:write']);
    });

    it('should grant the client scopes when no scope is requested', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      mockPrismaService.oAuthAuthorizationCode.create.mockImplementation(
        async ({ data }: any) => ({ id: 'code-1', ...data }),
      );

      await service.authorize({
        userId: 'user-123',
        clientId: 'https://hermes.test',
        redirectUri: 'https://hermes.test/callback',
        scope: '',
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      const stored =
        mockPrismaService.oAuthAuthorizationCode.create.mock.calls[0][0].data;
      expect(stored.scopes).toEqual(['read', 'tasks:write']);
    });

    it('should default to read-only when neither client nor request name scopes', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue({
        ...clientRecord,
        scopes: [],
      });
      mockPrismaService.oAuthAuthorizationCode.create.mockImplementation(
        async ({ data }: any) => ({ id: 'code-1', ...data }),
      );

      await service.authorize({
        userId: 'user-123',
        clientId: 'https://hermes.test',
        redirectUri: 'https://hermes.test/callback',
        scope: '',
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      const stored =
        mockPrismaService.oAuthAuthorizationCode.create.mock.calls[0][0].data;
      expect(stored.scopes).toEqual(['read']);
    });

    it('should reject a missing or too-short code_challenge', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      await expect(
        service.authorize({
          userId: 'user-123',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          scope: 'read',
          codeChallenge: '',
          codeChallengeMethod: 'S256',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('consent screen support', () => {
    const clientRecord = {
      id: 'client-1',
      clientId: 'ordo_cl_chatgpt',
      clientName: 'ChatGPT',
      redirectUris: ['https://chatgpt.com/aip/abc/oauth/callback'],
      scopes: [],
    };
    const challenge = sha256Base64Url(
      'verifier-0123456789abcdef-0123456789abcdef',
    );

    it('validateAuthorizeRequest returns the client and clamped scopes without minting a code', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);

      const result = await service.validateAuthorizeRequest({
        clientId: 'ordo_cl_chatgpt',
        redirectUri: 'https://chatgpt.com/aip/abc/oauth/callback',
        scope: 'read tasks:write bogus:scope',
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      expect(result.client.clientId).toBe('ordo_cl_chatgpt');
      expect(result.grantedScopes).toEqual(['read', 'tasks:write']);
      expect(
        mockPrismaService.oAuthAuthorizationCode.create,
      ).not.toHaveBeenCalled();
    });

    it('validateAuthorizeRequest rejects an unregistered redirect_uri', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);

      await expect(
        service.validateAuthorizeRequest({
          clientId: 'ordo_cl_chatgpt',
          redirectUri: 'https://evil.test/cb',
          scope: 'read',
          codeChallenge: challenge,
          codeChallengeMethod: 'S256',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('findLiveGrantScopes unions live tokens per user+client and returns null without one', async () => {
      mockPrismaService.oAuthRefreshToken.findMany.mockResolvedValue([
        { id: 'rt-1', scopes: ['read'], expiresAt: new Date() },
        {
          id: 'rt-2',
          scopes: ['read', 'tasks:write'],
          expiresAt: new Date(),
        },
      ]);
      await expect(
        service.findLiveGrantScopes('user-123', 'ordo_cl_chatgpt'),
      ).resolves.toEqual(['read', 'tasks:write']);

      const where =
        mockPrismaService.oAuthRefreshToken.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe('user-123');
      expect(where.clientId).toBe('ordo_cl_chatgpt');
      expect(where.expiresAt.gt).toBeInstanceOf(Date);

      mockPrismaService.oAuthRefreshToken.findMany.mockResolvedValue([]);
      await expect(
        service.findLiveGrantScopes('user-123', 'ordo_cl_chatgpt'),
      ).resolves.toBeNull();
    });

    it('buildDeniedRedirect returns access_denied with the state echoed (RFC 6749 §4.1.2.1)', () => {
      const url = new URL(
        service.buildDeniedRedirect(
          'https://chatgpt.com/aip/abc/oauth/callback?keep=1',
          'xyz',
        ),
      );
      expect(url.origin + url.pathname).toBe(
        'https://chatgpt.com/aip/abc/oauth/callback',
      );
      expect(url.searchParams.get('keep')).toBe('1');
      expect(url.searchParams.get('error')).toBe('access_denied');
      expect(url.searchParams.get('state')).toBe('xyz');
      expect(url.searchParams.has('code')).toBe(false);

      const noState = new URL(
        service.buildDeniedRedirect('https://chatgpt.com/cb', ''),
      );
      expect(noState.searchParams.has('state')).toBe(false);
    });

    it('getClientInfo exposes the display name and the scopes a grant would carry', async () => {
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(clientRecord);
      await expect(
        service.getClientInfo('ordo_cl_chatgpt', 'read tasks:write bogus'),
      ).resolves.toEqual({
        clientId: 'ordo_cl_chatgpt',
        clientName: 'ChatGPT',
        grantedScopes: ['read', 'tasks:write'],
      });

      // Registered-scope client asking outside its ceiling: the screen
      // gets null instead of a misleading list.
      mockPrismaService.oAuthClient.findUnique.mockResolvedValue({
        ...clientRecord,
        scopes: ['read'],
      });
      await expect(
        service.getClientInfo('ordo_cl_chatgpt', 'tasks:write'),
      ).resolves.toMatchObject({ grantedScopes: null });

      mockPrismaService.oAuthClient.findUnique.mockResolvedValue(null);
      await expect(service.getClientInfo('nope')).resolves.toBeNull();
    });

    it('listConnections groups live tokens per client, newest activity first', async () => {
      mockPrismaService.oAuthRefreshToken.findMany.mockResolvedValue([
        {
          id: 'rt-1',
          clientId: 'ordo_cl_chatgpt',
          scopes: ['read'],
          createdAt: new Date('2026-10-01T00:00:00Z'),
        },
        {
          id: 'rt-2',
          clientId: 'ordo_cl_chatgpt',
          scopes: ['read', 'tasks:write'],
          createdAt: new Date('2026-10-20T00:00:00Z'),
        },
        {
          id: 'rt-3',
          clientId: 'ordo_cl_claude',
          scopes: ['read'],
          createdAt: new Date('2026-10-25T00:00:00Z'),
        },
      ]);
      mockPrismaService.oAuthClient.findUnique.mockImplementation(
        async ({ where }: any) =>
          where.clientId === 'ordo_cl_chatgpt'
            ? clientRecord
            : { ...clientRecord, clientId: 'ordo_cl_claude', clientName: '' },
      );

      const connections = await service.listConnections('user-123');

      const where =
        mockPrismaService.oAuthRefreshToken.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe('user-123');
      expect(where.expiresAt.gt).toBeInstanceOf(Date);

      expect(connections.map((c) => c.clientId)).toEqual([
        'ordo_cl_claude',
        'ordo_cl_chatgpt',
      ]);
      const chatgpt = connections[1];
      expect(chatgpt.clientName).toBe('ChatGPT');
      expect(chatgpt.scopes).toEqual(['read', 'tasks:write']);
      expect(chatgpt.connectedAt.toISOString()).toBe(
        '2026-10-01T00:00:00.000Z',
      );
      expect(chatgpt.lastRefreshedAt.toISOString()).toBe(
        '2026-10-20T00:00:00.000Z',
      );
      // Nameless client falls back to its id so the row is never blank.
      expect(connections[0].clientName).toBe('ordo_cl_claude');
    });

    it('disconnectClient revokes only that user+client pair', async () => {
      mockPrismaService.oAuthRefreshToken.deleteMany.mockResolvedValue({
        count: 2,
      });

      await expect(
        service.disconnectClient('user-123', 'ordo_cl_chatgpt'),
      ).resolves.toEqual({ revoked: 2 });
      expect(
        mockPrismaService.oAuthRefreshToken.deleteMany,
      ).toHaveBeenCalledWith({
        where: { userId: 'user-123', clientId: 'ordo_cl_chatgpt' },
      });
    });
  });

  describe('exchangeCode', () => {
    const verifier = 'verifier-0123456789abcdef-0123456789abcdef';
    const challenge = sha256Base64Url(verifier);
    const codeRecord = {
      id: 'code-1',
      code: 'authcode-1',
      userId: 'user-123',
      clientId: 'https://hermes.test',
      redirectUri: 'https://hermes.test/callback',
      scopes: ['read'],
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    it('should exchange a valid code+verifier for access and refresh tokens', async () => {
      mockPrismaService.oAuthAuthorizationCode.findUnique.mockResolvedValue(
        codeRecord,
      );
      mockPrismaService.oAuthAuthorizationCode.delete.mockResolvedValue(
        codeRecord,
      );
      mockPrismaService.oAuthRefreshToken.create.mockImplementation(
        async ({ data }: any) => ({ id: 'rt-1', ...data }),
      );
      mockJwtService.signAsync.mockResolvedValue('jwt-access-token');

      const result = await service.exchangeCode({
        code: 'authcode-1',
        clientId: 'https://hermes.test',
        redirectUri: 'https://hermes.test/callback',
        codeVerifier: verifier,
      });

      expect(result.access_token).toBe('jwt-access-token');
      expect(result.token_type).toBe('Bearer');
      expect(result.refresh_token).toMatch(/^ordo_rt_/);
      expect(result.scope).toBe('read');
      expect(
        mockPrismaService.oAuthAuthorizationCode.delete,
      ).toHaveBeenCalledWith({ where: { id: 'code-1' } });
      const storedRefresh =
        mockPrismaService.oAuthRefreshToken.create.mock.calls[0][0].data;
      expect(storedRefresh.tokenHash).not.toContain('ordo_rt_');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-123',
          client_id: 'https://hermes.test',
          scope: 'read',
        }),
        expect.objectContaining({ expiresIn: '1h' }),
      );
    });

    it('should reject wrong verifier, redirect, expiry and reuse', async () => {
      mockPrismaService.oAuthAuthorizationCode.findUnique.mockResolvedValue(
        codeRecord,
      );
      await expect(
        service.exchangeCode({
          code: 'authcode-1',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          codeVerifier: 'wrong-verifier-0123456789abcdef-000',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.exchangeCode({
          code: 'authcode-1',
          clientId: 'https://hermes.test',
          redirectUri: 'https://evil.test/cb',
          codeVerifier: verifier,
        }),
      ).rejects.toThrow(BadRequestException);

      mockPrismaService.oAuthAuthorizationCode.findUnique.mockResolvedValue({
        ...codeRecord,
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(
        service.exchangeCode({
          code: 'authcode-1',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          codeVerifier: verifier,
        }),
      ).rejects.toThrow(BadRequestException);

      mockPrismaService.oAuthAuthorizationCode.findUnique.mockResolvedValue(
        null,
      );
      await expect(
        service.exchangeCode({
          code: 'authcode-1',
          clientId: 'https://hermes.test',
          redirectUri: 'https://hermes.test/callback',
          codeVerifier: verifier,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refresh and revoke', () => {
    const oldRawToken = 'ordo_rt_oldtoken00000000000000001';

    it('should rotate refresh tokens and issue a new access token', async () => {
      const oldHash = await bcrypt.hash(oldRawToken, 4);
      mockPrismaService.oAuthRefreshToken.findMany = jest
        .fn()
        .mockResolvedValue([
          {
            id: 'rt-1',
            userId: 'user-123',
            clientId: 'https://hermes.test',
            tokenHash: oldHash,
            scopes: ['read'],
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        ]);
      mockPrismaService.oAuthRefreshToken.delete.mockResolvedValue({
        id: 'rt-1',
      });
      mockPrismaService.oAuthRefreshToken.create.mockImplementation(
        async ({ data }: any) => ({ id: 'rt-2', ...data }),
      );
      mockJwtService.signAsync.mockResolvedValue('jwt-access-token-2');

      const result = await service.refresh('https://hermes.test', oldRawToken);

      expect(result.access_token).toBe('jwt-access-token-2');
      expect(result.refresh_token).toMatch(/^ordo_rt_/);
      expect(result.refresh_token).not.toBe(oldRawToken);
      expect(mockPrismaService.oAuthRefreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
      });
    });

    it('should revoke by deleting the matching refresh token', async () => {
      const rawToken = 'ordo_rt_sometoken0000000000002';
      const tokenHash = await bcrypt.hash(rawToken, 4);
      mockPrismaService.oAuthRefreshToken.findMany = jest
        .fn()
        .mockResolvedValue([
          {
            id: 'rt-7',
            userId: 'user-123',
            clientId: 'https://hermes.test',
            tokenHash,
            scopes: ['read'],
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        ]);
      mockPrismaService.oAuthRefreshToken.delete.mockResolvedValue({
        id: 'rt-7',
      });

      await service.revoke('https://hermes.test', rawToken);

      expect(mockPrismaService.oAuthRefreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'rt-7' },
      });
    });

    it('should never mass-revoke: unknown or malformed tokens are a silent no-op', async () => {
      await service.revoke('https://hermes.test', 'not-even-a-token');
      await service.revoke('https://hermes.test', 'ordo_rt_wrongtoken00003');

      expect(
        mockPrismaService.oAuthRefreshToken.deleteMany,
      ).not.toHaveBeenCalled();
      expect(mockPrismaService.oAuthRefreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('metadata', () => {
    it('should expose RFC 8414 metadata', () => {
      const metadata =
        service.getAuthorizationServerMetadata('https://ordo.test');

      expect(metadata.issuer).toBe('https://ordo.test');
      expect(metadata.authorization_endpoint).toContain('/oauth/authorize');
      expect(metadata.token_endpoint).toContain('/oauth/token');
      expect(metadata.revocation_endpoint).toContain('/oauth/revoke');
      expect(metadata.code_challenge_methods_supported).toContain('S256');
      expect(metadata.grant_types_supported).toContain('authorization_code');
      expect(metadata.grant_types_supported).toContain('refresh_token');
    });
  });
});
