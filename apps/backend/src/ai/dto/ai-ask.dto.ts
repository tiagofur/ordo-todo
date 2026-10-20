import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AIAskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
