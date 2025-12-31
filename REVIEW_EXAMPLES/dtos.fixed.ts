/**
 * EJEMPLO: DTOs con documentación Swagger completa
 */

// ============ CREATE WORKSPACE DTO ============

import { IsString, MinLength, IsEnum, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Workspace name',
    example: 'My Workspace',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1, { message: 'Name must not be empty' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug (lowercase, alphanumeric, hyphens)',
    example: 'my-workspace',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @MinLength(1, { message: 'Slug must not be empty' })
  @MaxLength(50, { message: 'Slug must not exceed 50 characters' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Workspace description',
    example: 'A workspace for managing personal projects',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Type of workspace',
    enum: ['PERSONAL', 'WORK', 'TEAM'],
    example: 'PERSONAL',
  })
  @IsEnum(['PERSONAL', 'WORK', 'TEAM'], {
    message: 'Type must be one of: PERSONAL, WORK, TEAM',
  })
  type: 'PERSONAL' | 'WORK' | 'TEAM';

  @ApiPropertyOptional({
    description: 'Theme color in hex format',
    example: '#2563EB',
    pattern: '^#[0-9A-Fa-f]{6}$',
    default: '#2563EB',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g., #2563EB)',
  })
  color?: string;

  @ApiPropertyOptional({
    description: 'Workspace icon/emoji',
    example: '📁',
    maxLength: 10,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Icon must not exceed 10 characters' })
  icon?: string;
}

// ============ UPDATE WORKSPACE DTO ============

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({
    description: 'Workspace name',
    example: 'Updated Workspace Name',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Workspace description',
    example: 'Updated description',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of workspace',
    enum: ['PERSONAL', 'WORK', 'TEAM'],
  })
  @IsEnum(['PERSONAL', 'WORK', 'TEAM'])
  @IsOptional()
  type?: 'PERSONAL' | 'WORK' | 'TEAM';

  @ApiPropertyOptional({
    description: 'Theme color in hex format',
    example: '#10B981',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;

  @ApiPropertyOptional({
    description: 'Workspace icon/emoji',
    example: '🚀',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  icon?: string;
}

// ============ ADD MEMBER DTO ============

export class AddMemberDto {
  @ApiProperty({
    description: 'User ID to add as member',
    example: 'clx1234567890',
  })
  @IsString()
  @MinLength(1)
  userId: string;

  @ApiPropertyOptional({
    description: 'Role to assign to the member',
    enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'],
    default: 'MEMBER',
    example: 'MEMBER',
  })
  @IsEnum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
  @IsOptional()
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ============ INVITE MEMBER DTO ============

import { IsEmail } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address to send invitation',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiPropertyOptional({
    description: 'Role to assign when invitation is accepted',
    enum: ['ADMIN', 'MEMBER', 'VIEWER'],
    default: 'MEMBER',
    example: 'MEMBER',
    // Note: OWNER role cannot be assigned via invitation
  })
  @IsEnum(['ADMIN', 'MEMBER', 'VIEWER'], {
    message: 'Role must be one of: ADMIN, MEMBER, VIEWER',
  })
  @IsOptional()
  role?: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

// ============ ACCEPT INVITATION DTO ============

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token received via email',
    example: 'abc123def456ghi789',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'Token must be at least 10 characters' })
  token: string;
}

// ============ UPDATE WORKSPACE SETTINGS DTO ============

import { IsInt, Min, Max } from 'class-validator';

export class UpdateWorkspaceSettingsDto {
  @ApiPropertyOptional({
    description: 'Default view mode for workspace',
    enum: ['LIST', 'KANBAN', 'CALENDAR', 'TIMELINE', 'FOCUS'],
    example: 'KANBAN',
  })
  @IsOptional()
  @IsEnum(['LIST', 'KANBAN', 'CALENDAR', 'TIMELINE', 'FOCUS'], {
    message: 'View must be one of: LIST, KANBAN, CALENDAR, TIMELINE, FOCUS',
  })
  defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';

  @ApiPropertyOptional({
    description: 'Default due time in minutes from start of day (e.g., 540 = 9:00 AM)',
    example: 540,
    minimum: 0,
    maximum: 1439, // 23:59
  })
  @IsOptional()
  @IsInt({ message: 'Default due time must be an integer' })
  @Min(0, { message: 'Time must be at least 0 (00:00)' })
  @Max(1439, { message: 'Time must be at most 1439 (23:59)' })
  defaultDueTime?: number;

  @ApiPropertyOptional({
    description: 'Workspace timezone (IANA format)',
    example: 'America/Mexico_City',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Workspace locale (BCP 47 format)',
    example: 'es-MX',
    pattern: '^[a-z]{2}-[A-Z]{2}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}-[A-Z]{2}$/, {
    message: 'Locale must be in format: language-COUNTRY (e.g., es-MX)',
  })
  locale?: string;
}

/**
 * BENEFICIOS:
 * 1. Documentación automática en Swagger UI
 * 2. Mejor experiencia para desarrolladores frontend
 * 3. Validación completa con mensajes descriptivos
 * 4. Ejemplos y formatos claros
 * 5. Restricciones de longitud y formato
 * 6. Previene inyecciones y datos maliciosos
 */
