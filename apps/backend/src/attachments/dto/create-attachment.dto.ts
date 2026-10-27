import { IsString, MinLength, IsNumber, Min, Max } from 'class-validator';
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
  // El dominio (Attachment.validateSize) aplica el mismo cap; validar aquí
  // devuelve 400 en vez de un 500 genérico y evita 402 engañosos del
  // enforcement de storage (ODD 012 S4).
  @Min(1)
  @Max(10 * 1024 * 1024)
  filesize: number;
}
