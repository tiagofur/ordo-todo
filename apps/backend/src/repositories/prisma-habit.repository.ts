import { Injectable } from '@nestjs/common';
import {
  Habit,
  HabitProps,
  IHabitRepository,
  HabitCompletionProps,
  HabitFrequency as CoreHabitFrequency,
  TimeOfDay as CoreTimeOfDay,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  Habit as PrismaHabit,
  HabitCompletion as PrismaHabitCompletion,
  HabitFrequency as PrismaHabitFrequency,
  TimeOfDay as PrismaTimeOfDay,
} from '@prisma/client';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  subDays,
  differenceInDays,
} from 'date-fns';

type PrismaHabitWithCompletions = PrismaHabit & {
  completions?: PrismaHabitCompletion[];
};

/**
 * Prisma implementation of the IHabitRepository interface.
 *
 * This repository bridges the domain layer (Habit entity from @ordo-todo/core)
 * with the data access layer (Habit from Prisma).
 */
@Injectable()
export class PrismaHabitRepository implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Habit | null> {
    const prismaHabit = await this.prisma.client.habit.findUnique({
      where: { id },
      include: {
        completions: {
          orderBy: { completedDate: 'desc' },
          take: 30,
        },
      },
    });

    return prismaHabit ? this.toDomain(prismaHabit) : null;
  }

  async findByUserId(userId: string): Promise<Habit[]> {
    const prismaHabits = await this.prisma.client.habit.findMany({
      where: { userId },
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

    return prismaHabits.map((h) => this.toDomain(h));
  }

  async findActiveByUserId(userId: string): Promise<Habit[]> {
    const prismaHabits = await this.prisma.client.habit.findMany({
      where: { userId, isActive: true },
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

    return prismaHabits.map((h) => this.toDomain(h));
  }

  async findTodayHabits(userId: string): Promise<Habit[]> {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const prismaHabits = await this.prisma.client.habit.findMany({
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

    return prismaHabits.map((h) => this.toDomain(h));
  }

  async create(habit: Habit): Promise<Habit> {
    const prismaHabit = await this.prisma.client.habit.create({
      data: {
        id: habit.id as string,
        name: habit.props.name,
        description: habit.props.description ?? null,
        icon: habit.props.icon ?? null,
        color: habit.props.color,
        userId: habit.props.userId,
        workspaceId: habit.props.workspaceId ?? null,
        frequency: habit.props.frequency as PrismaHabitFrequency,
        targetDaysOfWeek: habit.props.targetDaysOfWeek,
        targetCount: habit.props.targetCount,
        preferredTime: habit.props.preferredTime ?? null,
        timeOfDay: habit.props.timeOfDay as PrismaTimeOfDay | null,
        currentStreak: habit.props.currentStreak,
        longestStreak: habit.props.longestStreak,
        totalCompletions: habit.props.totalCompletions,
        isActive: habit.props.isActive,
        isPaused: habit.props.isPaused,
        pausedAt: habit.props.pausedAt ?? null,
        archivedAt: habit.props.archivedAt ?? null,
      },
      include: {
        completions: true,
      },
    });

    return this.toDomain(prismaHabit);
  }

  async update(id: string, data: Partial<HabitProps>): Promise<Habit> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.workspaceId !== undefined)
      updateData.workspaceId = data.workspaceId;
    if (data.frequency !== undefined)
      updateData.frequency = data.frequency as PrismaHabitFrequency;
    if (data.targetDaysOfWeek !== undefined)
      updateData.targetDaysOfWeek = data.targetDaysOfWeek;
    if (data.targetCount !== undefined)
      updateData.targetCount = data.targetCount;
    if (data.preferredTime !== undefined)
      updateData.preferredTime = data.preferredTime;
    if (data.timeOfDay !== undefined)
      updateData.timeOfDay = data.timeOfDay as PrismaTimeOfDay;
    if (data.currentStreak !== undefined)
      updateData.currentStreak = data.currentStreak;
    if (data.longestStreak !== undefined)
      updateData.longestStreak = data.longestStreak;
    if (data.totalCompletions !== undefined)
      updateData.totalCompletions = data.totalCompletions;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isPaused !== undefined) updateData.isPaused = data.isPaused;
    if (data.pausedAt !== undefined) updateData.pausedAt = data.pausedAt;
    if (data.archivedAt !== undefined) updateData.archivedAt = data.archivedAt;

    const prismaHabit = await this.prisma.client.habit.update({
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

    return this.toDomain(prismaHabit);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.habit.delete({ where: { id } });
  }

  async createCompletion(
    habitId: string,
    data: HabitCompletionProps,
  ): Promise<Habit> {
    await this.prisma.client.habitCompletion.create({
      data: {
        habitId,
        completedAt: data.completedAt,
        completedDate: data.completedDate,
        note: data.note ?? null,
        value: data.value ?? null,
      },
    });

    // Update habit stats
    const habit = await this.prisma.client.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new Error(`Habit ${habitId} not found`);
    }

    // Calculate new streak
    const yesterday = subDays(startOfDay(new Date()), 1);
    const yesterdayCompletion =
      await this.prisma.client.habitCompletion.findUnique({
        where: {
          habitId_completedDate: {
            habitId,
            completedDate: yesterday,
          },
        },
      });

    const isConsecutive = !!yesterdayCompletion || habit.currentStreak === 0;
    const newStreak = isConsecutive ? habit.currentStreak + 1 : 1;
    const newLongest = Math.max(habit.longestStreak, newStreak);

    const updatedHabit = await this.prisma.client.habit.update({
      where: { id: habitId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalCompletions: { increment: 1 },
      },
      include: {
        completions: {
          where: {
            completedDate: startOfDay(new Date()),
          },
        },
      },
    });

    return this.toDomain(updatedHabit);
  }

  async deleteCompletion(habitId: string, date: Date): Promise<void> {
    const completedDate = startOfDay(date);

    await this.prisma.client.habitCompletion.delete({
      where: {
        habitId_completedDate: {
          habitId,
          completedDate,
        },
      },
    });

    // Recalculate streak
    const newStreak = await this.calculateCurrentStreak(habitId);

    await this.prisma.client.habit.update({
      where: { id: habitId },
      data: {
        currentStreak: newStreak,
        totalCompletions: { decrement: 1 },
      },
    });
  }

  async getCompletions(
    habitId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HabitCompletionProps[]> {
    const completions = await this.prisma.client.habitCompletion.findMany({
      where: {
        habitId,
        completedDate: {
          gte: startOfDay(startDate),
          lte: startOfDay(endDate),
        },
      },
      orderBy: { completedDate: 'desc' },
    });

    return completions.map((c) => this.completionToDomain(c));
  }

  async getCompletionForDate(
    habitId: string,
    date: Date,
  ): Promise<HabitCompletionProps | null> {
    const completion = await this.prisma.client.habitCompletion.findUnique({
      where: {
        habitId_completedDate: {
          habitId,
          completedDate: startOfDay(date),
        },
      },
    });

    return completion ? this.completionToDomain(completion) : null;
  }

  async getStats(habitId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
    thisWeekCompletions: number;
    thisMonthCompletions: number;
  }> {
    const habit = await this.prisma.client.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      throw new Error(`Habit ${habitId} not found`);
    }

    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisMonthStart = startOfMonth(now);
    const last30Days = subDays(now, 30);

    const [thisWeekCompletions, thisMonthCompletions, last30Completions] =
      await Promise.all([
        this.prisma.client.habitCompletion.count({
          where: {
            habitId,
            completedDate: { gte: thisWeekStart },
          },
        }),
        this.prisma.client.habitCompletion.count({
          where: {
            habitId,
            completedDate: { gte: thisMonthStart },
          },
        }),
        this.prisma.client.habitCompletion.count({
          where: {
            habitId,
            completedDate: { gte: startOfDay(last30Days) },
          },
        }),
      ]);

    // Calculate expected completions for last 30 days
    const expectedCompletions = this.calculateExpectedCompletions(habit, 30);
    const completionRate =
      expectedCompletions > 0
        ? Math.round((last30Completions / expectedCompletions) * 100) / 100
        : 0;

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      completionRate,
      thisWeekCompletions,
      thisMonthCompletions,
    };
  }

  // ============ Private Helpers ============

  private async calculateCurrentStreak(habitId: string): Promise<number> {
    const completions = await this.prisma.client.habitCompletion.findMany({
      where: { habitId },
      orderBy: { completedDate: 'desc' },
      take: 365,
    });

    if (completions.length === 0) return 0;

    const today = startOfDay(new Date());
    const latestCompletion = startOfDay(completions[0].completedDate);

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
    }

    return streak;
  }

  private calculateExpectedCompletions(
    habit: PrismaHabit,
    days: number,
  ): number {
    switch (habit.frequency) {
      case 'DAILY':
        return days;
      case 'SPECIFIC_DAYS':
        return Math.round((habit.targetDaysOfWeek.length / 7) * days);
      case 'WEEKLY':
        return Math.floor(days / 7) * habit.targetCount;
      case 'MONTHLY':
        return Math.floor(days / 30) * habit.targetCount;
      default:
        return days;
    }
  }

  private toDomain(prismaHabit: PrismaHabitWithCompletions): Habit {
    return new Habit({
      id: prismaHabit.id,
      name: prismaHabit.name,
      description: prismaHabit.description ?? undefined,
      icon: prismaHabit.icon ?? undefined,
      color: prismaHabit.color,
      userId: prismaHabit.userId,
      workspaceId: prismaHabit.workspaceId ?? undefined,
      frequency: prismaHabit.frequency as CoreHabitFrequency,
      targetDaysOfWeek: prismaHabit.targetDaysOfWeek,
      targetCount: prismaHabit.targetCount,
      preferredTime: prismaHabit.preferredTime ?? undefined,
      timeOfDay: prismaHabit.timeOfDay as CoreTimeOfDay | undefined,
      currentStreak: prismaHabit.currentStreak,
      longestStreak: prismaHabit.longestStreak,
      totalCompletions: prismaHabit.totalCompletions,
      isActive: prismaHabit.isActive,
      isPaused: prismaHabit.isPaused,
      pausedAt: prismaHabit.pausedAt ?? undefined,
      archivedAt: prismaHabit.archivedAt ?? undefined,
      completions: prismaHabit.completions?.map((c) =>
        this.completionToDomain(c),
      ),
      createdAt: prismaHabit.createdAt,
      updatedAt: prismaHabit.updatedAt,
    });
  }

  private completionToDomain(
    prismaCompletion: PrismaHabitCompletion,
  ): HabitCompletionProps {
    return {
      id: prismaCompletion.id,
      habitId: prismaCompletion.habitId,
      completedAt: prismaCompletion.completedAt,
      completedDate: prismaCompletion.completedDate,
      note: prismaCompletion.note ?? undefined,
      value: prismaCompletion.value ?? undefined,
    };
  }
}
