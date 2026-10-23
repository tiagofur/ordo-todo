import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsString,
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
