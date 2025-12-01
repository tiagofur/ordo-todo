import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @MinLength(1)
  workspaceId: string;
}
