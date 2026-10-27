import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { OAuthGuard } from './oauth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('OAuthController', () => {
  let controller: OAuthController;
  let oauthService: jest.Mocked<OAuthService>;

  const mockOAuthService = {
    registerClient: jest.fn(),
    authorize: jest.fn(),
    validateAuthorizeRequest: jest.fn(),
    findLiveGrantScopes: jest.fn(),
    buildDeniedRedirect: jest.fn(),
    getClientInfo: jest.fn(),
    listConnections: jest.fn(),
    disconnectClient: jest.fn(),
    exchangeCode: jest.fn(),
    refresh: jest.fn(),
    revoke: jest.fn(),
    getAuthorizationServerMetadata: jest.fn(),
  };

  const FRONTEND = 'https://app.ordo.test';
  const originalFrontendUrl = process.env.FRONTEND_URL;

  beforeAll(() => {
    process.env.FRONTEND_URL = FRONTEND;
  });

  afterAll(() => {
    if (originalFrontendUrl === undefined) {
      delete process.env.FRONTEND_URL;
    } else {
      process.env.FRONTEND_URL = originalFrontendUrl;
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [{ provide: OAuthService, useValue: mockOAuthService }],
    })
      .overrideGuard(OAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OAuthController>(OAuthController);
    oauthService = module.get<OAuthService>(
      OAuthService,
    ) as jest.Mocked<OAuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('metadata', () => {
    it('should return RFC 8414 metadata built from the request host', () => {
      mockOAuthService.getAuthorizationServerMetadata.mockReturnValue({
        issuer: 'https://ordo.test',
      });
      const req = {
        protocol: 'https',
        get: (header: string) => (header === 'host' ? 'ordo.test' : undefined),
      };

      const result = controller.metadata(req as never);

      expect(oauthService.getAuthorizationServerMetadata).toHaveBeenCalledWith(
        'https://ordo.test',
      );
      expect(result).toEqual({ issuer: 'https://ordo.test' });
    });
  });

  describe('register', () => {
    it('should delegate client registration to the service (CIMD)', async () => {
      mockOAuthService.registerClient.mockResolvedValue({ client_id: 'x' });

      const result = await controller.register({
        metadataUrl: 'https://client.test/meta',
        client_name: 'Client',
        redirect_uris: ['https://client.test/cb'],
      });

      expect(oauthService.registerClient).toHaveBeenCalledWith(
        'https://client.test/meta',
        {
          client_name: 'Client',
          client_uri: undefined,
          redirect_uris: ['https://client.test/cb'],
          scope: undefined,
        },
      );
      expect(result).toEqual({ client_id: 'x' });
    });

    it('should delegate RFC 7591 DCR without a metadata URL', async () => {
      mockOAuthService.registerClient.mockResolvedValue({ client_id: 'y' });

      await controller.register({
        client_name: 'ChatGPT',
        redirect_uris: ['https://chatgpt.com/cb'],
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code'],
      });

      expect(oauthService.registerClient).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({ client_name: 'ChatGPT' }),
      );
    });
  });

  describe('authorize (GET hop)', () => {
    const user = { id: 'user-123', email: 'a@b.c' } as never;
    const query = {
      client_id: 'ordo_cl_chatgpt',
      redirect_uri: 'https://chatgpt.com/aip/abc/oauth/callback',
      scope: 'read tasks:write',
      state: 'xyz',
      code_challenge: 'c'.repeat(43),
      code_challenge_method: 'S256',
      // RFC 8707 extra that ChatGPT appends: must not be reflected.
      resource: 'https://api.ordo.test/mcp',
    };
    const validated = {
      client: { clientId: 'ordo_cl_chatgpt' },
      grantedScopes: ['read', 'tasks:write'],
    };

    const res = () => ({ redirect: jest.fn() });
    const redirectedTo = (r: { redirect: jest.Mock }) =>
      new URL(r.redirect.mock.calls[0][0] as string);

    it('bounces an invalid request to the consent screen error state, never to the redirect_uri', async () => {
      mockOAuthService.validateAuthorizeRequest.mockRejectedValue(
        new BadRequestException('redirect_uri is not registered'),
      );
      const response = res();

      await controller.authorize(user, query, response as never);

      const target = redirectedTo(response);
      expect(target.origin).toBe(FRONTEND);
      expect(target.pathname).toBe('/connect/authorize');
      expect(target.searchParams.get('ordo_error')).toBe('invalid_request');
      expect(target.searchParams.get('client_id')).toBe('ordo_cl_chatgpt');
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });

    it('sends a logged-out user to the consent screen with the request forwarded verbatim', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      const response = res();

      await controller.authorize(undefined, query, response as never);

      const target = redirectedTo(response);
      expect(target.origin + target.pathname).toBe(
        `${FRONTEND}/connect/authorize`,
      );
      expect(target.searchParams.get('client_id')).toBe('ordo_cl_chatgpt');
      expect(target.searchParams.get('redirect_uri')).toBe(
        'https://chatgpt.com/aip/abc/oauth/callback',
      );
      expect(target.searchParams.get('scope')).toBe('read tasks:write');
      expect(target.searchParams.get('state')).toBe('xyz');
      expect(target.searchParams.get('code_challenge')).toBe('c'.repeat(43));
      expect(target.searchParams.get('code_challenge_method')).toBe('S256');
      expect(target.searchParams.has('resource')).toBe(false);
      expect(target.searchParams.has('ordo_error')).toBe(false);
      expect(oauthService.findLiveGrantScopes).not.toHaveBeenCalled();
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });

    it('sends a logged-in user without a live grant to the consent screen', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.findLiveGrantScopes.mockResolvedValue(null);
      const response = res();

      await controller.authorize(user, query, response as never);

      expect(oauthService.findLiveGrantScopes).toHaveBeenCalledWith(
        'user-123',
        'ordo_cl_chatgpt',
      );
      expect(redirectedTo(response).pathname).toBe('/connect/authorize');
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });

    it('reconnects seamlessly when a live grant covers the requested scopes', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.findLiveGrantScopes.mockResolvedValue([
        'read',
        'tasks:write',
        'projects:write',
      ]);
      mockOAuthService.authorize.mockResolvedValue({
        redirectUri:
          'https://chatgpt.com/aip/abc/oauth/callback?code=c1&state=xyz',
      });
      const response = res();

      await controller.authorize(user, query, response as never);

      expect(oauthService.authorize).toHaveBeenCalledWith({
        userId: 'user-123',
        clientId: 'ordo_cl_chatgpt',
        redirectUri: 'https://chatgpt.com/aip/abc/oauth/callback',
        scope: 'read tasks:write',
        state: 'xyz',
        codeChallenge: 'c'.repeat(43),
        codeChallengeMethod: 'S256',
      });
      expect(response.redirect).toHaveBeenCalledWith(
        'https://chatgpt.com/aip/abc/oauth/callback?code=c1&state=xyz',
      );
    });

    it('re-prompts when the request exceeds the live grant (no silent scope upgrades)', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      // Live grant is read-only, the request asks read + tasks:write.
      mockOAuthService.findLiveGrantScopes.mockResolvedValue(['read']);
      const response = res();

      await controller.authorize(user, query, response as never);

      expect(redirectedTo(response).pathname).toBe('/connect/authorize');
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });
  });

  describe('authorizeDecision (consent POST)', () => {
    const user = { id: 'user-123', email: 'a@b.c' } as never;
    const body = {
      client_id: 'ordo_cl_chatgpt',
      redirect_uri: 'https://chatgpt.com/aip/abc/oauth/callback',
      scope: 'read',
      state: 'xyz',
      code_challenge: 'c'.repeat(43),
      code_challenge_method: 'S256',
    };
    const validated = {
      client: { clientId: 'ordo_cl_chatgpt' },
      grantedScopes: ['read'],
    };
    const req = (headers: Record<string, string>) => ({
      get: (name: string) => headers[name.toLowerCase()],
    });
    const trusted = () => req({ origin: FRONTEND });
    const res = () => ({ redirect: jest.fn() });
    const redirectedTo = (r: { redirect: jest.Mock }) =>
      new URL(r.redirect.mock.calls[0][0] as string);

    it('rejects a decision posted from a foreign origin (consent CSRF)', async () => {
      await expect(
        controller.authorizeDecision(
          user,
          { ...body, decision: 'approve' },
          {},
          req({ origin: 'https://evil.test' }) as never,
          res() as never,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(oauthService.validateAuthorizeRequest).not.toHaveBeenCalled();
    });

    it('accepts the www/apex twin of the frontend origin (301 between hosts must not break the POST)', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.authorize.mockResolvedValue({
        redirectUri: 'https://chatgpt.com/cb?code=1',
      });

      await expect(
        controller.authorizeDecision(
          user,
          { ...body, decision: 'approve' },
          {},
          req({ origin: 'https://www.app.ordo.test' }) as never,
          res() as never,
        ),
      ).resolves.toBeUndefined();
      expect(oauthService.authorize).toHaveBeenCalledTimes(1);
    });

    it('accepts the Referer as fallback and headerless (non-browser) requests', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.authorize.mockResolvedValue({
        redirectUri: 'https://chatgpt.com/cb?code=1',
      });

      await controller.authorizeDecision(
        user,
        { ...body, decision: 'approve' },
        {},
        req({ referer: `${FRONTEND}/es/connect/authorize?x=1` }) as never,
        res() as never,
      );
      await controller.authorizeDecision(
        user,
        { ...body, decision: 'approve' },
        {},
        req({}) as never,
        res() as never,
      );

      expect(oauthService.authorize).toHaveBeenCalledTimes(2);

      await expect(
        controller.authorizeDecision(
          user,
          { ...body, decision: 'approve' },
          {},
          req({ referer: 'https://evil.test/' }) as never,
          res() as never,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('approve mints a code and redirects to the client', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.authorize.mockResolvedValue({
        redirectUri:
          'https://chatgpt.com/aip/abc/oauth/callback?code=c1&state=xyz',
      });
      const response = res();

      await controller.authorizeDecision(
        user,
        { ...body, decision: 'approve' },
        {},
        trusted() as never,
        response as never,
      );

      expect(oauthService.authorize).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-123', state: 'xyz' }),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        'https://chatgpt.com/aip/abc/oauth/callback?code=c1&state=xyz',
      );
    });

    it('carries the decision in the form action query (submit-path agnostic)', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.authorize.mockResolvedValue({
        redirectUri: 'https://chatgpt.com/cb?code=q1',
      });
      const approved = res();
      await controller.authorizeDecision(
        user,
        body,
        { decision: 'approve' },
        trusted() as never,
        approved as never,
      );
      expect(oauthService.authorize).toHaveBeenCalledTimes(1);
      expect(approved.redirect).toHaveBeenCalledWith(
        'https://chatgpt.com/cb?code=q1',
      );

      mockOAuthService.buildDeniedRedirect.mockReturnValue(
        'https://chatgpt.com/cb?error=access_denied',
      );
      const denied = res();
      await controller.authorizeDecision(
        user,
        body,
        { decision: 'deny' },
        trusted() as never,
        denied as never,
      );
      expect(denied.redirect).toHaveBeenCalledWith(
        'https://chatgpt.com/cb?error=access_denied',
      );
      expect(oauthService.authorize).toHaveBeenCalledTimes(1);
    });

    it('deny redirects to the client with access_denied and never mints', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      mockOAuthService.buildDeniedRedirect.mockReturnValue(
        'https://chatgpt.com/aip/abc/oauth/callback?error=access_denied&state=xyz',
      );
      const response = res();

      await controller.authorizeDecision(
        user,
        { ...body, decision: 'deny' },
        {},
        trusted() as never,
        response as never,
      );

      expect(oauthService.buildDeniedRedirect).toHaveBeenCalledWith(
        'https://chatgpt.com/aip/abc/oauth/callback',
        'xyz',
      );
      expect(oauthService.authorize).not.toHaveBeenCalled();
      expect(response.redirect).toHaveBeenCalledWith(
        'https://chatgpt.com/aip/abc/oauth/callback?error=access_denied&state=xyz',
      );
    });

    it('sends an expired session back to the consent screen instead of minting', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      const response = res();

      await controller.authorizeDecision(
        undefined,
        { ...body, decision: 'approve' },
        {},
        trusted() as never,
        response as never,
      );

      const target = redirectedTo(response);
      expect(target.pathname).toBe('/connect/authorize');
      // The screen must be able to re-run the whole hop: every
      // authorize param is re-forwarded, not just the state.
      expect(target.searchParams.get('client_id')).toBe('ordo_cl_chatgpt');
      expect(target.searchParams.get('redirect_uri')).toBe(
        'https://chatgpt.com/aip/abc/oauth/callback',
      );
      expect(target.searchParams.get('code_challenge')).toBe('c'.repeat(43));
      expect(target.searchParams.get('scope')).toBe('read');
      expect(target.searchParams.has('ordo_error')).toBe(false);
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });

    it('treats an unknown decision or an invalid request as an error hop', async () => {
      mockOAuthService.validateAuthorizeRequest.mockResolvedValue(validated);
      const unknown = res();
      await controller.authorizeDecision(
        user,
        { ...body, decision: 'maybe' },
        {},
        trusted() as never,
        unknown as never,
      );
      expect(redirectedTo(unknown).searchParams.get('ordo_error')).toBe(
        'invalid_request',
      );

      mockOAuthService.validateAuthorizeRequest.mockRejectedValue(
        new NotFoundException('Unknown OAuth client'),
      );
      const invalid = res();
      await controller.authorizeDecision(
        user,
        { ...body, decision: 'approve' },
        {},
        trusted() as never,
        invalid as never,
      );
      expect(redirectedTo(invalid).searchParams.get('ordo_error')).toBe(
        'invalid_request',
      );
      expect(oauthService.authorize).not.toHaveBeenCalled();
    });
  });

  describe('authorizeClient and connections', () => {
    it('returns public client facts (with the requested scope) or 404', async () => {
      mockOAuthService.getClientInfo.mockResolvedValue({
        clientId: 'ordo_cl_chatgpt',
        clientName: 'ChatGPT',
        grantedScopes: ['read'],
      });
      await expect(
        controller.authorizeClient('ordo_cl_chatgpt', 'read'),
      ).resolves.toEqual({
        clientId: 'ordo_cl_chatgpt',
        clientName: 'ChatGPT',
        grantedScopes: ['read'],
      });
      expect(oauthService.getClientInfo).toHaveBeenCalledWith(
        'ordo_cl_chatgpt',
        'read',
      );

      mockOAuthService.getClientInfo.mockResolvedValue(null);
      await expect(
        controller.authorizeClient('nope', undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('lists and disconnects connections for the current user only', async () => {
      const user = { id: 'user-123' } as never;
      mockOAuthService.listConnections.mockResolvedValue([]);
      mockOAuthService.disconnectClient.mockResolvedValue({ revoked: 1 });

      await controller.connections(user);
      expect(oauthService.listConnections).toHaveBeenCalledWith('user-123');

      await expect(
        controller.disconnect(user, 'ordo_cl_chatgpt'),
      ).resolves.toEqual({ revoked: 1 });
      expect(oauthService.disconnectClient).toHaveBeenCalledWith(
        'user-123',
        'ordo_cl_chatgpt',
      );

      expect(() => controller.disconnect(user, undefined)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('token', () => {
    // RFC 6749 §5.2 bodies: Claude's reconnect keys off the `error` field.
    const res = () => {
      const r: { status: jest.Mock; json: jest.Mock } = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      return r;
    };

    it('should route authorization_code and refresh_token grants', async () => {
      mockOAuthService.exchangeCode.mockResolvedValue({ access_token: 'a' });
      mockOAuthService.refresh.mockResolvedValue({ access_token: 'b' });

      await controller.token(
        {
          grant_type: 'authorization_code',
          code: 'c',
          client_id: 'x',
          redirect_uri: 'r',
          code_verifier: 'v',
        },
        res() as never,
      );

      expect(oauthService.exchangeCode).toHaveBeenCalledWith({
        code: 'c',
        clientId: 'x',
        redirectUri: 'r',
        codeVerifier: 'v',
      });

      await controller.token(
        {
          grant_type: 'refresh_token',
          refresh_token: 'rt',
          client_id: 'x',
        },
        res() as never,
      );

      expect(oauthService.refresh).toHaveBeenCalledWith('x', 'rt');
    });

    it('answers invalid_grant on failed exchanges instead of throwing', async () => {
      mockOAuthService.exchangeCode.mockRejectedValue(
        new UnauthorizedException('PKCE verification failed'),
      );
      const exchange = res();
      await controller.token(
        {
          grant_type: 'authorization_code',
          code: 'c',
          client_id: 'x',
          redirect_uri: 'r',
          code_verifier: 'bad',
        },
        exchange as never,
      );
      expect(exchange.status).toHaveBeenCalledWith(400);
      expect(exchange.json).toHaveBeenCalledWith({ error: 'invalid_grant' });

      mockOAuthService.refresh.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );
      const refresh = res();
      await controller.token(
        { grant_type: 'refresh_token', refresh_token: 'rt', client_id: 'x' },
        refresh as never,
      );
      expect(refresh.status).toHaveBeenCalledWith(400);
      expect(refresh.json).toHaveBeenCalledWith({ error: 'invalid_grant' });
    });

    it('answers invalid_request for missing fields and unsupported_grant_type otherwise', async () => {
      const missing = res();
      await controller.token(
        { grant_type: 'authorization_code', code: 'c' },
        missing as never,
      );
      expect(missing.status).toHaveBeenCalledWith(400);
      expect(missing.json).toHaveBeenCalledWith({ error: 'invalid_request' });

      const unknown = res();
      await controller.token({ grant_type: 'password' }, unknown as never);
      expect(unknown.status).toHaveBeenCalledWith(400);
      expect(unknown.json).toHaveBeenCalledWith({
        error: 'unsupported_grant_type',
      });
    });
  });

  describe('revoke and userinfo', () => {
    it('should revoke and return user claims', async () => {
      mockOAuthService.revoke.mockResolvedValue(undefined);

      await controller.revoke({ token: 't', client_id: 'x' });

      expect(oauthService.revoke).toHaveBeenCalledWith('x', 't');

      const result = controller.userinfo({
        id: 'user-123',
        email: 'a@b.c',
        name: 'Ana',
      } as never);

      expect(result).toEqual({
        sub: 'user-123',
        email: 'a@b.c',
        name: 'Ana',
      });
    });
  });
});
