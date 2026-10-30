import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CalendarConnectionsService } from './calendar-connections.service';
import { PrismaService } from '../database/prisma.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { OutlookCalendarProvider } from './outlook-calendar.provider';

describe('CalendarConnectionsService', () => {
  let service: CalendarConnectionsService;
  const jwtService = new JwtService({
    secret: 'test-secret-key-0123456789abcdef',
  });

  const mockPrisma = {
    user: { findUnique: jest.fn() },
    userIntegration: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const mockGoogle = {
    getAuthorizeUrl: jest.fn(),
    exchangeCode: jest.fn(),
    refreshAccessToken: jest.fn(),
  };
  const mockOutlook = {
    getAuthorizeUrl: jest.fn(),
    exchangeCode: jest.fn(),
    refreshAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarConnectionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GoogleCalendarProvider, useValue: mockGoogle },
        { provide: OutlookCalendarProvider, useValue: mockOutlook },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<CalendarConnectionsService>(
      CalendarConnectionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start connect with the provider authorize URL', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    mockGoogle.getAuthorizeUrl.mockReturnValue(
      'https://accounts.google.com/auth?x=1',
    );

    const result = await service.startConnect('a@b.c', 'GOOGLE_CALENDAR');

    expect(result.authorizeUrl).toContain('accounts.google.com');
    // JD-003: state is a signed JWT bound to the initiating user.
    expect(service.verifyConnectState(result.state)).toBe('user-1');
    expect(mockGoogle.getAuthorizeUrl).toHaveBeenCalledWith(result.state);
  });

  it('should bind the connect state to the initiating user (JD-003)', () => {
    const state = service.createConnectState('user-1');

    expect(service.verifyConnectState(state)).toBe('user-1');
    const payload = jwtService.decode(state) as {
      sub: string;
      tokenType: string;
    };
    expect(payload.sub).toBe('user-1');
    expect(payload.tokenType).toBe('calendar_oauth_state');
  });

  it('should reject invalid or wrong-type OAuth state with 401', () => {
    expect(() => service.verifyConnectState('not-a-jwt')).toThrow(
      UnauthorizedException,
    );
    const alien = jwtService.sign({ sub: 'user-1', tokenType: 'access' });
    expect(() => service.verifyConnectState(alien)).toThrow(
      UnauthorizedException,
    );
    expect(() => service.verifyConnectState('')).toThrow(
      UnauthorizedException,
    );
  });

  it('should reject unknown providers and unknown users', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.startConnect('a@b.c', 'NOTION' as never),
    ).rejects.toThrow(BadRequestException);

    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.startConnect('ghost@x.c', 'GOOGLE_CALENDAR'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should finish connect by exchanging the code and upserting tokens', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    mockGoogle.exchangeCode.mockResolvedValue({
      accessToken: 'ya29.a',
      refreshToken: 'r1',
      expiresAt: new Date(),
      scope: 'https://www.googleapis.com/auth/calendar',
    });
    mockPrisma.userIntegration.upsert.mockImplementation(
      async ({ create }: any) => ({
        id: 'int-1',
        ...create,
      }),
    );

    const result = await service.finishConnect(
      'user-1',
      'GOOGLE_CALENDAR',
      'code-1',
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } }),
    );
    expect(result.provider).toBe('GOOGLE_CALENDAR');
    expect(result.isActive).toBe(true);
    expect(result).not.toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('refreshToken');
    const stored = mockPrisma.userIntegration.upsert.mock.calls[0][0];
    expect(stored.create.accessToken).toBe('ya29.a');
    expect(stored.create.refreshToken).toBe('r1');
  });

  it('should silently refresh an expired token on access', async () => {
    const expired = new Date(Date.now() - 1000);
    mockPrisma.userIntegration.findUnique.mockResolvedValue({
      id: 'int-1',
      userId: 'user-1',
      provider: 'GOOGLE_CALENDAR',
      accessToken: 'ya29.old',
      refreshToken: 'r1',
      expiresAt: expired,
      isActive: true,
    });
    mockGoogle.refreshAccessToken.mockResolvedValue({
      accessToken: 'ya29.new',
      refreshToken: 'r1',
      expiresAt: new Date(Date.now() + 3600_000),
    });
    mockPrisma.userIntegration.upsert.mockResolvedValue({});

    const token = await service.getAccessToken('user-1', 'GOOGLE_CALENDAR');

    expect(token).toBe('ya29.new');
    expect(mockGoogle.refreshAccessToken).toHaveBeenCalledWith('r1');
  });

  it('should mark re-auth needed when refresh fails with invalid_grant', async () => {
    mockPrisma.userIntegration.findUnique.mockResolvedValue({
      id: 'int-1',
      userId: 'user-1',
      provider: 'GOOGLE_CALENDAR',
      accessToken: 'ya29.old',
      refreshToken: 'dead',
      expiresAt: new Date(Date.now() - 1000),
      isActive: true,
    });
    const { UnauthorizedException } = jest.requireActual('@nestjs/common');
    mockGoogle.refreshAccessToken.mockRejectedValue(
      new UnauthorizedException('grant dead'),
    );
    mockPrisma.userIntegration.update.mockResolvedValue({});

    await expect(
      service.getAccessToken('user-1', 'GOOGLE_CALENDAR'),
    ).rejects.toThrow('Reconnect your Google account');
    const stored = mockPrisma.userIntegration.update.mock.calls[0][0];
    expect(stored.data.isActive).toBe(false);
    expect(stored.data.settings).toEqual(
      expect.objectContaining({ status: 're-auth-required' }),
    );
  });

  it('should disconnect by deleting the integration row', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    mockPrisma.userIntegration.deleteMany.mockResolvedValue({ count: 1 });

    await service.disconnect('a@b.c', 'GOOGLE_CALENDAR');

    expect(mockPrisma.userIntegration.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', provider: 'GOOGLE_CALENDAR' },
    });
  });
});
