import 'reflect-metadata';
import { validate } from './env.validation';

const baseValid = {
  NODE_ENV: 'test',
  PORT: '3101',
  API_PREFIX: 'api/v1',
  DATABASE_URL: 'postgresql://localhost:5432/ordo_test',
  JWT_SECRET: 'a'.repeat(32),
  JWT_EXPIRATION: '15m',
  JWT_REFRESH_EXPIRATION: '7d',
  CORS_ORIGINS: 'http://localhost:3100',
};

describe('env.validation (T1: URLs/infra)', () => {
  it('should accept a minimal valid config', () => {
    expect(() => validate({ ...baseValid })).not.toThrow();
  });

  it('should accept valid infra URLs and pool/limits', () => {
    expect(() =>
      validate({
        ...baseValid,
        FRONTEND_URL: 'http://localhost:3100',
        API_URL: 'https://api.ordotodo.app',
        TZ: 'America/Mexico_City',
        DB_POOL_MAX: '20',
        DB_POOL_MIN: '5',
        REDIS_URL: 'redis://localhost:6379',
        REDIS_ENABLED: 'true',
      }),
    ).not.toThrow();
  });

  it('should reject malformed FRONTEND_URL and API_URL', () => {
    expect(() =>
      validate({ ...baseValid, FRONTEND_URL: 'not-a-url' }),
    ).toThrow();
    expect(() => validate({ ...baseValid, API_URL: 'notaurl' })).toThrow();
  });

  it('should reject non-integer pool sizes', () => {
    expect(() => validate({ ...baseValid, DB_POOL_MAX: 'lots' })).toThrow();
    expect(() => validate({ ...baseValid, DB_POOL_MIN: '0' })).toThrow();
  });

  it('should reject non-boolean REDIS_ENABLED', () => {
    expect(() => validate({ ...baseValid, REDIS_ENABLED: 'yes' })).toThrow();
  });
});

describe('env.validation (T2: email)', () => {
  it('should accept a valid SMTP setup', () => {
    expect(() =>
      validate({
        ...baseValid,
        EMAIL_FROM: 'Ordo-Todo <no-reply@ordo-todo.app>',
        RESEND_API_KEY: 're_test_key',
        SMTP_HOST: 'smtp.resend.com',
        SMTP_PORT: '587',
        SMTP_USER: 'resend',
        SMTP_PASS: 'secret',
        SMTP_SECURE: 'false',
      }),
    ).not.toThrow();
  });

  it('should reject out-of-range SMTP_PORT and non-boolean SMTP_SECURE', () => {
    expect(() => validate({ ...baseValid, SMTP_PORT: '99999' })).toThrow();
    expect(() => validate({ ...baseValid, SMTP_PORT: 'smtp' })).toThrow();
    expect(() => validate({ ...baseValid, SMTP_SECURE: 'yes' })).toThrow();
  });
});

describe('env.validation (T3: billing/seguridad/misc)', () => {
  it('should accept a fully populated optional config', () => {
    expect(() =>
      validate({
        ...baseValid,
        STRIPE_SECRET_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
        STRIPE_PRICE_PRO_ANNUAL: 'price_123',
        ADMIN_API_KEY: 'admin-key',
        WEBHOOK_SECRET_KEY: 'k'.repeat(32),
        JWT_SECRET_ROTATION_DAYS: '30',
        GOOGLE_CLIENT_ID: 'google-id',
        GOOGLE_CLIENT_SECRET: 'google-secret',
        GOOGLE_CALLBACK_URL:
          'http://localhost:3101/api/v1/auth/google/callback',
        GITHUB_CLIENT_ID: 'github-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL:
          'http://localhost:3101/api/v1/auth/github/callback',
      }),
    ).not.toThrow();
  });

  it('should reject a short WEBHOOK_SECRET_KEY and bad rotation days', () => {
    expect(() =>
      validate({ ...baseValid, WEBHOOK_SECRET_KEY: 'short' }),
    ).toThrow();
    expect(() =>
      validate({ ...baseValid, JWT_SECRET_ROTATION_DAYS: '0' }),
    ).toThrow();
  });

  it('should reject malformed OAuth callback URLs', () => {
    expect(() =>
      validate({ ...baseValid, GOOGLE_CALLBACK_URL: 'notaurl' }),
    ).toThrow();
    expect(() =>
      validate({ ...baseValid, GITHUB_CALLBACK_URL: 'x' }),
    ).toThrow();
  });
});
