import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERSONAL', 'WORK', 'TEAM'])
  type: 'PERSONAL' | 'WORK' | 'TEAM';

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
