export const SLACK_SIGNATURE_VERSION = 'v0';
export const SLACK_SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

export const SLACK_OAUTH_AUTHORIZE_URL = 'https://slack.com/oauth/v2/authorize';
export const SLACK_OAUTH_TOKEN_URL = 'https://slack.com/api/oauth.v2.access';

export const SLACK_BOT_SCOPES = [
  'chat:write',
  'chat:write.public',
  'commands',
  'users:read',
  'users.profile:read',
  'users.profile:write',
  'channels:read',
  'groups:read',
  'im:read',
].join(',');

export const SLACK_REQUEST_TIMEOUT_MS = 15_000;
