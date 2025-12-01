import { IsString, MinLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttachmentDto {
  @IsString()
  @MinLength(1)
  taskId: string;

  @IsString()
  @MinLength(1)
  filename: string;

  @IsString()
  @MinLength(1)
  url: string; // Can be relative (/uploads/...) or absolute (http://...)

  @IsString()
  @MinLength(1)
  mimeType: string;

  @Type(() => Number)
  @IsNumber()
  filesize: number;
}
