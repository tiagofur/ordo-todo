import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ConsistencyService } from './consistency.service';
import {
  SetGoalDto,
  ConsistencyScoreResponseDto,
  ConsistencyStatsDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConsistencyPeriod } from '@prisma/client';

@ApiTags('Consistency')
@ApiBearerAuth()
@Controller('consistency')
@UseGuards(JwtAuthGuard)
export class ConsistencyController {
  constructor(private readonly consistencyService: ConsistencyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get current consistency stats and streaks' })
  @ApiResponse({ status: 200, type: ConsistencyStatsDto })
  async getStats(
    @CurrentUser('id') userId: string,
  ): Promise<ConsistencyStatsDto> {
    return this.consistencyService.getStats(userId);
  }

  @Post('goal')
  @ApiOperation({ summary: 'Set publishing goal' })
  @ApiResponse({ status: 201, type: ConsistencyScoreResponseDto })
  async setGoal(
    @CurrentUser('id') userId: string,
    @Body() dto: SetGoalDto,
  ): Promise<ConsistencyScoreResponseDto> {
    return this.consistencyService.setGoal(userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get consistency score history' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look back',
  })
  @ApiQuery({ name: 'periodType', required: false, enum: ConsistencyPeriod })
  @ApiResponse({ status: 200, type: [ConsistencyScoreResponseDto] })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('days') days?: string,
    @Query('periodType') periodType?: ConsistencyPeriod,
  ): Promise<ConsistencyScoreResponseDto[]> {
    return this.consistencyService.getHistory(userId, {
      days: days ? parseInt(days, 10) : undefined,
      periodType,
    });
  }

  @Post('recalculate')
  @ApiOperation({ summary: 'Recalculate consistency score for current period' })
  @ApiResponse({ status: 200, type: ConsistencyScoreResponseDto })
  async recalculate(
    @CurrentUser('id') userId: string,
  ): Promise<ConsistencyScoreResponseDto> {
    return this.consistencyService.recalculateScore(userId);
  }
}
