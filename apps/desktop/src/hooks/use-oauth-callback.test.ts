import { renderHook, act } from '@testing-library/react';
import { useOAuthCallback } from './use-oauth-callback';

// Mock React Router
const mocks = vi.hoisted(() => {
  const deepLinkHandlers: Array<(url: string) => void> = [];
  const unlisten = vi.fn();
  return {
    navigate: vi.fn(),
    invalidateQueries: vi.fn(() => Promise.resolve()),
    storeOAuthTokens: vi.fn(() => Promise.resolve(true)),
    unlisten,
    deepLinkHandlers,
    onDeepLinkUrl: vi.fn((cb: (url: string) => void) => {
      deepLinkHandlers.push(cb);
      return unlisten;
    }),
    getDeepLinkLaunchUrls: vi.fn(() => Promise.resolve([] as string[])),
    isDesktop: vi.fn(() => true),
    isMainWindow: vi.fn(() => true),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));

vi.mock('sonner', () => ({
  toast: mocks.toast,
}));

// t() interpolado: las claves Auth.* viven en los catálogos i18n reales.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) =>
      opts?.error ? `${key}: ${opts.error}` : key,
  }),
}));

vi.mock('@/lib/desktop-bridge', () => ({
  desktopBridge: {
    isDesktop: mocks.isDesktop,
    isMainWindow: mocks.isMainWindow,
    onDeepLinkUrl: mocks.onDeepLinkUrl,
    getDeepLinkLaunchUrls: mocks.getDeepLinkLaunchUrls,
  },
}));

// Keep the real URL parser; only isolate token persistence.
vi.mock('@/lib/oauth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/oauth')>();
  return {
    ...actual,
    storeOAuthTokens: mocks.storeOAuthTokens,
  };
});

const oauthUrl = (query: string) => `ordo://auth/callback?${query}`;

describe('useOAuthCallback (desktop deep links)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deepLinkHandlers.length = 0;
    mocks.isDesktop.mockReturnValue(true);
    mocks.isMainWindow.mockReturnValue(true);
    mocks.getDeepLinkLaunchUrls.mockResolvedValue([]);
    mocks.storeOAuthTokens.mockResolvedValue(true);
  });

  it('processes a cold-start ordo:// OAuth callback end to end', async () => {
    mocks.getDeepLinkLaunchUrls.mockResolvedValue([
      oauthUrl('access_token=at-123&refresh_token=rt-456'),
    ]);

    renderHook(() => useOAuthCallback());
    await act(async () => {}); // flush launch-URL promise

    expect(mocks.onDeepLinkUrl).toHaveBeenCalledTimes(1);
    expect(mocks.storeOAuthTokens).toHaveBeenCalledWith({
      accessToken: 'at-123',
      refreshToken: 'rt-456',
    });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentUser'],
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/dashboard');
    expect(mocks.toast.success).toHaveBeenCalled();
    expect(mocks.toast.error).not.toHaveBeenCalled();
  });

  it('processes a live deep-link event delivered while running', async () => {
    renderHook(() => useOAuthCallback());
    await act(async () => {});

    expect(mocks.deepLinkHandlers).toHaveLength(1);
    await act(async () => {
      mocks.deepLinkHandlers[0](oauthUrl('access_token=a&refresh_token=b'));
    });

    expect(mocks.storeOAuthTokens).toHaveBeenCalledWith({
      accessToken: 'a',
      refreshToken: 'b',
    });
    expect(mocks.navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('processes a URL only once even if delivered twice', async () => {
    const url = oauthUrl('access_token=a&refresh_token=b');
    mocks.getDeepLinkLaunchUrls.mockResolvedValue([url]);

    renderHook(() => useOAuthCallback());
    await act(async () => {}); // cold start
    await act(async () => {
      mocks.deepLinkHandlers[0](url); // live event, same URL
    });

    expect(mocks.storeOAuthTokens).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledTimes(1);
  });

  it('ignores deep links without OAuth params', async () => {
    renderHook(() => useOAuthCallback());
    await act(async () => {});

    await act(async () => {
      mocks.deepLinkHandlers[0]('ordo://task/123?action=open');
    });

    expect(mocks.storeOAuthTokens).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('surfaces OAuth errors without navigating', async () => {
    renderHook(() => useOAuthCallback());
    await act(async () => {});

    await act(async () => {
      mocks.deepLinkHandlers[0](oauthUrl('error=access_denied'));
    });

    expect(mocks.toast.error).toHaveBeenCalledWith('Auth.oauthError: access_denied');
    expect(mocks.storeOAuthTokens).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('does not subscribe outside the main window (mini-timer)', async () => {
    mocks.isMainWindow.mockReturnValue(false);

    renderHook(() => useOAuthCallback());
    await act(async () => {});

    expect(mocks.onDeepLinkUrl).not.toHaveBeenCalled();
    expect(mocks.getDeepLinkLaunchUrls).not.toHaveBeenCalled();
  });

  it('unsubscribes from deep links on unmount', async () => {
    const { unmount } = renderHook(() => useOAuthCallback());
    await act(async () => {});

    unmount();
    expect(mocks.unlisten).toHaveBeenCalledTimes(1);
  });
});
