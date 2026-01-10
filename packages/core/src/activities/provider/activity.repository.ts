import { Activity, ActivityMetadata } from '../model/activity.entity';
import { ActivityType } from '../model/activity-type.enum';

/**
 * Input for creating an activity log
 */
export interface CreateActivityInput {
  taskId: string;
  userId: string;
  type: ActivityType;
  metadata?: ActivityMetadata;
}

/**
 * Repository interface for Activity domain
 */
export interface ActivityRepository {
  /**
   * Log a new activity
   */
  logActivity(input: CreateActivityInput): Promise<Activity>;

  /**
   * Get activities for a specific task
   */
  getTaskActivities(taskId: string, limit?: number): Promise<Activity[]>;

  /**
   * Get activities by user
   */
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;

  /**
   * Get activities by type
   */
  getActivitiesByType(type: ActivityType, limit?: number): Promise<Activity[]>;

  /**
   * Get activities within a date range
   */
  getActivitiesByDateRange(
    startDate: Date,
    endDate: Date,
    taskId?: string,
  ): Promise<Activity[]>;

  /**
   * Delete old activities (for cleanup/retention)
   */
  deleteOldActivities(beforeDate: Date): Promise<number>;
}
