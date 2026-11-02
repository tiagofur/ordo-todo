import { describe, expect, it } from 'vitest';
import { getCspConnectOrigins } from './csp';

describe('getCspConnectOrigins', () => {
  it('falls back to the production API origin with its wss twin', () => {
    expect(getCspConnectOrigins(undefined)).toEqual([
      'https://api.ordotodo.app',
      'wss://api.ordotodo.app',
    ]);
  });

  it('uses the origin of the configured API url and strips its path', () => {
    expect(getCspConnectOrigins('https://api.ordotodo.app/api/v1')).toEqual([
      'https://api.ordotodo.app',
      'wss://api.ordotodo.app',
    ]);
  });

  it('keeps a localhost api url for development builds', () => {
    expect(getCspConnectOrigins('http://localhost:3101/api/v1')).toEqual([
      'https://api.ordotodo.app',
      'wss://api.ordotodo.app',
      'http://localhost:3101',
      'ws://localhost:3101',
    ]);
  });

  it('ignores a malformed api url without throwing', () => {
    expect(getCspConnectOrigins('not a url')).toEqual([
      'https://api.ordotodo.app',
      'wss://api.ordotodo.app',
    ]);
  });
});
