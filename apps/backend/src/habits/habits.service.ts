import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { GamificationService } from '../gamification/gamification.service';
import { Habit, HabitFrequency, TimeOfDay } from '@ordo-todo/core';
import type { IHabitRepository } from '@ordo-todo/core';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isSameDay,
  differenceInDays,
  isAfter,
  isBefore,
} from 'date-fns';

@Injectable()
export class HabitsService {
  private readonly logger = new Logger(HabitsService.name);

  constructor(
    @Inject('HabitRepository')
    private readonly habitRepository: IHabitRepository,
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Create a new habit
   */
  async create(createHabitDto: CreateHabitDto, userId: string) {
    this.logger.log(
      `Creating habit for user ${userId}: ${createHabitDto.name}`,
    );

    // Create habit entity
    const habitEntity = new Habit({
      name: createHabitDto.name,
      description: createHabitDto.description,
      icon: createHabitDto.icon,
      color: createHabitDto.color ?? '#10B981',
      frequency: createHabitDto.frequency ?? 'DAILY',
      targetDaysOfWeek: createHabitDto.targetDaysOfWeek ?? [
        0, 1, 2, 3, 4, 5, 6,
      ],
      targetCount: createHabitDto.targetCount ?? 1,
      preferredTime: createHabitDto.preferredTime,
      timeOfDay: createHabitDto.timeOfDay,
      workspaceId: createHabitDto.workspaceId,
      userId,
    });

    const habit = await this.habitRepository.create(habitEntity);

    // Award XP for creating first habit
    const habits = await this.habitRepository.findByUserId(userId);
    if (habits.length === 1) {
      await this.gamificationService.addXp(userId, 10, 'Created first habit');
    }

    return habit.props;
  }

  /**
   * Get all habits for a user
   */
  async findAll(userId: string, includeArchived = false) {
    const habits = includeArchived
      ? await this.habitRepository.findByUserId(userId)
      : await this.habitRepository.findActiveByUserId(userId);

    // Get completions for this week for each habit
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const habitsWithCompletions = await Promise.all(
      habits.map(async (habit) => {
        const completions = await this.habitRepository.getCompletions(
          habit.id as string,
          weekStart,
          weekEnd,
        );
        return {
          ...habit.props,
          completions: completions.map((c) => ({
            ...c,
            completedDate: new Date(c.completedDate),
          })),
        };
      }),
    );

    // Sort by isPaused, timeOfDay, createdAt
    return habitsWithCompletions.sort((a, b) => {
      if (a.isPaused !== b.isPaused) return a.isPaused ? 1 : -1;
      if ((a.timeOfDay || '') !== (b.timeOfDay || ''))
        return (a.timeOfDay || '').localeCompare(b.timeOfDay || '');
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  /**
   * Get habits scheduled for today
   */
  async findForToday(userId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    const habits = await this.habitRepository.findTodayHabits(userId);

    // Filter to only active, non-paused habits matching today's frequency
    const filteredHabits = habits.filter(
      (h) =>
        h.props.isActive &&
        !h.props.isPaused &&
        (h.props.frequency === 'DAILY' ||
          (h.props.frequency === 'SPECIFIC_DAYS' &&
            h.props.targetDaysOfWeek?.includes(dayOfWeek)) ||
          h.props.frequency === 'WEEKLY' ||
          h.props.frequency === 'MONTHLY'),
    );

    // Get today's completions for each habit
    const habitsWithCompletions = await Promise.all(
      filteredHabits.map(async (habit) => {
        const completion = await this.habitRepository.getCompletionForDate(
          habit.id as string,
          startOfDay(today),
        );
        return {
          ...habit.props,
          completions: completion ? [completion] : [],
        };
      }),
    );

    // Group by time of day
    const grouped = {
      MORNING: habitsWithCompletions.filter(
        (h) => h.timeOfDay === 'MORNING',
      ),
      AFTERNOON: habitsWithCompletions.filter(
        (h) => h.timeOfDay === 'AFTERNOON',
      ),
      EVENING: habitsWithCompletions.filter(
        (h) => h.timeOfDay === 'EVENING',
      ),
      ANYTIME: habitsWithCompletions.filter(
        (h) => h.timeOfDay === 'ANYTIME' || !h.timeOfDay,
      ),
    };

    const completedCount = habitsWithCompletions.filter(
      (h) => h.completions.length > 0,
    ).length;

    return {
      habits: habitsWithCompletions,
      grouped,
      summary: {
        total: habitsWithCompletions.length,
        completed: completedCount,
        remaining: habitsWithCompletions.length - completedCount,
        percentage:
          habitsWithCompletions.length > 0
            ? Math.round((completedCount / habitsWithCompletions.length) * 100)
            : 0,
      },
    };
  }

  /**
   * Get a single habit
   */
  async findOne(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    // Get last 30 completions
    const thirtyDaysAgo = subDays(new Date(), 30);
    const completions = await this.habitRepository.getCompletions(
      id,
      thirtyDaysAgo,
      new Date(),
    );

    return {
      ...habit.props,
      completions: completions.slice(0, 30).map((c) => ({
        ...c,
        completedDate: new Date(c.completedDate),
      })),
    };
  }

  /**
   * Update a habit
   */
  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    const updateData: any = { ...updateHabitDto };

    // Handle pause/unpause
    if (updateHabitDto.isPaused !== undefined) {
      updateData.pausedAt = updateHabitDto.isPaused ? new Date() : null;
    }

    // Handle archive
    if (updateHabitDto.isActive === false) {
      updateData.archivedAt = new Date();
    }

    const updatedHabit = await this.habitRepository.update(id, updateData);

    // Get today's completion
    const completion = await this.habitRepository.getCompletionForDate(
      id,
      startOfDay(new Date()),
    );

    return {
      ...updatedHabit.props,
      completions: completion ? [completion] : [],
    };
  }

  /**
   * Delete a habit
   */
  async remove(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    await this.habitRepository.delete(id);
    return { success: true };
  }

  /**
   * Complete a habit for today
   */
  async complete(id: string, completeDto: CompleteHabitDto, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    const today = startOfDay(new Date());
    const completedAt = completeDto.completedAt
      ? new Date(completeDto.completedAt)
      : new Date();

    // Check if already completed today
    const existingCompletion =
      await this.habitRepository.getCompletionForDate(id, today);

    if (existingCompletion) {
      throw new BadRequestException('Habit already completed for today');
    }

    // Calculate new streak
    const yesterday = subDays(today, 1);
    const yesterdayCompletion =
      await this.habitRepository.getCompletionForDate(id, startOfDay(yesterday));

    const isConsecutive =
      !!yesterdayCompletion || habit.props.currentStreak === 0;
    const newStreak = isConsecutive ? habit.props.currentStreak + 1 : 1;
    const newLongest = Math.max(habit.props.longestStreak, newStreak);

    // Create completion using repository (handles transaction internally)
    const updatedHabit = await this.habitRepository.createCompletion(id, {
      completedAt,
      completedDate: today,
      note: completeDto.note,
      value: completeDto.value,
    });

    // Award XP
    let xpAwarded = 5; // Base XP for completing a habit
    let xpReason = 'Completed habit';

    // Streak bonuses
    if (newStreak === 7) {
      xpAwarded += 50;
      xpReason = '7-day streak!';
    } else if (newStreak === 30) {
      xpAwarded += 200;
      xpReason = '30-day streak!';
    } else if (newStreak === 100) {
      xpAwarded += 500;
      xpReason = '100-day streak!';
    }

    await this.gamificationService.addXp(userId, xpAwarded, xpReason);

    return {
      completion: {
        habitId: id,
        completedAt,
        completedDate: today,
        note: completeDto.note,
        value: completeDto.value,
      },
      habit: {
        id: habit.id,
        name: habit.props.name,
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalCompletions: habit.props.totalCompletions + 1,
      },
      xpAwarded,
      xpReason,
    };
  }

  /**
   * Uncomplete a habit for today (remove completion)
   */
  async uncomplete(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    const today = startOfDay(new Date());

    const completion = await this.habitRepository.getCompletionForDate(
      id,
      today,
    );

    if (!completion) {
      throw new BadRequestException('Habit not completed for today');
    }

    // Delete completion using repository
    await this.habitRepository.deleteCompletion(id, today);

    // Recalculate streak
    const newStreak = await this.calculateCurrentStreak(id);

    await this.habitRepository.update(id, {
      currentStreak: newStreak,
      totalCompletions: habit.props.totalCompletions - 1,
    });

    return { success: true, newStreak };
  }

  /**
   * Get habit statistics
   */
  async getStats(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    // Use repository's getStats method
    const stats = await this.habitRepository.getStats(id);

    const now = new Date();
    const last30Days = subDays(now, 30);

    // Get last 30 completions for calendar data
    const last30Completions = await this.habitRepository.getCompletions(
      id,
      startOfDay(last30Days),
      now,
    );

    // Calculate completion rate for last 30 days
    const expectedCompletions = this.calculateExpectedCompletions(
      habit.props,
      30,
    );
    const completionRate =
      expectedCompletions > 0
        ? Math.round((last30Completions.length / expectedCompletions) * 100)
        : 0;

    // Build calendar data for last 30 days
    const calendarData: Array<{ date: string; completed: boolean }> = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(now, i);
      const dateStr = startOfDay(date).toISOString();
      const completed = last30Completions.some((c) =>
        isSameDay(new Date(c.completedDate), date),
      );
      calendarData.push({
        date: dateStr,
        completed,
      });
    }

    return {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCompletions: stats.totalCompletions,
      completionRate,
      thisWeekCompletions: stats.thisWeekCompletions,
      thisMonthCompletions: stats.thisMonthCompletions,
      calendarData: calendarData.reverse(),
    };
  }

  /**
   * Pause a habit
   */
  async pause(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    return this.habitRepository.update(id, {
      isPaused: true,
      pausedAt: new Date(),
    });
  }

  /**
   * Resume a habit
   */
  async resume(id: string, userId: string) {
    const habit = await this.habitRepository.findById(id);
    if (!habit || habit.props.userId !== userId) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    return this.habitRepository.update(id, {
      isPaused: false,
      pausedAt: null,
    });
  }

  /**
   * Calculate current streak based on completions
   */
  private async calculateCurrentStreak(habitId: string): Promise<number> {
    const oneYearAgo = subDays(new Date(), 365);
    const completions = await this.habitRepository.getCompletions(
      habitId,
      oneYearAgo,
      new Date(),
    );

    if (completions.length === 0) return 0;

    const today = startOfDay(new Date());
    const latestCompletion = startOfDay(
      new Date(completions[0].completedDate),
    );

    // If no completion today or yesterday, streak is 0
    if (differenceInDays(today, latestCompletion) > 1) {
      return 0;
    }

    let streak = 1;
    let currentDate = latestCompletion;

    for (let i = 1; i < completions.length; i++) {
      const prevDate = startOfDay(new Date(completions[i].completedDate));
      const dayDiff = differenceInDays(currentDate, prevDate);

      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else if (dayDiff > 1) {
        break;
      }
      // dayDiff === 0 means same day, skip
    }

    return streak;
  }

  /**
   * Calculate expected completions based on frequency
   */
  private calculateExpectedCompletions(habit: any, days: number): number {
    switch (habit.frequency) {
      case 'DAILY':
        return days;
      case 'SPECIFIC_DAYS':
        // Approximate based on selected days
        return Math.round((habit.targetDaysOfWeek.length / 7) * days);
      case 'WEEKLY':
        return Math.floor(days / 7) * habit.targetCount;
      case 'MONTHLY':
        return Math.floor(days / 30) * habit.targetCount;
      default:
        return days;
    }
  }
}
