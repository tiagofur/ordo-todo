import { IsBoolean, IsOptional } from 'class-validator';

export class StopTimerDto {
  @IsBoolean()
  @IsOptional()
  wasCompleted?: boolean;
}
