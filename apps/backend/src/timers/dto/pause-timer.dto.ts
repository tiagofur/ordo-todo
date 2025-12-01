import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PauseTimerDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  pauseStartedAt?: Date;
}
