/**
 * Focus audio DTOs (ambient tracks, modes, preferences, stats).
 * Wire shapes mirror the backend focus controller; field sets follow the
 * core focus domain (AmbientTrack / FocusMode / FocusPreferences /
 * FocusStats) without importing entity machinery into the transport layer.
 */

export type FocusTrackCategory =
  | 'nature'
  | 'cafe'
  | 'music'
  | 'white-noise'
  | 'binaural';

export interface FocusTrack {
  id: string;
  name: string;
  description: string;
  category: FocusTrackCategory;
  iconEmoji: string;
  url: string;
  /** Duration in seconds; 0 = looping. */
  duration: number;
  isPremium: boolean;
}

export interface FocusMode {
  id: string;
  name: string;
  description: string;
  /** Durations in minutes. */
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  recommendedTrackIds: string[];
}

export interface FocusPreferences {
  id: string;
  userId: string;
  favoriteTrackIds: string[];
  /** Volume 0-100. */
  defaultVolume: number;
  enableTransitions: boolean;
  preferredModeId: string | null;
}

export interface UpdateFocusPreferencesDto {
  favoriteTrackIds?: string[];
  defaultVolume?: number;
  enableTransitions?: boolean;
  preferredModeId?: string | null;
}

export interface FocusFavoriteResult {
  isFavorite: boolean;
}

export interface FocusStats {
  totalSessions: number;
  totalFocusMinutes: number;
  avgSessionLength: number;
  favoriteTrack: string | null;
  preferredMode: string | null;
  streakDays: number;
}
