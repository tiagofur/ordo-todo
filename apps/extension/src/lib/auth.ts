import { browser } from 'wxt/browser';
import { storage } from 'wxt/utils/storage';
import type { TokenStorage } from '@ordo-todo/api-client';
import {
  API_BASE_URL,
  OAUTH_CLIENT_ID,
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPES,
} from './config';
import { createPkcePair } from './pkce';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms en el que el access token deja de ser válido (con margen). */
  expiresAt: number;
  scope: string;
}

export interface Session {
  email: string;
  name?: string;
}

export class UnauthorizedError extends Error {
  constructor() {
    super('not authenticated');
    this.name = 'UnauthorizedError';
  }
}

const tokensItem = storage.defineItem<OAuthTokens | null>('session:ordoTokens', {
  fallback: null,
});
const sessionItem = storage.defineItem<Session | null>('session:ordoSession', {
  fallback: null,
});

export async function getSession(): Promise<Session | null> {
  const tokens = await getValidTokens();
  if (!tokens) return null;
  return sessionItem.getValue();
}

/** Devuelve tokens válidos, refrescando en silencio si expiraron. */
export async function getValidTokens(): Promise<OAuthTokens | null> {
  const tokens = await tokensItem.getValue();
  if (!tokens) return null;
  if (Date.now() < tokens.expiresAt) return tokens;

  const refreshed = await refreshTokens(tokens.refreshToken);
  if (!refreshed) return null;
  return refreshed;
}

export async function startLogin(): Promise<Session> {
  const { verifier, challenge } = await createPkcePair();
  const state = base64UrlRandom(16);
  const authorizeUrl = new URL(`${API_BASE_URL}/oauth/authorize`);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', OAUTH_SCOPES.join(' '));
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge', challenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');

  const redirectUrl = await browser.identity.launchWebAuthFlow({
    url: authorizeUrl.toString(),
    interactive: true,
  });
  if (!redirectUrl) {
    throw new Error('oauth: no redirect url');
  }
  const redirect = new URL(redirectUrl);
  const code = redirect.searchParams.get('code');
  const returnedState = redirect.searchParams.get('state');
  const oauthError = redirect.searchParams.get('error');
  if (oauthError) {
    throw new Error(`oauth: ${oauthError}`);
  }
  if (!code || returnedState !== state) {
    throw new Error('oauth: invalid callback');
  }

  const tokens = await exchangeCode(code, verifier);
  const session = await fetchSession(tokens.accessToken);
  await Promise.all([tokensItem.setValue(tokens), sessionItem.setValue(session)]);
  return session;
}

export async function logout(): Promise<void> {
  const tokens = await tokensItem.getValue();
  await tokensItem.setValue(null);
  await sessionItem.setValue(null);
  if (!tokens) return;
  try {
    await tokenRequest('revoke', new URLSearchParams({
      token: tokens.refreshToken,
      client_id: OAUTH_CLIENT_ID,
    }));
  } catch {
    // El logout local no debe fallar aunque el revoke remoto no responda.
  }
}

async function exchangeCode(code: string, verifier: string): Promise<OAuthTokens> {
  const body = await tokenRequest(
    'token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: OAUTH_CLIENT_ID,
      redirect_uri: OAUTH_REDIRECT_URI,
      code_verifier: verifier,
    }),
  );
  return toTokens(body);
}

async function refreshTokens(refreshToken: string): Promise<OAuthTokens | null> {
  let body: TokenResponse;
  try {
    body = await tokenRequest(
      'token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OAUTH_CLIENT_ID,
      }),
    );
  } catch {
    // Refresh inválido o expirado: la sesión termina aquí.
    await tokensItem.setValue(null);
    await sessionItem.setValue(null);
    return null;
  }
  const tokens = toTokens(body);
  await tokensItem.setValue(tokens);
  return tokens;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

function toTokens(body: TokenResponse): OAuthTokens {
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    // 60s de margen para no mandar tokens a punto de caducar.
    expiresAt: Date.now() + Math.max(0, body.expires_in - 60) * 1000,
    scope: body.scope,
  };
}

async function tokenRequest(
  endpoint: 'token' | 'revoke',
  params: URLSearchParams,
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE_URL}/oauth/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!res.ok) {
    throw new Error(`oauth ${endpoint}: ${res.status}`);
  }
  return res.json();
}

async function fetchSession(accessToken: string): Promise<Session> {
  const res = await fetch(`${API_BASE_URL}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`oauth userinfo: ${res.status}`);
  }
  const body = (await res.json()) as { email: string; name?: string };
  return { email: body.email, name: body.name };
}

/** fetch autenticado contra la API: Bearer + un reintento tras refresh. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = async (accessToken: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

  const tokens = await getValidTokens();
  if (!tokens) {
    throw new UnauthorizedError();
  }

  let res = await doFetch(tokens.accessToken);
  if (res.status === 401) {
    const refreshed = await refreshTokens(tokens.refreshToken);
    if (!refreshed) {
      throw new UnauthorizedError();
    }
    res = await doFetch(refreshed.accessToken);
  }
  if (!res.ok) {
    throw new Error(`api ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function base64UrlRandom(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function clearSession(): Promise<void> {
  await tokensItem.setValue(null);
  await sessionItem.setValue(null);
}

/**
 * Adaptador TokenStorage para `OrdoApiClient` (@ordo-todo/api-client).
 * getToken() devuelve SIEMPRE un access token fresco (refresca antes de
 * caducar), así que el refresh interno del cliente —que apunta a
 * /auth/refresh, semántica JWT de la app web— nunca debería dispararse; queda
 * como red de seguridad y su fallo limpia la sesión vía onAuthError.
 */
export class WxtTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null> {
    return (await getValidTokens())?.accessToken ?? null;
  }

  async setToken(accessToken: string): Promise<void> {
    const current = await tokensItem.getValue();
    if (current) await tokensItem.setValue({ ...current, accessToken });
  }

  async removeToken(): Promise<void> {
    await clearSession();
  }

  async getRefreshToken(): Promise<string | null> {
    return (await tokensItem.getValue())?.refreshToken ?? null;
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    const current = await tokensItem.getValue();
    if (current) await tokensItem.setValue({ ...current, refreshToken });
  }

  async removeRefreshToken(): Promise<void> {
    await clearSession();
  }
}
