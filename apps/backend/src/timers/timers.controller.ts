import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { TimersService } from './timers.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { PauseTimerDto } from './dto/pause-timer.dto';
import { ResumeTimerDto } from './dto/resume-timer.dto';
import { SwitchTaskDto } from './dto/switch-task.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';
import { GetTimerStatsDto } from './dto/timer-stats.dto';

@Controller('timers')
@UseGuards(JwtAuthGuard)
export class TimersController {
  constructor(private readonly timersService: TimersService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  start(
    @Body() startTimerDto: StartTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.start(startTimerDto, user.id);
  }

  @Post('stop')
  stop(@Body() stopTimerDto: StopTimerDto, @CurrentUser() user: RequestUser) {
    return this.timersService.stop(stopTimerDto, user.id);
  }

  @Post('pause')
  pause(
    @Body() pauseTimerDto: PauseTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.pause(pauseTimerDto, user.id);
  }

  @Post('resume')
  resume(
    @Body() resumeTimerDto: ResumeTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.resume(resumeTimerDto, user.id);
  }

  @Post('switch-task')
  switchTask(
    @Body() switchTaskDto: SwitchTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.switchTask(switchTaskDto, user.id);
  }

  @Get('active')
  getActive(@CurrentUser() user: RequestUser) {
    return this.timersService.getActive(user.id);
  }

  @Get('history')
  getHistory(
    @Query() getSessionsDto: GetSessionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getSessionHistory(getSessionsDto, user.id);
  }

  @Get('stats')
  getStats(
    @Query() getStatsDto: GetTimerStatsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getTimerStats(getStatsDto, user.id);
  }

  @Get('task/:taskId')
  getTaskSessions(
    @Param('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getTaskSessions(taskId, user.id);
  }
}
