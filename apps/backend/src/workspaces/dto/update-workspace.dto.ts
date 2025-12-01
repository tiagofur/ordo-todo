import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERSONAL', 'WORK', 'TEAM'])
  @IsOptional()
  type?: 'PERSONAL' | 'WORK' | 'TEAM';

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
