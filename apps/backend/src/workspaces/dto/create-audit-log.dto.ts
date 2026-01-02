import { IsString, MinLength, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @MinLength(1)
  action: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;
}
