import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getSession, logout, startLogin } from '../src/lib/auth';

const TOKEN_RESPONSE = (refresh = 'refresh-2') => ({
  access_token: 'new-access',
  refresh_token: refresh,
  expires_in: 3600,
  scope: 'read tasks:write',
});

const USERINFO = { sub: 'u9', email: 'owner@ordotodo.app', name: 'Owner' };

const mockFetch = vi.fn();

beforeEach(async () => {
  await fakeBrowser.reset();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('auth (ODD 024 T2)', () => {
  describe('startLogin', () => {
    it('canjea el código, guarda tokens y sesión (userinfo)', async () => {
      const launchFlow = vi
        .spyOn(fakeBrowser.identity, 'launchWebAuthFlow')
        .mockImplementation(async ({ url }) => {
          // El callback devuelve el mismo state que envió el flujo.
          const state = new URL(url).searchParams.get('state');
          return `https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/?code=abc&state=${state}`;
        });
      mockFetch
        .mockResolvedValueOnce(Response.json(TOKEN_RESPONSE('refresh-1')))
        .mockResolvedValueOnce(Response.json(USERINFO));

      const session = await startLogin();

      expect(session).toEqual({ email: 'owner@ordotodo.app', name: 'Owner' });
      // authorize: PKCE S256, cliente y redirect correctos
      const authorizeUrl = new URL(launchFlow.mock.calls[0][0].url);
      expect(authorizeUrl.pathname).toContain('/oauth/authorize');
      expect(authorizeUrl.searchParams.get('client_id')).toBe(
        'kljihfnniklhlmkpamdibbbjghinooaf',
      );
      expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
        'https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/',
      );
      expect(authorizeUrl.searchParams.get('response_type')).toBe('code');
      expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');
      expect(authorizeUrl.searchParams.get('code_challenge')).toBeTruthy();
      expect(authorizeUrl.searchParams.get('scope')).toContain('tasks:write');
      // token: form-urlencoded con el verifier
      const tokenCall = mockFetch.mock.calls[0];
      expect(tokenCall[0]).toContain('/oauth/token');
      const body = tokenCall[1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('code')).toBe('abc');
      expect(body.get('code_verifier')).toBeTruthy();
      // userinfo: Bearer
      expect(mockFetch.mock.calls[1][0]).toContain('/oauth/userinfo');
      expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe(
        'Bearer new-access',
      );
    });

    it('rechaza si el OAuth server devuelve error en el callback', async () => {
      vi.spyOn(fakeBrowser.identity, 'launchWebAuthFlow').mockResolvedValue(
        'https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/?error=access_denied',
      );
      mockFetch.mockResolvedValueOnce(Response.json(TOKEN_RESPONSE()));

      await expect(startLogin()).rejects.toThrow('access_denied');
    });

    it('rechaza si el state devuelto no coincide (CSRF)', async () => {
      vi.spyOn(fakeBrowser.identity, 'launchWebAuthFlow').mockResolvedValue(
        'https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/?code=abc&state=otro',
      );
      mockFetch.mockResolvedValueOnce(Response.json(TOKEN_RESPONSE()));

      await expect(startLogin()).rejects.toThrow('invalid callback');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getSession / refresh', () => {
    it('devuelve null sin sesión', async () => {
      expect(await getSession()).toBeNull();
    });

    it('refresca en silencio un token expirado', async () => {
      // Sesión ya guardada (simula login previo), token caducado hace 1h.
      await fakeBrowser.storage.session.set({
        ordoTokens: {
          accessToken: 'old-access',
          refreshToken: 'old-refresh',
          expiresAt: Date.now() - 3600_000,
          scope: 'read tasks:write',
        },
        ordoSession: { email: USERINFO.email },
      });
      mockFetch.mockResolvedValueOnce(Response.json(TOKEN_RESPONSE('new-refresh')));

      const session = await getSession();

      expect(session?.email).toBe(USERINFO.email);
      const refreshCall = mockFetch.mock.calls[0];
      expect(refreshCall[0]).toContain('/oauth/token');
      const body = refreshCall[1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('refresh_token');
      expect(body.get('refresh_token')).toBe('old-refresh');
      // Tokens rotados persistidos
      const stored = await fakeBrowser.storage.session.get('ordoTokens');
      expect(stored.ordoTokens.refreshToken).toBe('new-refresh');
    });

    it('single-flight: dos refresh concurrentes hacen UNA sola llamada al token endpoint', async () => {
      await fakeBrowser.storage.session.set({
        ordoTokens: {
          accessToken: 'old-access',
          refreshToken: 'old-refresh',
          expiresAt: Date.now() - 3600_000,
          scope: 'read tasks:write',
        },
        ordoSession: { email: USERINFO.email },
      });
      mockFetch.mockResolvedValue(Response.json(TOKEN_RESPONSE('rotated')));

      const [a, b] = await Promise.all([getSession(), getSession()]);

      expect(a?.email).toBe(USERINFO.email);
      expect(b?.email).toBe(USERINFO.email);
      const tokenCalls = mockFetch.mock.calls.filter(([url]) =>
        String(url).includes('/oauth/token'),
      );
      expect(tokenCalls).toHaveLength(1);
    });

    it('CAS: si otro contexto rotó el token durante un refresh fallido, la sesión sobrevive', async () => {
      await fakeBrowser.storage.session.set({
        ordoTokens: {
          accessToken: 'old-access',
          refreshToken: 'old-refresh',
          expiresAt: Date.now() - 3600_000,
          scope: 'read tasks:write',
        },
        ordoSession: { email: USERINFO.email },
      });
      // Simula al "ganador": otro contexto rota tokens mientras el nuestro falla.
      const rotated = {
        accessToken: 'fresh-access',
        refreshToken: 'fresh-refresh',
        expiresAt: Date.now() + 3600_000,
        scope: 'read tasks:write',
      };
      mockFetch.mockImplementationOnce(async () => {
        await fakeBrowser.storage.session.set({ ordoTokens: rotated });
        return new Response('invalid_grant', { status: 400 });
      });

      const session = await getSession();

      // El refresh falló, pero NO borró la sesión del ganador.
      const stored = await fakeBrowser.storage.session.get(null);
      expect(stored.ordoTokens.refreshToken).toBe('fresh-refresh');
      expect(stored.ordoSession).toBeDefined();
      expect(session).toBeNull();
      // Y una segunda lectura ya usa el token fresco del ganador.
      expect((await getSession())?.email).toBe(USERINFO.email);
    });

    it('cierra la sesión cuando el refresh es inválido', async () => {
      await fakeBrowser.storage.session.set({
        ordoTokens: {
          accessToken: 'old-access',
          refreshToken: 'dead-refresh',
          expiresAt: Date.now() - 3600_000,
          scope: 'read tasks:write',
        },
        ordoSession: { email: USERINFO.email },
      });
      mockFetch.mockResolvedValueOnce(
        new Response('invalid_grant', { status: 400 }),
      );

      expect(await getSession()).toBeNull();
      const stored = await fakeBrowser.storage.session.get('ordoTokens');
      expect(stored.ordoTokens).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('revoca el refresh token y limpia el storage', async () => {
      await fakeBrowser.storage.session.set({
        ordoTokens: {
          accessToken: 'a',
          refreshToken: 'r',
          expiresAt: Date.now() + 3600_000,
          scope: 'read tasks:write',
        },
        ordoSession: { email: USERINFO.email },
      });
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));

      await logout();

      expect(mockFetch.mock.calls[0][0]).toContain('/oauth/revoke');
      const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
      expect(body.get('token')).toBe('r');
      const stored = await fakeBrowser.storage.session.get(null);
      expect(stored.ordoTokens).toBeUndefined();
      expect(stored.ordoSession).toBeUndefined();
    });

    it('es un no-op seguro sin sesión', async () => {
      await logout();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
