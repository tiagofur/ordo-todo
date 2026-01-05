import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsHexColor,
  IsUUID,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  x?: number;

  @IsInt()
  @IsOptional()
  y?: number;

  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsInt()
  @IsOptional()
  width?: number;

  @IsInt()
  @IsOptional()
  height?: number;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;
}
