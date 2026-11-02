import { plainToInstance, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  Max,
  MinLength,
  validateSync,
  IsOptional,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_EXPIRATION: string;

  @IsString()
  CORS_ORIGINS: string;

  // Dominio de las cookies de sesión (p. ej. ordotodo.app) para compartirlas
  // entre la web (dominio raíz) y la API (subdominio). Vacío = solo host.
  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  // Client IDs OAuth first-party (separados por coma, p. ej. la extensión de
  // Chrome, ODD 024). Sus access tokens llevan `api: 'full'` y autentican
  // /api/v1; los de clientes de terceros siguen limitados a MCP.
  @IsString()
  @IsOptional()
  OAUTH_FIRST_PARTY_CLIENT_IDS?: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALENDAR_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALENDAR_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALENDAR_REDIRECT_URI?: string;

  @IsString()
  @IsOptional()
  MICROSOFT_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  MICROSOFT_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  MICROSOFT_REDIRECT_URI?: string;

  @IsString()
  @IsOptional()
  SLACK_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  SLACK_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  SLACK_REDIRECT_URI?: string;

  @IsString()
  @IsOptional()
  SLACK_SIGNING_SECRET?: string;

  @IsEnum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
  @IsOptional()
  LOG_LEVEL?: string;

  // ODD 019: registration gate. 'invite-only' (default in code) requires a
  // valid InviteCode to create an account; 'open' allows public registration.
  @IsIn(['invite-only', 'open'])
  @IsOptional()
  REGISTRATION_MODE?: 'invite-only' | 'open';

  // ODD 019: platform admin emails (comma-separated). Empty defaults to
  // tiagofur@gmail.com in code; grants access to /admin endpoints.
  @IsString()
  @IsOptional()
  ADMIN_EMAILS?: string;

  // ODD 023: token que el portal de plugins de OpenAI sirve y luego
  // verifica en /.well-known/openai-apps-challenge al validar el dominio
  // del MCP. Vacío = el endpoint responde 404 (sin verificación en curso).
  @IsString()
  @IsOptional()
  OPENAI_APPS_CHALLENGE_TOKEN?: string;

  // ODD 029 T1: URLs/infra. Todas opcionales (el código trae fallbacks),
  // pero con formato validado cuando vienen seteadas. `require_tld:
  // false` para permitir http://localhost en desarrollo y
  // `require_protocol: true` para rechazar strings sin esquema.
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  FRONTEND_URL?: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  API_URL?: string;

  @IsString()
  @IsOptional()
  TZ?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  DB_POOL_MAX?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  DB_POOL_MIN?: number;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsBooleanString()
  @IsOptional()
  REDIS_ENABLED?: string;

  // ODD 029 T2: email. Todo opcional (EmailService cae a no-reply y a
  // Resend cuando hay API key); formato validado cuando viene seteado.
  @IsString()
  @IsOptional()
  EMAIL_FROM?: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsBooleanString()
  @IsOptional()
  SMTP_SECURE?: string;

  // ODD 029 T3: billing/seguridad/misc. Todo opcional: Stripe es lazy
  // (falla solo al usarse), ADMIN_API_KEY convive con ADMIN_EMAILS,
  // WEBHOOK_SECRET_KEY exige >=32 solo al cifrar (igual que el crypto
  // service) y el resto tiene defaults en código.
  @IsString()
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  STRIPE_PRICE_PRO_ANNUAL?: string;

  @IsString()
  @IsOptional()
  ADMIN_API_KEY?: string;

  @IsString()
  @MinLength(32)
  @IsOptional()
  WEBHOOK_SECRET_KEY?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  JWT_SECRET_ROTATION_DAYS?: number;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  GITHUB_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GITHUB_CLIENT_SECRET?: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  GITHUB_CALLBACK_URL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
