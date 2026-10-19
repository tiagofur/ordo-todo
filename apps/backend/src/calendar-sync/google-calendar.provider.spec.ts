import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleCalendarProvider } from './google-calendar.provider';

describe('GoogleCalendarProvider', () => {
  let provider: GoogleCalendarProvider;
  const mockFetch = jest.fn();

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        GOOGLE_CALENDAR_CLIENT_ID: 'google-client-id',
        GOOGLE_CALENDAR_CLIENT_SECRET: 'google-client-secret-0123456789abcdef',
        GOOGLE_CALENDAR_REDIRECT_URI:
          'https://ordotodo.app/api/v1/integrations/google/callback',
        APP_URL: 'https://ordotodo.app',
      };
      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCalendarProvider,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    provider = module.get<GoogleCalendarProvider>(GoogleCalendarProvider);
    (provider as any).doFetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should build the authorize URL with calendar scope and offline access', () => {
    const url = new URL(provider.getAuthorizeUrl('state-123'));

    expect(url.origin + url.pathname).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(url.searchParams.get('client_id')).toBe('google-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://ordotodo.app/api/v1/integrations/google/callback',
    );
    expect(url.searchParams.get('scope')).toContain(
      'https://www.googleapis.com/auth/calendar',
    );
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toBe('consent');
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.get('response_type')).toBe('code');
  });

  it('should exchange a code for tokens via google-auth-library', async () => {
    const tokens = await provider.exchangeCode(
      'auth-code-1',
      mockTokenClient({
        access_token: 'ya29.access',
        refresh_token: 'refresh-1',
        expiry_date: Date.now() + 3600_000,
        scope: 'https://www.googleapis.com/auth/calendar',
      }),
    );

    expect(tokens.accessToken).toBe('ya29.access');
    expect(tokens.refreshToken).toBe('refresh-1');
    expect(tokens.expiresAt).toBeInstanceOf(Date);
    expect(tokens.scope).toContain('calendar');
  });

  it('should refresh an expired access token', async () => {
    const tokens = await provider.refreshAccessToken(
      'refresh-1',
      mockTokenClient({
        access_token: 'ya29.access-2',
        expiry_date: Date.now() + 3600_000,
      }),
    );

    expect(tokens.accessToken).toBe('ya29.access-2');
    // No new refresh token issued → keep the old one.
    expect(tokens.refreshToken).toBe('refresh-1');
  });

  it('should throw UnauthorizedException when Google rejects the grant', async () => {
    const failing = {
      getToken: jest.fn().mockRejectedValue(new Error('invalid_grant')),
    };

    await expect(
      provider.exchangeCode('bad-code', failing as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  function mockTokenClient(tokens: Record<string, unknown>) {
    return {
      getToken: jest.fn().mockResolvedValue({ tokens }),
      setCredentials: jest.fn(),
      refreshAccessToken: jest.fn().mockResolvedValue({ credentials: tokens }),
    };
  }
});
