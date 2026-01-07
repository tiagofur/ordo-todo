import { FocusPreferences, FocusStats } from '../model';

export interface TrackUsageRecord {
  trackId: string;
  durationMinutes: number;
  userId: string;
  recordedAt?: Date;
}

export interface FocusRepository {
  // Preferences management
  getUserPreferences(userId: string): Promise<FocusPreferences | null>;
  saveUserPreferences(preferences: FocusPreferences): Promise<void>;

  // Statistics
  getFocusStats(userId: string): Promise<FocusStats>;
  calculateFocusStreak(userId: string): Promise<number>;

  // Track usage analytics
  recordTrackUsage(record: TrackUsageRecord): Promise<void>;
  getMostUsedTracks(userId: string, limit?: number): Promise<Array<{ trackId: string; count: number }>>;

  // Get most used mode
  getMostUsedMode(userId: string): Promise<string | null>;
}
