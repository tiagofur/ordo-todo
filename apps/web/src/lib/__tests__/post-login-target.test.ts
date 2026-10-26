import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config', () => ({
  API_CONFIG: { baseURL: 'https://api.ordotodo.app/api/v1' },
}));

import { resolvePostLoginTarget } from '../post-login-target';

describe('resolvePostLoginTarget (OAuth next)', () => {
  it('resolves the authorize bounce to the API origin', () => {
    expect(
      resolvePostLoginTarget('/api/v1/oauth/authorize?client_id=x&state=y'),
    ).toBe(
      'https://api.ordotodo.app/api/v1/oauth/authorize?client_id=x&state=y',
    );
  });

  it('resolves a real authorize URL with nested redirect_uri to OUR authorize', () => {
    expect(
      resolvePostLoginTarget(
        '/api/v1/oauth/authorize?client_id=ordo_cl_x&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcb&scope=read',
      ),
    ).toBe(
      'https://api.ordotodo.app/api/v1/oauth/authorize?client_id=ordo_cl_x&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcb&scope=read',
    );
  });

  it('returns null when next is missing or empty', () => {
    expect(resolvePostLoginTarget(null)).toBeNull();
    expect(resolvePostLoginTarget('')).toBeNull();
  });

  it('rejects absolute URLs, protocol-relative hosts and non-API paths', () => {
    expect(resolvePostLoginTarget('https://evil.test/phish')).toBeNull();
    expect(resolvePostLoginTarget('//evil.test/phish')).toBeNull();
    expect(resolvePostLoginTarget('/dashboard')).toBeNull();
    expect(resolvePostLoginTarget('/login')).toBeNull();
    expect(resolvePostLoginTarget('api/v1/oauth/authorize')).toBeNull();
  });

  it('rejects separator confusion, backslashes and control chars', () => {
    expect(resolvePostLoginTarget('/api\\/evil.test/phish')).toBeNull();
    expect(resolvePostLoginTarget('/api\\v1\\oauth')).toBeNull();
    expect(resolvePostLoginTarget('/api//evil.test/phish')).toBeNull();
    expect(resolvePostLoginTarget('/api@evil.test/phish')).toBeNull();
    expect(resolvePostLoginTarget('/API/v1/oauth/authorize')).toBeNull();
    expect(resolvePostLoginTarget('/api/v1/oauth\n')).toBeNull();
    expect(resolvePostLoginTarget('/api/v1/oauth\x00')).toBeNull();
  });
});
