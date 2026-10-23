import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInviteCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Label must be less than 100 characters' })
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class GrantProDto {
  @ApiPropertyOptional({
    description: 'Days of Pro; omit or null for indefinite',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  days?: number | null;
}
