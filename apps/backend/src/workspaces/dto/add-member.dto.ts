import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { MemberRole } from '@ordo-todo/core';

export class AddMemberDto {
  @IsString()
  @MinLength(1)
  userId: string;

  @IsEnum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'], {
    message: 'Role must be one of: OWNER, ADMIN, MEMBER, VIEWER',
  })
  @IsOptional()
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}
