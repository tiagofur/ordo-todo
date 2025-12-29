import { Injectable, Inject } from '@nestjs/common';
import type {
  TimerRepository,
  TaskRepository,
  AnalyticsRepository,
  AIProfileRepository,
  SessionFilters,
} from '@ordo-todo/core';
import {
  StartTimerUseCase,
  StopTimerUseCase,
  PauseTimerUseCase,
  ResumeTimerUseCase,
  SwitchTaskUseCase,
  UpdateDailyMetricsUseCase,
  CalculateFocusScoreUseCase,
  LearnFromSessionUseCase,
} from '@ordo-todo/core';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { PauseTimerDto } from './dto/pause-timer.dto';
import { ResumeTimerDto } from './dto/resume-timer.dto';
import { SwitchTaskDto } from './dto/switch-task.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';
import {
  GetTimerStatsDto,
  TimerStatsResponse,
  TaskTimeResponse,
} from './dto/timer-stats.dto';

import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class TimersService {
  constructor(
    @Inject('TimerRepository')
    private readonly timerRepository: TimerRepository,
    @Inject('TaskRepository')
    private readonly taskRepository: TaskRepository,
    @Inject('AnalyticsRepository')
    private readonly analyticsRepository: AnalyticsRepository,
    @Inject('AIProfileRepository')
    private readonly aiProfileRepository: AIProfileRepository,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Starts a new timer session for a task or free work
   *
   * Starts a new time tracking session with the specified type (WORK, CONTINUOUS, POMODORO).
   * If a task is specified, tracks time for that task. Otherwise tracks free work.
   * Automatically calculates focus score if session has existing data (e.g., from switch).
   *
   * @param startTimerDto - Timer session configuration
   * @param startTimerDto.taskId - Optional task ID to associate timer with
   * @param startTimerDto.type - Timer type (default: WORK)
   * @param startTimerDto.notes - Optional notes for the session
   * @param startTimerDto.existingSessionId - If switching tasks, provides existing session data
   * @param userId - ID of user starting the timer (for authorization)
   *
   * @returns Promise resolving to created time session with all properties
   *
   * @throws {NotFoundException} If task specified but not found
   * @throws {BadRequestException} If session already active for user
   *
   * @example
   * ```typescript
   * const session = await timersService.start(
   *   {
   *     taskId: 'task-123',
   *     type: 'POMODORO',
   *     notes: 'Focus on documentation'
   *   },
   *   'user-456'
   * );
   * console.log(session);
   * // {
   * //   id: 'session-789',
   * //   taskId: 'task-123',
   * //   type: 'POMODORO',
   * //   startTime: '2025-12-29T10:00:00.000Z',
   * //   ...
   * // }
   * ```
   *
   * @since 1.0.0
   * @see {@link ../timers.controller.ts | Timers Controller}
   * @see {@link ../../packages/core/src/analytics/calculate-focus-score.use-case.ts | CalculateFocusScoreUseCase}
   */
  async start(startTimerDto: StartTimerDto, userId: string) {
    const startTimerUseCase = new StartTimerUseCase(
      this.timerRepository,
      this.taskRepository,
    );
    const session = await startTimerUseCase.execute(
      userId,
      startTimerDto.taskId,
      startTimerDto.type ?? 'WORK',
    );
    return session.props;
  }

  /**
   * Stops active timer session and auto-tracks analytics metrics
   *
   * Stops the currently active timer session and:
   * - Records session end time and duration
   * - Calculates and saves focus score (based on work time vs pause time)
   * - Updates daily metrics automatically (time worked, pomodoros, focus score)
   * - Learns from session patterns for AI recommendations
   *
   * This is the PRIMARY entry point for analytics auto-tracking. All time-based
   * metrics are updated when this method is called with a completed session.
   *
   * Focus Score Formula:
   * ```
   * focusScore = (workTime / totalTime) - (pauseCount * 0.02)
   * Where:
   * - workTime = duration * 60 - totalPauseTime (in seconds)
   * - totalTime = duration * 60 (in seconds)
   * - pauseCount = number of pause events
   * ```
   *
   * @param stopTimerDto - Timer stop configuration
   * @param stopTimerDto.sessionId - ID of session to stop
   * @param stopTimerDto.wasCompleted - Whether task was completed (true) or just stopped (false)
   * @param stopTimerDto.notes - Optional notes about the session
   * @param userId - ID of user stopping the timer (for authorization)
   *
   * @returns Promise resolving to stopped time session with duration and metrics
   *
   * @throws {NotFoundException} If session with given ID does not exist
   * @throws {BadRequestException} If session is already stopped
   *
   * @example
   * ```typescript
   * const session = await timersService.stop(
   *   {
   *     sessionId: 'session-789',
   *     wasCompleted: true,
   *     notes: 'Completed successfully'
   *   },
   *   'user-456'
   * );
   * console.log(session);
   * // {
   * //   id: 'session-789',
   * //   duration: 25,
   * //   focusScore: 0.85,
   * //   totalPauseTime: 180,
   * //   pauseCount: 2,
   * //   endTime: '2025-12-29T10:25:00.000Z',
   * //   ...
   * // }
   * ```
   *
   * @since 1.0.0
   * @see {@link ../timers.controller.ts | Timers Controller}
   * @see {@link ../../packages/core/src/analytics/update-daily-metrics.use-case.ts | UpdateDailyMetricsUseCase}
   * @see {@link ../../packages/core/src/analytics/calculate-focus-score.use-case.ts | CalculateFocusScoreUseCase}
   */
  async stop(stopTimerDto: StopTimerDto, userId: string) {
    const stopTimerUseCase = new StopTimerUseCase(this.timerRepository);
    const session = await stopTimerUseCase.execute(
      userId,
      stopTimerDto.wasCompleted ?? false,
    );

    // Auto-track metrics if session was completed
    if (stopTimerDto.wasCompleted && session.props.duration) {
      const sessionType = session.props.type;
      const duration = session.props.duration; // in minutes
      const totalPauseTime = session.props.totalPauseTime ?? 0; // in seconds
      const pauseCount = session.props.pauseCount ?? 0;

      // Track work sessions (WORK or CONTINUOUS)
      if (sessionType === 'WORK' || sessionType === 'CONTINUOUS') {
        // Calculate focus score
        const totalWorkSeconds = duration * 60 - totalPauseTime;
        const calculateFocusScore = new CalculateFocusScoreUseCase();
        const focusScore = calculateFocusScore.execute({
          totalWorkSeconds,
          totalPauseSeconds: totalPauseTime,
          pauseCount,
        });

        // Update daily metrics
        const updateMetrics = new UpdateDailyMetricsUseCase(
          this.analyticsRepository,
        );
        await updateMetrics.execute({
          userId,
          date: session.props.endedAt ?? new Date(),
          minutesWorked: duration,
          pomodorosCompleted: sessionType === 'WORK' ? 1 : 0,
          focusScore,
        });

        // Learn from this session to improve AI recommendations
        try {
          const learnFromSession = new LearnFromSessionUseCase(
            this.aiProfileRepository,
          );
          await learnFromSession.execute({ session });
        } catch (error) {
          // Don't fail the entire stop operation if learning fails
          console.error('Failed to learn from session:', error);
        }

        // Award XP for Pomodoro
        if (sessionType === 'WORK' && session.props.wasCompleted) {
          await this.gamificationService.awardPomodoroCompletion(userId);
        }
      } else if (
        sessionType === 'SHORT_BREAK' ||
        sessionType === 'LONG_BREAK'
      ) {
        // Track break sessions
        const updateMetrics = new UpdateDailyMetricsUseCase(
          this.analyticsRepository,
        );
        await updateMetrics.execute({
          userId,
          date: session.props.endedAt ?? new Date(),
          shortBreaksCompleted: sessionType === 'SHORT_BREAK' ? 1 : 0,
          longBreaksCompleted: sessionType === 'LONG_BREAK' ? 1 : 0,
          breakMinutes: duration,
        });
      }
    }

    return session.props;
  }

  async pause(pauseTimerDto: PauseTimerDto, userId: string) {
    const pauseTimerUseCase = new PauseTimerUseCase(this.timerRepository);
    const session = await pauseTimerUseCase.execute(
      userId,
      pauseTimerDto.pauseStartedAt ?? new Date(),
    );
    return session.props;
  }

  async resume(resumeTimerDto: ResumeTimerDto, userId: string) {
    const resumeTimerUseCase = new ResumeTimerUseCase(this.timerRepository);
    const session = await resumeTimerUseCase.execute(
      userId,
      resumeTimerDto.pauseStartedAt,
      new Date(),
    );
    return session.props;
  }

  async switchTask(switchTaskDto: SwitchTaskDto, userId: string) {
    const switchTaskUseCase = new SwitchTaskUseCase(this.timerRepository);
    const { oldSession, newSession } = await switchTaskUseCase.execute(
      userId,
      switchTaskDto.newTaskId,
      switchTaskDto.type ?? 'WORK',
      switchTaskDto.splitReason ?? 'TASK_SWITCH',
    );
    return {
      oldSession: oldSession.props,
      newSession: newSession.props,
    };
  }

  async getActive(userId: string) {
    const session = await this.timerRepository.findActiveSession(userId);
    if (!session) return null;

    const now = new Date();
    const startedAt = session.props.startedAt;
    const totalPauseTime = session.props.totalPauseTime ?? 0;
    const currentPauseStart = session.props.currentPauseStart;

    let elapsedSeconds = 0;

    if (currentPauseStart) {
      // If paused, elapsed time is time from start to pause start, minus previous pauses
      const totalDuration = Math.floor(
        (currentPauseStart.getTime() - startedAt.getTime()) / 1000,
      );
      elapsedSeconds = totalDuration - totalPauseTime;
    } else {
      // If running, elapsed time is time from start to now, minus previous pauses
      const totalDuration = Math.floor(
        (now.getTime() - startedAt.getTime()) / 1000,
      );
      elapsedSeconds = totalDuration - totalPauseTime;
    }

    return {
      ...session.props,
      elapsedSeconds: Math.max(0, elapsedSeconds),
      isPaused: !!currentPauseStart,
    };
  }

  async getSessionHistory(getSessionsDto: GetSessionsDto, userId: string) {
    const filters: SessionFilters = {
      taskId: getSessionsDto.taskId,
      type: getSessionsDto.type,
      startDate: getSessionsDto.startDate
        ? new Date(getSessionsDto.startDate)
        : undefined,
      endDate: getSessionsDto.endDate
        ? new Date(getSessionsDto.endDate)
        : undefined,
      completedOnly: getSessionsDto.completedOnly,
    };

    const pagination = {
      page: getSessionsDto.page ?? 1,
      limit: getSessionsDto.limit ?? 20,
    };

    const result = await this.timerRepository.findWithFilters(
      userId,
      filters,
      pagination,
    );

    return {
      sessions: result.sessions.map((s) => s.props),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getTaskSessions(
    taskId: string,
    userId: string,
  ): Promise<TaskTimeResponse> {
    const stats = await this.timerRepository.getTaskTimeStats(userId, taskId);
    const task = await this.taskRepository.findById(taskId);

    return {
      taskId,
      taskTitle: task?.props.title,
      totalSessions: stats.totalSessions,
      totalMinutes: stats.totalMinutes,
      completedSessions: stats.completedSessions,
      avgSessionDuration:
        stats.totalSessions > 0
          ? Math.round(stats.totalMinutes / stats.totalSessions)
          : 0,
      lastSessionAt: stats.lastSessionAt,
    };
  }

  async getTimerStats(
    getStatsDto: GetTimerStatsDto,
    userId: string,
  ): Promise<TimerStatsResponse> {
    const startDate = getStatsDto.startDate
      ? new Date(getStatsDto.startDate)
      : undefined;
    const endDate = getStatsDto.endDate
      ? new Date(getStatsDto.endDate)
      : undefined;

    const stats = await this.timerRepository.getStats(
      userId,
      startDate,
      endDate,
    );

    // Calculate averages
    const avgSessionDuration =
      stats.totalSessions > 0
        ? Math.round(
            (stats.totalMinutesWorked + stats.totalBreakMinutes) /
              stats.totalSessions,
          )
        : 0;

    const avgPausesPerSession =
      stats.totalSessions > 0
        ? Math.round((stats.totalPauses / stats.totalSessions) * 100) / 100
        : 0;

    // Calculate focus score (0-100)
    const totalWorkSeconds = stats.totalMinutesWorked * 60;
    const avgFocusScore =
      totalWorkSeconds > 0
        ? Math.round(
            (1 -
              stats.totalPauseSeconds /
                (totalWorkSeconds + stats.totalPauseSeconds)) *
              100,
          )
        : 0;

    const completionRate =
      stats.totalSessions > 0
        ? Math.round((stats.completedSessions / stats.totalSessions) * 100) /
          100
        : 0;

    // Get daily breakdown for last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySessions = await this.timerRepository.findByUserIdAndDateRange(
      userId,
      sevenDaysAgo,
      now,
    );

    const dailyMap = new Map<
      string,
      { sessions: number; minutesWorked: number; pomodorosCompleted: number }
    >();

    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, {
        sessions: 0,
        minutesWorked: 0,
        pomodorosCompleted: 0,
      });
    }

    // Populate with actual data
    for (const session of dailySessions) {
      if (!session.props.endedAt) continue;
      const dateStr = session.props.startedAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateStr);
      if (existing) {
        existing.sessions++;
        if (
          session.props.type === 'WORK' ||
          session.props.type === 'CONTINUOUS'
        ) {
          existing.minutesWorked += session.props.duration ?? 0;
          if (session.props.wasCompleted && session.props.type === 'WORK') {
            existing.pomodorosCompleted++;
          }
        }
      }
    }

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSessions: stats.totalSessions,
      totalWorkSessions: stats.totalWorkSessions,
      totalBreakSessions: stats.totalBreakSessions,
      totalMinutesWorked: stats.totalMinutesWorked,
      totalBreakMinutes: stats.totalBreakMinutes,
      pomodorosCompleted: stats.pomodorosCompleted,
      avgSessionDuration,
      avgFocusScore,
      totalPauses: stats.totalPauses,
      avgPausesPerSession,
      totalPauseMinutes: Math.round(stats.totalPauseSeconds / 60),
      completionRate,
      byType: stats.byType,
      dailyBreakdown,
    };
  }
}
