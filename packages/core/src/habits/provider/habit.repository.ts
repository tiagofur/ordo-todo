import { Habit, HabitProps } from "../model/habit.entity";
import { HabitCompletionProps } from "../model/habit.entity";

export interface IHabitRepository {
  findById(id: string): Promise<Habit | null>;
  findByUserId(userId: string): Promise<Habit[]>;
  findActiveByUserId(userId: string): Promise<Habit[]>;
  findTodayHabits(userId: string): Promise<Habit[]>;
  create(habit: Habit): Promise<Habit>;
  update(id: string, data: Partial<HabitProps>): Promise<Habit>;
  delete(id: string): Promise<void>;

  // Completions
  createCompletion(habitId: string, data: HabitCompletionProps): Promise<Habit>;
  deleteCompletion(habitId: string, date: Date): Promise<void>;
  getCompletions(
    habitId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HabitCompletionProps[]>;
  getCompletionForDate(
    habitId: string,
    date: Date,
  ): Promise<HabitCompletionProps | null>;

  // Stats
  getStats(habitId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
    thisWeekCompletions: number;
    thisMonthCompletions: number;
  }>;
}
