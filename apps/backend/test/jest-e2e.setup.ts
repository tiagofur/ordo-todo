/**
 * Global e2e environment: existing specs register users directly, so the
 * default invite-only gate (ODD 019) must not apply here. Specs that need the
 * gate set REGISTRATION_MODE themselves (see invite-registration.e2e-spec.ts).
 */
process.env.REGISTRATION_MODE = 'open';

/**
 * The OAuth strategies are instantiated with AppModule and passport throws
 * without a clientID. No e2e spec exercises OAuth, but every spec imports
 * AppModule and .env is no longer part of the repository, so provide dummies
 * unless the environment already defines real values.
 */
process.env.GOOGLE_CLIENT_ID ||= 'e2e-google-client-id';
process.env.GOOGLE_CLIENT_SECRET ||= 'e2e-google-client-secret';
process.env.GOOGLE_CALLBACK_URL ||=
  'http://localhost:3101/api/v1/auth/google/callback';
process.env.GITHUB_CLIENT_ID ||= 'e2e-github-client-id';
process.env.GITHUB_CLIENT_SECRET ||= 'e2e-github-client-secret';
process.env.GITHUB_CALLBACK_URL ||=
  'http://localhost:3101/api/v1/auth/github/callback';
