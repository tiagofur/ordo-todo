export const OAUTH_REFRESH_TOKEN_PREFIX = 'ordo_rt_';

export const OAUTH_CODE_TTL_MS = 10 * 60 * 1000;

export const OAUTH_REFRESH_TOKEN_TTL_MS = 30 * 24 * 3600 * 1000;

export const OAUTH_ACCESS_TOKEN_TTL = '1h';

export const OAUTH_GRANT_TYPES = [
  'authorization_code',
  'refresh_token',
] as const;

export const OAUTH_CODE_CHALLENGE_METHODS = ['S256'] as const;

export const BCRYPT_ROUNDS = 10;
