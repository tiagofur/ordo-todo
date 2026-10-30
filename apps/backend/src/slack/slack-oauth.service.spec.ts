import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SlackOAuthService } from './slack-oauth.service';
import { PrismaService } from '../database/prisma.service';

describe('SlackOAuthService', () => {
  let service: SlackOAuthService;
  const mockFetch = jest.fn();
  const jwtService = new JwtService({
    secret: 'test-secret-key-0123456789abcdef',
  });

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        SLACK_CLIENT_ID: 'slack-client-id',
        SLACK_CLIENT_SECRET: 'slack-client-secret-0123456789abcdef',
        SLACK_REDIRECT_URI: 'https://ordotodo.app/api/v1/slack/oauth/callback',
      };
      return values[key];
    }),
  };
  const mockPrisma = {
    user: { findUnique: jest.fn() },
    userIntegration: { upsert: jest.fn(), deleteMany: jest.fn() },
    slackWorkspaceMap: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackOAuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<SlackOAuthService>(SlackOAuthService);
    (service as any).doFetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should build the install URL with bot scopes', () => {
    const url = new URL(service.getInstallUrl('state-1'));

    expect(url.origin + url.pathname).toBe(
      'https://slack.com/oauth/v2/authorize',
    );
    expect(url.searchParams.get('client_id')).toBe('slack-client-id');
    expect(url.searchParams.get('scope')).toContain('chat:write');
    expect(url.searchParams.get('scope')).toContain('commands');
    expect(url.searchParams.get('state')).toBe('state-1');
  });

  it('should bind the install state to the initiating user (JD-002)', () => {
    const state = service.createInstallState('user-1');

    expect(service.verifyInstallState(state)).toBe('user-1');
    const payload = jwtService.decode(state) as {
      sub: string;
      tokenType: string;
    };
    expect(payload.sub).toBe('user-1');
    expect(payload.tokenType).toBe('slack_oauth_state');
  });

  it('should reject invalid or wrong-type OAuth state with 401', () => {
    expect(() => service.verifyInstallState('not-a-jwt')).toThrow(
      UnauthorizedException,
    );
    const alien = jwtService.sign({ sub: 'user-1', tokenType: 'access' });
    expect(() => service.verifyInstallState(alien)).toThrow(
      UnauthorizedException,
    );
    expect(() => service.verifyInstallState('')).toThrow(
      UnauthorizedException,
    );
  });

  it('should exchange the code and store bot token + team mapping', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        access_token: 'xoxb-bot-token',
        team: { id: 'T1', name: 'Acme' },
        authed_user: { id: 'U1' },
        scope: 'chat:write,commands',
      }),
      text: async () => '',
    });
    mockPrisma.userIntegration.upsert.mockResolvedValue({ id: 'int-1' });
    mockPrisma.slackWorkspaceMap.upsert.mockResolvedValue({ id: 'map-1' });

    const result = await service.finishInstall('user-1', 'code-1');

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
    expect(result.teamId).toBe('T1');
    expect(result.teamName).toBe('Acme');
    const stored = mockPrisma.userIntegration.upsert.mock.calls[0][0];
    expect(stored.create.accessToken).toBe('xoxb-bot-token');
    expect(stored.create.provider).toBe('SLACK');
    expect(mockPrisma.slackWorkspaceMap.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_teamId_channelId_projectId: expect.objectContaining({
            userId: 'user-1',
            teamId: 'T1',
          }),
        }),
      }),
    );
  });

  it('should reject unknown users and failed exchanges', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.finishInstall('ghost-user', 'c')).rejects.toThrow(
      NotFoundException,
    );

    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: false, error: 'invalid_code' }),
      text: async () => '',
    });
    await expect(service.finishInstall('user-1', 'bad')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should uninstall cleanly without residues', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockPrisma.slackWorkspaceMap.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.userIntegration.deleteMany.mockResolvedValue({ count: 1 });

    await service.uninstall('a@b.c', 'T1');

    expect(mockPrisma.slackWorkspaceMap.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', teamId: 'T1' },
    });
    expect(mockPrisma.userIntegration.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', provider: 'SLACK' },
    });
  });

  it('should handle app_uninstalled event payloads', async () => {
    mockPrisma.slackWorkspaceMap.deleteMany.mockResolvedValue({ count: 3 });

    await service.handleAppUninstalled('T9');

    expect(mockPrisma.slackWorkspaceMap.deleteMany).toHaveBeenCalledWith({
      where: { teamId: 'T9' },
    });
  });
});
