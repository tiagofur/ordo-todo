import { IsString, MinLength } from 'class-validator';

// ODD 005 S6 (T5): dismiss (reject) a proposed day plan.
export class DismissDayPlanDto {
  @IsString()
  @MinLength(1)
  proposalId: string;
}
