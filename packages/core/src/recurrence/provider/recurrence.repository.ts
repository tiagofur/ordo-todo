import { Recurrence } from '../model/recurrence.entity';
import { RecurrencePattern } from '../model/recurrence-pattern.enum';

/**
 * Input for creating/updating recurrence
 */
export interface RecurrenceInput {
  taskId: string;
  pattern: RecurrencePattern;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
}

/**
 * Repository interface for Recurrence domain
 */
export interface RecurrenceRepository {
  /**
   * Create recurrence for a task
   */
  create(input: RecurrenceInput): Promise<Recurrence>;

  /**
   * Get recurrence by ID
   */
  findById(id: string): Promise<Recurrence | null>;

  /**
   * Get recurrence by task ID
   */
  findByTaskId(taskId: string): Promise<Recurrence | null>;

  /**
   * Update recurrence
   */
  update(id: string, input: Partial<RecurrenceInput>): Promise<Recurrence>;

  /**
   * Delete recurrence
   */
  delete(id: string): Promise<void>;

  /**
   * Get all active recurrences
   */
  findActive(): Promise<Recurrence[]>;

  /**
   * Get recurrences ending before a date
   */
  findEndingBefore(date: Date): Promise<Recurrence[]>;

  /**
   * Get recurrences for a specific pattern
   */
  findByPattern(pattern: RecurrencePattern): Promise<Recurrence[]>;
}
