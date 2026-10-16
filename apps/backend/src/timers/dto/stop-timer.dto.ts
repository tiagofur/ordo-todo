import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StopTimerDto {
  @ApiPropertyOptional({
    description:
      'ID of the specific session to stop (optional, defaults to active session)',
    example: 'session-123',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Whether the associated task was completed',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  wasCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'Optional notes about the completed session',
    example: 'Completed task ahead of schedule',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
