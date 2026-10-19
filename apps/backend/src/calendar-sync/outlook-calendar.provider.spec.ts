import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { OutlookCalendarProvider } from './outlook-calendar.provider';
import { CALENDAR_FETCH } from './calendar.constants';

describe('OutlookCalendarProvider', () => {
  let provider: OutlookCalendarProvider;
  const mockFetch = jest.fn();

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        MICROSOFT_CLIENT_ID: 'ms-client-id',
        MICROSOFT_CLIENT_SECRET: 'ms-client-secret-0123456789abcdef',
        MICROSOFT_REDIRECT_URI:
          'https://ordotodo.app/api/v1/integrations/microsoft/callback',
      };
      return values[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutlookCalendarProvider,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CALENDAR_FETCH, useValue: mockFetch },
      ],
    }).compile();

    provider = module.get<OutlookCalendarProvider>(OutlookCalendarProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should build the authorize URL with Calendars scopes', () => {
    const url = new URL(provider.getAuthorizeUrl('state-456'));

    expect(url.origin + url.pathname).toBe(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    );
    expect(url.searchParams.get('client_id')).toBe('ms-client-id');
    expect(url.searchParams.get('scope')).toContain('Calendars.ReadWrite');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('response_mode')).toBe('query');
    expect(url.searchParams.get('state')).toBe('state-456');
  });

  it('should exchange a code via form-encoded token request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'ms.access',
        refresh_token: 'ms.refresh',
        expires_in: 3600,
        scope: 'Calendars.ReadWrite offline_access',
      }),
      text: async () => '',
    });

    const tokens = await provider.exchangeCode('ms-code-1');

    expect(tokens.accessToken).toBe('ms.access');
    expect(tokens.refreshToken).toBe('ms.refresh');
    expect(tokens.expiresAt).toBeInstanceOf(Date);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    );
    expect(init.headers['content-type']).toContain(
      'application/x-www-form-urlencoded',
    );
    expect(init.body).toContain('grant_type=authorization_code');
    expect(init.body).toContain('code=ms-code-1');
  });

  it('should refresh with grant_type=refresh_token and keep old refresh when absent', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: 'ms.access-2',
        expires_in: 3600,
      }),
      text: async () => '',
    });

    const tokens = await provider.refreshAccessToken('ms.refresh-old');

    expect(tokens.accessToken).toBe('ms.access-2');
    expect(tokens.refreshToken).toBe('ms.refresh-old');
    expect(mockFetch.mock.calls[0][1].body).toContain(
      'grant_type=refresh_token',
    );
  });

  it('should throw UnauthorizedException on invalid_grant', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid_grant' }),
      text: async () => 'invalid_grant',
    });

    await expect(provider.exchangeCode('bad')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
