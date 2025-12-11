import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { GamificationService } from '../gamification/gamification.service';
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

    const habit = await this.prisma.client.habit.create({
      data: {
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
      },
      include: {
        completions: {
          where: {
            completedDate: {
              gte: startOfDay(new Date()),
              lte: endOfDay(new Date()),
            },
          },
        },
      },
    });

    // Award XP for creating first habit
    const habitCount = await this.prisma.client.habit.count({
      where: { userId },
    });
    if (habitCount === 1) {
      await this.gamificationService.addXp(userId, 10, 'Created first habit');
    }

    return habit;
  }

  /**
   * Get all habits for a user
   */
  async findAll(userId: string, includeArchived = false) {
    const where: any = { userId };
    if (!includeArchived) {
      where.isActive = true;
    }

    return this.prisma.client.habit.findMany({
      where,
      include: {
        completions: {
          where: {
            completedDate: {
              gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
              lte: endOfWeek(new Date(), { weekStartsOn: 1 }),
            },
          },
          orderBy: { completedDate: 'desc' },
        },
      },
      orderBy: [
        { isPaused: 'asc' },
        { timeOfDay: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Get habits scheduled for today
   */
  async findForToday(userId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    const habits = await this.prisma.client.habit.findMany({
      where: {
        userId,
        isActive: true,
        isPaused: false,
        OR: [
          { frequency: 'DAILY' },
          {
            frequency: 'SPECIFIC_DAYS',
            targetDaysOfWeek: { has: dayOfWeek },
          },
          { frequency: 'WEEKLY' },
          { frequency: 'MONTHLY' },
        ],
      },
      include: {
        completions: {
          where: {
            completedDate: startOfDay(today),
          },
        },
      },
      orderBy: [{ timeOfDay: 'asc' }, { createdAt: 'asc' }],
    });

    // Group by time of day
    const grouped = {
      MORNING: habits.filter((h) => h.timeOfDay === 'MORNING'),
      AFTERNOON: habits.filter((h) => h.timeOfDay === 'AFTERNOON'),
      EVENING: habits.filter((h) => h.timeOfDay === 'EVENING'),
      ANYTIME: habits.filter((h) => h.timeOfDay === 'ANYTIME' || !h.timeOfDay),
    };

    const completedCount = habits.filter(
      (h) => h.completions.length > 0,
    ).length;

    return {
      habits,
      grouped,
      summary: {
        total: habits.length,
        completed: completedCount,
        remaining: habits.length - completedCount,
        percentage:
          habits.length > 0
            ? Math.round((completedCount / habits.length) * 100)
            : 0,
      },
    };
  }

  /**
   * Get a single habit
   */
  async findOne(id: string, userId: string) {
    const habit = await this.prisma.client.habit.findFirst({
      where: { id, userId },
      include: {
        completions: {
          orderBy: { completedDate: 'desc' },
          take: 30, // Last 30 completions
        },
      },
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return habit;
  }

  /**
   * Update a habit
   */
  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
    const habit = await this.findOne(id, userId);

    const updateData: any = { ...updateHabitDto };

    // Handle pause/unpause
    if (updateHabitDto.isPaused !== undefined) {
      updateData.pausedAt = updateHabitDto.isPaused ? new Date() : null;
    }

    // Handle archive
    if (updateHabitDto.isActive === false) {
      updateData.archivedAt = new Date();
    }

    return this.prisma.client.habit.update({
      where: { id },
      data: updateData,
      include: {
        completions: {
          where: {
            completedDate: startOfDay(new Date()),
          },
        },
      },
    });
  }

  /**
   * Delete a habit
   */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.habit.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Complete a habit for today
   */
  async complete(id: string, completeDto: CompleteHabitDto, userId: string) {
    const habit = await this.findOne(id, userId);
    const today = startOfDay(new Date());
    const completedAt = completeDto.completedAt
      ? new Date(completeDto.completedAt)
      : new Date();

    // Check if already completed today
    const existingCompletion =
      await this.prisma.client.habitCompletion.findUnique({
        where: {
          habitId_completedDate: {
            habitId: id,
            completedDate: today,
          },
        },
      });

    if (existingCompletion) {
      throw new BadRequestException('Habit already completed for today');
    }

    // Calculate new streak
    const yesterday = subDays(today, 1);
    const yesterdayCompletion =
      await this.prisma.client.habitCompletion.findUnique({
        where: {
          habitId_completedDate: {
            habitId: id,
            completedDate: startOfDay(yesterday),
          },
        },
      });

    const isConsecutive = !!yesterdayCompletion || habit.currentStreak === 0;
    const newStreak = isConsecutive ? habit.currentStreak + 1 : 1;
    const newLongest = Math.max(habit.longestStreak, newStreak);

    // Create completion and update habit in transaction
    const [completion] = await this.prisma.client.$transaction([
      this.prisma.client.habitCompletion.create({
        data: {
          habitId: id,
          completedAt,
          completedDate: today,
          note: completeDto.note,
          value: completeDto.value,
        },
      }),
      this.prisma.client.habit.update({
        where: { id },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalCompletions: { increment: 1 },
        },
      }),
    ]);

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
      completion,
      habit: {
        id: habit.id,
        name: habit.name,
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalCompletions: habit.totalCompletions + 1,
      },
      xpAwarded,
      xpReason,
    };
  }

  /**
   * Uncomplete a habit for today (remove completion)
   */
  async uncomplete(id: string, userId: string) {
    await this.findOne(id, userId);
    const today = startOfDay(new Date());

    const completion = await this.prisma.client.habitCompletion.findUnique({
      where: {
        habitId_completedDate: {
          habitId: id,
          completedDate: today,
        },
      },
    });

    if (!completion) {
      throw new BadRequestException('Habit not completed for today');
    }

    // Delete completion and recalculate streak
    await this.prisma.client.habitCompletion.delete({
      where: { id: completion.id },
    });

    // Recalculate streak
    const newStreak = await this.calculateCurrentStreak(id);

    await this.prisma.client.habit.update({
      where: { id },
      data: {
        currentStreak: newStreak,
        totalCompletions: { decrement: 1 },
      },
    });

    return { success: true, newStreak };
  }

  /**
   * Get habit statistics
   */
  async getStats(id: string, userId: string) {
    const habit = await this.findOne(id, userId);
    const now = new Date();

    // Get completions for different time ranges
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisMonthStart = startOfMonth(now);
    const last30Days = subDays(now, 30);

    const [thisWeekCompletions, thisMonthCompletions, last30Completions] =
      await Promise.all([
        this.prisma.client.habitCompletion.count({
          where: {
            habitId: id,
            completedDate: { gte: thisWeekStart },
          },
        }),
        this.prisma.client.habitCompletion.count({
          where: {
            habitId: id,
            completedDate: { gte: thisMonthStart },
          },
        }),
        this.prisma.client.habitCompletion.findMany({
          where: {
            habitId: id,
            completedDate: { gte: startOfDay(last30Days) },
          },
          orderBy: { completedDate: 'desc' },
        }),
      ]);

    // Calculate completion rate for last 30 days
    const expectedCompletions = this.calculateExpectedCompletions(habit, 30);
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
        isSameDay(c.completedDate, date),
      );
      calendarData.push({
        date: dateStr,
        completed,
      });
    }

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      completionRate,
      thisWeekCompletions,
      thisMonthCompletions,
      calendarData: calendarData.reverse(),
    };
  }

  /**
   * Pause a habit
   */
  async pause(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.client.habit.update({
      where: { id },
      data: {
        isPaused: true,
        pausedAt: new Date(),
      },
    });
  }

  /**
   * Resume a habit
   */
  async resume(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.client.habit.update({
      where: { id },
      data: {
        isPaused: false,
        pausedAt: null,
      },
    });
  }

  /**
   * Calculate current streak based on completions
   */
  private async calculateCurrentStreak(habitId: string): Promise<number> {
    const completions = await this.prisma.client.habitCompletion.findMany({
      where: { habitId },
      orderBy: { completedDate: 'desc' },
      take: 365, // Max 1 year lookback
    });

    if (completions.length === 0) return 0;

    const today = startOfDay(new Date());
    const latestCompletion = startOfDay(completions[0].completedDate);

    // If no completion today or yesterday, streak is 0
    if (differenceInDays(today, latestCompletion) > 1) {
      return 0;
    }

    let streak = 1;
    let currentDate = latestCompletion;

    for (let i = 1; i < completions.length; i++) {
      const prevDate = startOfDay(completions[i].completedDate);
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
