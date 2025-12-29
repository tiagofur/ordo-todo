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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('Timers')
@ApiBearerAuth()
@Controller('timers')
@UseGuards(JwtAuthGuard)
export class TimersController {
  constructor(private readonly timersService: TimersService) {}

  /**
   * Start a new work session
   * Creates a time session linked to a task or starts without task
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start timer',
    description:
      'Starts a new work session. Can be linked to a task or start without task.',
  })
  @ApiResponse({
    status: 201,
    description: 'Timer started successfully',
    schema: {
      example: {
        id: 'session-123',
        userId: 'user-123',
        taskId: 'task-456',
        type: 'POMODORO',
        durationMinutes: 25,
        startedAt: '2025-01-01T10:00:00Z',
        status: 'ACTIVE',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  start(
    @Body() startTimerDto: StartTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.start(startTimerDto, user.id);
  }

  /**
   * Stop the current work session
   * Completes the timer and updates analytics
   */
  @Post('stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop timer',
    description:
      'Stops the current active work session. Calculates worked minutes and updates analytics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Timer stopped successfully',
    schema: {
      example: {
        id: 'session-123',
        workedMinutes: 25,
        status: 'COMPLETED',
        endedAt: '2025-01-01T10:25:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No active timer or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  stop(@Body() stopTimerDto: StopTimerDto, @CurrentUser() user: RequestUser) {
    return this.timersService.stop(stopTimerDto, user.id);
  }

  /**
   * Pause the current work session
   * Temporarily pauses timer without completing it
   */
  @Post('pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pause timer',
    description:
      'Pauses the current active work session. Can be resumed later.',
  })
  @ApiResponse({
    status: 200,
    description: 'Timer paused successfully',
    schema: {
      example: {
        id: 'session-123',
        status: 'PAUSED',
        pausedAt: '2025-01-01T10:10:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No active timer or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  pause(
    @Body() pauseTimerDto: PauseTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.pause(pauseTimerDto, user.id);
  }

  /**
   * Resume a paused work session
   * Continues tracking time from where it was paused
   */
  @Post('resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resume timer',
    description: 'Resumes a paused work session and continues time tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Timer resumed successfully',
    schema: {
      example: {
        id: 'session-123',
        status: 'ACTIVE',
        resumedAt: '2025-01-01T10:15:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No paused timer or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  resume(
    @Body() resumeTimerDto: ResumeTimerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.resume(resumeTimerDto, user.id);
  }

  /**
   * Switch the active task for current session
   * Changes the task linked to the current timer without stopping it
   */
  @Post('switch-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Switch task',
    description:
      'Changes the task linked to the current active timer session without stopping it.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task switched successfully',
    schema: {
      example: {
        sessionId: 'session-123',
        previousTaskId: 'task-456',
        newTaskId: 'task-789',
        switchedAt: '2025-01-01T10:20:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No active timer or invalid task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  switchTask(
    @Body() switchTaskDto: SwitchTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.switchTask(switchTaskDto, user.id);
  }

  /**
   * Get the current active session
   * Returns the currently running or paused timer session
   */
  @Get('active')
  @ApiOperation({
    summary: 'Get active session',
    description:
      'Returns the currently active or paused timer session for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active session retrieved successfully',
    schema: {
      example: {
        id: 'session-123',
        taskId: 'task-456',
        type: 'POMODORO',
        status: 'ACTIVE',
        startedAt: '2025-01-01T10:00:00Z',
        workedSeconds: 600,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'No active session',
    schema: { example: null },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActive(@CurrentUser() user: RequestUser) {
    return this.timersService.getActive(user.id);
  }

  /**
   * Get session history
   * Returns paginated list of completed sessions with optional filters
   */
  @Get('history')
  @ApiOperation({
    summary: 'Get session history',
    description:
      'Returns a paginated list of completed time sessions. Can filter by date range.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter sessions from this date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter sessions until this date',
  })
  @ApiResponse({
    status: 200,
    description: 'Session history retrieved successfully',
    schema: {
      example: {
        sessions: [
          {
            id: 'session-123',
            taskId: 'task-456',
            type: 'POMODORO',
            status: 'COMPLETED',
            startedAt: '2025-01-01T10:00:00Z',
            endedAt: '2025-01-01T10:25:00Z',
            workedMinutes: 25,
          },
        ],
        total: 100,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHistory(
    @Query() getSessionsDto: GetSessionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getSessionHistory(getSessionsDto, user.id);
  }

  /**
   * Get timer statistics
   * Returns productivity analytics for a specified date range
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get timer statistics',
    description:
      'Returns productivity analytics including total work time, pomodoros completed, and focus score.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: Date,
    description: 'Specific date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Start date for range (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'End date for range (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalWorkMinutes: 150,
        totalPauseMinutes: 15,
        completedPomodoros: 6,
        averageSessionLength: 25,
        focusScore: 0.85,
        mostProductiveHour: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStats(
    @Query() getStatsDto: GetTimerStatsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getTimerStats(getStatsDto, user.id);
  }

  /**
   * Get sessions for a specific task
   * Returns all time sessions linked to a task
   */
  @Get('task/:taskId')
  @ApiOperation({
    summary: 'Get task sessions',
    description:
      'Returns all time sessions linked to a specific task. Useful for tracking time spent on individual tasks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task sessions retrieved successfully',
    schema: {
      example: {
        taskId: 'task-456',
        sessions: [
          {
            id: 'session-123',
            type: 'POMODORO',
            status: 'COMPLETED',
            startedAt: '2025-01-01T10:00:00Z',
            endedAt: '2025-01-01T10:25:00Z',
            workedMinutes: 25,
          },
        ],
        totalWorkMinutes: 50,
        totalSessions: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getTaskSessions(
    @Param('taskId') taskId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.timersService.getTaskSessions(taskId, user.id);
  }
}
