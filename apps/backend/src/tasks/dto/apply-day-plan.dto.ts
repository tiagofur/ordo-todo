import { IsString, MinLength } from 'class-validator';

// ODD 005 S3 (T3b): apply a proposed day plan onto tasks.
export class ApplyDayPlanDto {
  @IsString()
  @MinLength(1)
  proposalId: string;
}
