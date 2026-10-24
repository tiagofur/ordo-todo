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

  it('returns no options without platform query', () => {
    const google = new GoogleOAuthPlatformGuard();
    const github = new GitHubOAuthPlatformGuard();
    expect(google.getAuthenticateOptions(createContext({}))).toBeUndefined();
    expect(github.getAuthenticateOptions(createContext({}))).toBeUndefined();
  });
});
