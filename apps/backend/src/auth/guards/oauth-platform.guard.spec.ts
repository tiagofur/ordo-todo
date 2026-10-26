import { ExecutionContext } from '@nestjs/common';
import {
  GitHubOAuthPlatformGuard,
  GoogleOAuthPlatformGuard,
} from './oauth-platform.guard';

describe('OAuthPlatformGuard', () => {
  const createContext = (query: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ query }),
      }),
    }) as unknown as ExecutionContext;

  it('propagates platform=desktop as OAuth state (google)', () => {
    const guard = new GoogleOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(createContext({ platform: 'desktop' })),
    ).toEqual({ state: 'desktop' });
  });

  it('propagates platform=desktop as OAuth state (github)', () => {
    const guard = new GitHubOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(createContext({ platform: 'desktop' })),
    ).toEqual({ state: 'desktop' });
  });

  it('propagates platform=mobile as OAuth state (google)', () => {
    const guard = new GoogleOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(createContext({ platform: 'mobile' })),
    ).toEqual({ state: 'mobile' });
  });

  it('propagates platform=mobile as OAuth state (github)', () => {
    const guard = new GitHubOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(createContext({ platform: 'mobile' })),
    ).toEqual({ state: 'mobile' });
  });

  it('returns no options without platform query', () => {
    const google = new GoogleOAuthPlatformGuard();
    const github = new GitHubOAuthPlatformGuard();
    expect(google.getAuthenticateOptions(createContext({}))).toBeUndefined();
    expect(github.getAuthenticateOptions(createContext({}))).toBeUndefined();
  });

  it('carries a validated ?next= as web:<base64url> state', () => {
    const guard = new GoogleOAuthPlatformGuard();
    const next = '/api/v1/oauth/authorize?client_id=x';
    const opts = guard.getAuthenticateOptions(createContext({ next })) as {
      state: string;
    };
    expect(opts.state).toMatch(/^web:/);
    const decoded = Buffer.from(opts.state.slice(4), 'base64url').toString(
      'utf8',
    );
    expect(decoded).toBe(next);
  });

  it('drops an unsafe ?next= instead of carrying it', () => {
    const guard = new GitHubOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(
        createContext({ next: 'https://evil.test/phish' }),
      ),
    ).toBeUndefined();
    expect(
      guard.getAuthenticateOptions(createContext({ next: '/dashboard' })),
    ).toBeUndefined();
  });

  it('prefers platform over next when both are present', () => {
    const guard = new GoogleOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(
        createContext({ platform: 'desktop', next: '/api/v1/x' }),
      ),
    ).toEqual({ state: 'desktop' });
  });

  it('ignores unknown platform values', () => {
    const guard = new GoogleOAuthPlatformGuard();
    expect(
      guard.getAuthenticateOptions(createContext({ platform: 'evil' })),
    ).toBeUndefined();
    expect(
      guard.getAuthenticateOptions(
        createContext({ platform: ['desktop'] as unknown as string }),
      ),
    ).toBeUndefined();
  });
});
