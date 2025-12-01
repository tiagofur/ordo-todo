import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @MinLength(1)
  userId: string;

  @IsEnum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
  @IsOptional()
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}
