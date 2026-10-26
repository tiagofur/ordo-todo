import { Test, TestingModule } from '@nestjs/testing';
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
    exchangeCode: jest.fn(),
    refresh: jest.fn(),
    revoke: jest.fn(),
    getAuthorizationServerMetadata: jest.fn(),
  };

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

  describe('token', () => {
    it('should route authorization_code and refresh_token grants', async () => {
      mockOAuthService.exchangeCode.mockResolvedValue({ access_token: 'a' });
      mockOAuthService.refresh.mockResolvedValue({ access_token: 'b' });

      await controller.token({
        grant_type: 'authorization_code',
        code: 'c',
        client_id: 'x',
        redirect_uri: 'r',
        code_verifier: 'v',
      });

      expect(oauthService.exchangeCode).toHaveBeenCalledWith({
        code: 'c',
        clientId: 'x',
        redirectUri: 'r',
        codeVerifier: 'v',
      });

      await controller.token({
        grant_type: 'refresh_token',
        refresh_token: 'rt',
        client_id: 'x',
      });

      expect(oauthService.refresh).toHaveBeenCalledWith('x', 'rt');
    });

    it('should reject unsupported grant types', () => {
      expect(() => controller.token({ grant_type: 'password' })).toThrow(
        'unsupported_grant_type',
      );
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
