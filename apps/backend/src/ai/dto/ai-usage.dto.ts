import { IsInt, IsString, Max, Min } from 'class-validator';

export class AIRechargeDto {
  @IsString()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  amount: number;
}
