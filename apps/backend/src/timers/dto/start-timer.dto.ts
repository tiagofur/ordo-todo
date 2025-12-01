import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class StartTimerDto {
  @IsOptional()
  taskId?: string;

  @IsEnum(['WORK', 'SHORT_BREAK', 'LONG_BREAK', 'CONTINUOUS'])
  @IsOptional()
  type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CONTINUOUS';
}
