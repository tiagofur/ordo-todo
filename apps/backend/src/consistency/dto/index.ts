import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ConsistencyPeriod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetGoalDto {
  @ApiProperty({
    description: 'Target number of content pieces to publish',
    minimum: 1,
    maximum: 30,
  })
  @IsInt()
  @Min(1)
  @Max(30)
  targetContent: number;

  @ApiPropertyOptional({
    description: 'Period type for the goal',
    enum: ConsistencyPeriod,
    default: 'WEEKLY',
  })
  @IsEnum(ConsistencyPeriod)
  @IsOptional()
  periodType?: ConsistencyPeriod;
}

export class ConsistencyScoreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: ConsistencyPeriod })
  periodType: ConsistencyPeriod;

  @ApiProperty()
  score: number;

  @ApiProperty()
  contentPublished: number;

  @ApiProperty()
  targetContent: number;

  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiPropertyOptional()
  platformBreakdown?: Record<string, number>;

  @ApiProperty()
  createdAt: Date;
}

export class ConsistencyStatsDto {
  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiProperty()
  thisWeekPublished: number;

  @ApiProperty()
  thisWeekTarget: number;

  @ApiProperty()
  thisWeekScore: number;

  @ApiProperty()
  thisMonthPublished: number;

  @ApiProperty()
  totalPublished: number;

  @ApiProperty({ type: [Object] })
  recentScores: ConsistencyScoreResponseDto[];

  @ApiProperty()
  platformStats: Record<string, number>;
}
