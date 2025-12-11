import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class LinkTaskDto {
  @IsString()
  taskId: string;

  @IsNumber()
  @Min(0.1)
  @Max(10)
  @IsOptional()
  weight?: number;
}
