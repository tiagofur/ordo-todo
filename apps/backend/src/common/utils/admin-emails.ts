import { ConfigService } from '@nestjs/config';

/** Default platform admins when ADMIN_EMAILS is unset (ODD 019). */
export const DEFAULT_ADMIN_EMAILS = ['tiagofur@gmail.com'];

/** ADMIN_EMAILS (comma-separated, case-insensitive) with the coded default. */
export function resolveAdminEmails(configService: ConfigService): string[] {
  const configured = (configService.get<string>('ADMIN_EMAILS') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(
  configService: ConfigService,
  email?: string | null,
): boolean {
  if (!email) return false;
  return resolveAdminEmails(configService).includes(email.toLowerCase());
}
