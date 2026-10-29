import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import '../src/i18n';
import { WxtTokenStorage, clearSession, getSession } from '../src/lib/auth';

beforeEach(async () => {
  await fakeBrowser.reset();
});

describe('WxtTokenStorage (ODD 024 T3: adaptador api-client)', () => {
  const validTokens = {
    accessToken: 'live-access',
    refreshToken: 'live-refresh',
    expiresAt: Date.now() + 3600_000,
    scope: 'read tasks:write',
  };

  it('getToken devuelve el access token de la sesión válida', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: validTokens,
      ordoSession: { email: 'o@r.do' },
    });

    const storage = new WxtTokenStorage();
    expect(await storage.getToken()).toBe('live-access');
    expect(await storage.getRefreshToken()).toBe('live-refresh');
  });

  it('getToken sin sesión devuelve null (la API recibirá 401 limpio)', async () => {
    const storage = new WxtTokenStorage();
    expect(await storage.getToken()).toBeNull();
  });

  it('setToken/setRefreshToken actualizan la sesión existente; removeToken limpia', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: validTokens,
      ordoSession: { email: 'o@r.do' },
    });

    const storage = new WxtTokenStorage();
    await storage.setToken('rotated');
    await storage.setRefreshToken('rotated-refresh');

    const stored = await fakeBrowser.storage.session.get(null);
    expect(stored.ordoTokens.accessToken).toBe('rotated');
    expect(stored.ordoTokens.refreshToken).toBe('rotated-refresh');

    await storage.removeToken();
    expect(await getSession()).toBeNull();
  });

  it('clearSession vacía tokens y sesión', async () => {
    await fakeBrowser.storage.session.set({
      ordoTokens: validTokens,
      ordoSession: { email: 'o@r.do' },
    });
    await clearSession();
    const stored = await fakeBrowser.storage.session.get(null);
    expect(stored.ordoTokens).toBeUndefined();
    expect(stored.ordoSession).toBeUndefined();
  });
});
