import { Entity } from '../../shared/entity';
import { RecurrencePattern } from './recurrence-pattern.enum';

// Re-export RecurrencePattern for convenience
export { RecurrencePattern };

/**
 * Properties for Recurrence entity
 */
export interface RecurrenceProps {
  id: string;
  taskId: string;
  pattern: RecurrencePattern;
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // [0,1,2,3,4,5,6] for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  createdAt: Date;
}

/**
 * Recurrence entity represents task recurrence patterns
 *
 * Handles complex recurring task logic including daily, weekly, monthly,
 * and yearly patterns with custom intervals and end dates.
 *
 * @example
 * ```typescript
 * const recurrence = new Recurrence({
 *   id: 'rec-123',
 *   taskId: 'task-456',
 *   pattern: RecurrencePattern.WEEKLY,
 *   interval: 2, // Every 2 weeks
 *   daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
 *   endDate: new Date('2026-12-31'),
 *   createdAt: new Date(),
 * });
 *
 * recurrence.getNextOccurrence(new Date()); // Returns next date
 * recurrence.isActive(); // true if before endDate
 * ```
 */
export class Recurrence extends Entity<RecurrenceProps> {
  constructor(props: RecurrenceProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  /**
   * Validate recurrence properties
   */
  private validate(): void {
    if (!this.props.taskId || this.props.taskId.trim() === '') {
      throw new Error('Recurrence must have a valid taskId');
    }
    if (!this.props.pattern) {
      throw new Error('Recurrence must have a pattern');
    }
    if (this.props.interval < 1) {
      throw new Error('Interval must be at least 1');
    }
    if (this.props.interval > 365) {
      throw new Error('Interval cannot exceed 365');
    }

    // Validate daysOfWeek for WEEKLY pattern
    if (this.props.pattern === RecurrencePattern.WEEKLY) {
      if (!this.props.daysOfWeek || this.props.daysOfWeek.length === 0) {
        throw new Error('WEEKLY pattern must specify daysOfWeek');
      }
      if (this.props.daysOfWeek.some((d) => d < 0 || d > 6)) {
        throw new Error('daysOfWeek must be between 0 and 6');
      }
    }

    // Validate dayOfMonth for MONTHLY pattern
    if (this.props.pattern === RecurrencePattern.MONTHLY) {
      if (!this.props.dayOfMonth) {
        throw new Error('MONTHLY pattern must specify dayOfMonth');
      }
      if (this.props.dayOfMonth < 1 || this.props.dayOfMonth > 31) {
        throw new Error('dayOfMonth must be between 1 and 31');
      }
    }

    // Validate endDate is in the future
    if (this.props.endDate && this.props.endDate < new Date()) {
      throw new Error('endDate must be in the future');
    }
  }

  // ===== Getters =====

  get taskId(): string {
    return this.props.taskId;
  }

  get pattern(): RecurrencePattern {
    return this.props.pattern;
  }

  get interval(): number {
    return this.props.interval;
  }

  get daysOfWeek(): number[] | undefined {
    return this.props.daysOfWeek;
  }

  get dayOfMonth(): number | undefined {
    return this.props.dayOfMonth;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  // ===== Business Methods =====

  /**
   * Check if recurrence is still active
   */
  isActive(): boolean {
    if (!this.props.endDate) {
      return true; // No end date = infinite recurrence
    }
    return new Date() < this.props.endDate;
  }

  /**
   * Check if recurrence has ended
   */
  hasEnded(): boolean {
    return !this.isActive();
  }

  /**
   * Check if pattern is daily
   */
  isDaily(): boolean {
    return this.props.pattern === RecurrencePattern.DAILY;
  }

  /**
   * Check if pattern is weekly
   */
  isWeekly(): boolean {
    return this.props.pattern === RecurrencePattern.WEEKLY;
  }

  /**
   * Check if pattern is monthly
   */
  isMonthly(): boolean {
    return this.props.pattern === RecurrencePattern.MONTHLY;
  }

  /**
   * Check if pattern is yearly
   */
  isYearly(): boolean {
    return this.props.pattern === RecurrencePattern.YEARLY;
  }

  /**
   * Calculate next occurrence from a given date
   */
  getNextOccurrence(fromDate: Date = new Date()): Date | null {
    if (this.hasEnded()) {
      return null;
    }

    let nextDate = new Date(fromDate);

    switch (this.props.pattern) {
      case RecurrencePattern.DAILY:
        nextDate.setDate(nextDate.getDate() + this.props.interval);
        break;

      case RecurrencePattern.WEEKLY:
        nextDate = this.getNextWeeklyOccurrence(nextDate);
        break;

      case RecurrencePattern.MONTHLY:
        nextDate = this.getNextMonthlyOccurrence(nextDate);
        break;

      case RecurrencePattern.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + this.props.interval);
        break;

      default:
        return null;
    }

    // Check if next date is past end date
    if (this.props.endDate && nextDate > this.props.endDate) {
      return null;
    }

    return nextDate;
  }

  /**
   * Get multiple next occurrences
   */
  getNextOccurrences(count: number, fromDate: Date = new Date()): Date[] {
    const occurrences: Date[] = [];
    let currentDate = fromDate;

    for (let i = 0; i < count; i++) {
      const next = this.getNextOccurrence(currentDate);
      if (!next) break;
      occurrences.push(next);
      currentDate = next;
    }

    return occurrences;
  }

  /**
   * Calculate next weekly occurrence
   */
  private getNextWeeklyOccurrence(fromDate: Date): Date {
    if (!this.props.daysOfWeek || this.props.daysOfWeek.length === 0) {
      // Default to same day every interval weeks
      const next = new Date(fromDate);
      next.setDate(next.getDate() + 7 * this.props.interval);
      return next;
    }

    const currentDay = fromDate.getDay();
    const days = this.props.daysOfWeek.sort((a, b) => a - b);

    // Find the next valid day
    for (const day of days) {
      const daysUntilDay = (day - currentDay + 7) % 7 || 7;
      const next = new Date(fromDate);
      next.setDate(next.getDate() + daysUntilDay);

      // If this day is within the current week, check if we need to skip intervals
      if (daysUntilDay > 0) {
        return next;
      }
    }

    // If no day found in current week, go to next interval
    const next = new Date(fromDate);
    next.setDate(next.getDate() + 7 * this.props.interval);
    return this.getNextWeeklyOccurrence(next);
  }

  /**
   * Calculate next monthly occurrence
   */
  private getNextMonthlyOccurrence(fromDate: Date): Date {
    if (!this.props.dayOfMonth) {
      // Default to same day every interval months
      const next = new Date(fromDate);
      next.setMonth(next.getMonth() + this.props.interval);
      return next;
    }

    const next = new Date(fromDate);
    next.setMonth(next.getMonth() + this.props.interval);
    next.setDate(Math.min(this.props.dayOfMonth, this.getDaysInMonth(next)));

    return next;
  }

  /**
   * Get number of days in a month
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get human-readable description
   */
  getDescription(): string {
    const pattern = this.props.pattern.toLowerCase();
    const interval = this.props.interval > 1 ? `every ${this.props.interval} ` : '';

    switch (this.props.pattern) {
      case RecurrencePattern.DAILY:
        return `${interval}day${this.props.interval > 1 ? 's' : ''}`;

      case RecurrencePattern.WEEKLY:
        if (this.props.daysOfWeek && this.props.daysOfWeek.length > 0) {
          const days = this.props.daysOfWeek.map((d) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return dayNames[d];
          }).join(', ');
          return `${interval}week on ${days}`;
        }
        return `${interval}week${this.props.interval > 1 ? 's' : ''}`;

      case RecurrencePattern.MONTHLY:
        return `${interval}month on day ${this.props.dayOfMonth}`;

      case RecurrencePattern.YEARLY:
        return `${interval}year${this.props.interval > 1 ? 's' : ''}`;

      default:
        return 'Custom recurrence';
    }
  }
}
