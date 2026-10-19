export const API_TOKEN_PREFIX = 'ordo_pat_';

export const API_TOKEN_SCOPES = [
  'read',
  'tasks:write',
  'projects:write',
  'admin:webhooks',
] as const;

export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number];

export const BCRYPT_ROUNDS = 10;
