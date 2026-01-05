/**
 * Analytics-related types and DTOs
 */

export interface DailyMetrics {
  id: string;
  userId: string;
  date: Date;
  tasksCreated: number;
  tasksCompleted: number;
  subtasksCompleted: number;
  minutesWorked: number;
  pomodorosCompleted: number;
  shortBreaksCompleted: number;
  longBreaksCompleted: number;
  breakMinutes: number;
  focusScore?: number;
  createdAt: Date;
}

export interface GetDailyMetricsParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  totalFocusTime: number;
  averageProductivity: number;
  currentStreak: number;
}

/**
 * Productivity streak data from backend analytics
 */
export interface ProductivityStreak {
  currentStreak: number;
  longestStreak: number;
  productiveDaysLast90: number;
  avgDailyTasks: number;
  streakStatus: 'excellent' | 'good' | 'building';
}
