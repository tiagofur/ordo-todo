import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { MemberRole } from '@ordo-todo/core';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsEnum(['ADMIN', 'MEMBER', 'VIEWER'], {
    message: 'Role must be one of: ADMIN, MEMBER, VIEWER',
  })
  @IsOptional()
  role?: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
