import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsHexColor,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @IsOptional()
  x?: number;

  @IsNumber()
  @IsOptional()
  y?: number;

  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}
