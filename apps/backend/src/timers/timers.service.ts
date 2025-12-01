import { Injectable, Inject } from '@nestjs/common';
import type { TimerRepository, TaskRepository, AnalyticsRepository, AIProfileRepository } from '@ordo-todo/core';
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
  ) { }

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

  async stop(stopTimerDto: StopTimerDto, userId: string) {
    const stopTimerUseCase = new StopTimerUseCase(this.timerRepository);
    const session = await stopTimerUseCase.execute(
      userId,
      stopTimerDto.wasCompleted ?? false,
    );

    // Auto-track metrics if session was completed
    if (stopTimerDto.wasCompleted && session.props.duration) {
      const sessionType = session.props.type;

      // Only track work sessions (WORK or CONTINUOUS)
      if (sessionType === 'WORK' || sessionType === 'CONTINUOUS') {
        const duration = session.props.duration; // in minutes
        const totalPauseTime = session.props.totalPauseTime ?? 0; // in seconds
        const pauseCount = session.props.pauseCount ?? 0;

        // Calculate focus score
        const totalWorkSeconds = duration * 60 - totalPauseTime;
        const calculateFocusScore = new CalculateFocusScoreUseCase();
        const focusScore = calculateFocusScore.execute({
          totalWorkSeconds,
          totalPauseSeconds: totalPauseTime,
          pauseCount,
        });

        // Update daily metrics
        const updateMetrics = new UpdateDailyMetricsUseCase(this.analyticsRepository);
        await updateMetrics.execute({
          userId,
          date: session.props.endedAt ?? new Date(),
          minutesWorked: duration,
          pomodorosCompleted: sessionType === 'WORK' ? 1 : 0,
          focusScore,
        });

        // Learn from this session to improve AI recommendations
        try {
          const learnFromSession = new LearnFromSessionUseCase(this.aiProfileRepository);
          await learnFromSession.execute({ session });
        } catch (error) {
          // Don't fail the entire stop operation if learning fails
          console.error('Failed to learn from session:', error);
        }
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
}
