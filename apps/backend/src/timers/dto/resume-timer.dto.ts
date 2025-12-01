import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ResumeTimerDto {
  @IsDate()
  @Type(() => Date)
  pauseStartedAt: Date;
}
