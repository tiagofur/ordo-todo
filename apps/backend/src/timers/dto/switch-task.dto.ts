import { IsString, IsEnum, IsOptional } from 'class-validator';

export class SwitchTaskDto {
  @IsString()
  newTaskId: string;

  @IsEnum(['WORK', 'SHORT_BREAK', 'LONG_BREAK'])
  @IsOptional()
  type?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

  @IsString()
  @IsOptional()
  splitReason?: string;
}
