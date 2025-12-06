import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @MinLength(1)
  workspaceId: string;

  @IsString()
  @MinLength(1)
  workflowId: string;
}
