export const CALENDAR_FETCH = Symbol('CALENDAR_FETCH');

export type CalendarFetch = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const MICROSOFT_AUTH_URL =
  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
export const MICROSOFT_TOKEN_URL =
  'https://login.microsoftonline.com/common/oauth2/v2.0/token';
export const MICROSOFT_SCOPES = [
  'Calendars.ReadWrite',
  'offline_access',
  'User.Read',
].join(' ');

export const CALENDAR_REQUEST_TIMEOUT_MS = 15_000;

/** Refresh proactively when fewer than 5 minutes of life remain. */
export const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000;

export type CalendarProviderId = 'GOOGLE_CALENDAR' | 'GOOGLE_TASKS';

export interface ProviderTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
}
