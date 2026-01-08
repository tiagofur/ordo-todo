import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  AmbientTrack,
  FocusMode,
  GetUserPreferencesUseCase,
  UpdateUserPreferencesUseCase,
  ToggleFavoriteTrackUseCase,
  GetFocusStatsUseCase,
  RecordTrackUsageUseCase,
  GetRecommendedTracksUseCase,
} from '@ordo-todo/core';
import type {
  FocusPreferences,
  FocusStats,
  FocusRepository,
} from '@ordo-todo/core';

/**
 * Built-in ambient tracks data
 * In production, these would come from a CDN or database
 */
const AMBIENT_TRACKS_DATA: Array<{
  id: string;
  name: string;
  description: string;
  category: 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural';
  iconEmoji: string;
  url: string;
  duration: number;
  isPremium: boolean;
}> = [
  // Nature sounds
  {
    id: 'rain-soft',
    name: 'Lluvia Suave',
    description: 'Sonido de lluvia relajante',
    category: 'nature',
    iconEmoji: '🌧️',
    url: '/audio/ambient/rain-soft.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'rain-thunder',
    name: 'Tormenta',
    description: 'Lluvia con truenos distantes',
    category: 'nature',
    iconEmoji: '⛈️',
    url: '/audio/ambient/rain-thunder.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'forest',
    name: 'Bosque',
    description: 'Pájaros y brisa en el bosque',
    category: 'nature',
    iconEmoji: '🌲',
    url: '/audio/ambient/forest.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'ocean-waves',
    name: 'Olas del Mar',
    description: 'Olas rompiendo en la playa',
    category: 'nature',
    iconEmoji: '🌊',
    url: '/audio/ambient/ocean-waves.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'river-stream',
    name: 'Río',
    description: 'Corriente de agua suave',
    category: 'nature',
    iconEmoji: '🏞️',
    url: '/audio/ambient/river-stream.mp3',
    duration: 0,
    isPremium: false,
  },
  // Cafe/Urban
  {
    id: 'cafe-ambient',
    name: 'Cafetería',
    description: 'Ambiente de café con murmullos',
    category: 'cafe',
    iconEmoji: '☕',
    url: '/audio/ambient/cafe-ambient.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'library',
    name: 'Biblioteca',
    description: 'Silencio con sonidos sutiles',
    category: 'cafe',
    iconEmoji: '📚',
    url: '/audio/ambient/library.mp3',
    duration: 0,
    isPremium: false,
  },
  // White noise
  {
    id: 'white-noise',
    name: 'Ruido Blanco',
    description: 'Ruido blanco puro',
    category: 'white-noise',
    iconEmoji: '📻',
    url: '/audio/ambient/white-noise.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'pink-noise',
    name: 'Ruido Rosa',
    description: 'Frecuencias bajas relajantes',
    category: 'white-noise',
    iconEmoji: '🎵',
    url: '/audio/ambient/pink-noise.mp3',
    duration: 0,
    isPremium: false,
  },
  {
    id: 'brown-noise',
    name: 'Ruido Marrón',
    description: 'Profundo y envolvente',
    category: 'white-noise',
    iconEmoji: '🔊',
    url: '/audio/ambient/brown-noise.mp3',
    duration: 0,
    isPremium: false,
  },
  // Binaural beats (premium)
  {
    id: 'focus-binaural',
    name: 'Focus (Beta)',
    description: 'Ondas beta para concentración',
    category: 'binaural',
    iconEmoji: '🧠',
    url: '/audio/ambient/focus-binaural.mp3',
    duration: 0,
    isPremium: true,
  },
  {
    id: 'deep-work-binaural',
    name: 'Deep Work (Alpha)',
    description: 'Ondas alpha para trabajo profundo',
    category: 'binaural',
    iconEmoji: '💫',
    url: '/audio/ambient/deep-work-binaural.mp3',
    duration: 0,
    isPremium: true,
  },
  // Lo-fi music (premium)
  {
    id: 'lofi-beats',
    name: 'Lo-Fi Beats',
    description: 'Música lo-fi relajante',
    category: 'music',
    iconEmoji: '🎧',
    url: '/audio/ambient/lofi-beats.mp3',
    duration: 0,
    isPremium: true,
  },
];

/**
 * Built-in focus modes data
 */
const FOCUS_MODES_DATA: Array<{
  id: string;
  name: string;
  description: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  recommendedTrackIds: string[];
}> = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Clásico',
    description: '25 min trabajo, 5 min descanso',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    recommendedTrackIds: ['rain-soft', 'cafe-ambient', 'white-noise'],
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    description: '50 min trabajo, 10 min descanso',
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 2,
    recommendedTrackIds: ['brown-noise', 'forest', 'deep-work-binaural'],
  },
  {
    id: 'flow',
    name: 'Flow State',
    description: '90 min trabajo, 20 min descanso',
    workDuration: 90,
    shortBreakDuration: 20,
    longBreakDuration: 45,
    sessionsBeforeLongBreak: 2,
    recommendedTrackIds: ['focus-binaural', 'river-stream', 'lofi-beats'],
  },
  {
    id: 'quick-sprint',
    name: 'Sprint Rápido',
    description: '15 min trabajo intenso',
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    sessionsBeforeLongBreak: 6,
    recommendedTrackIds: ['white-noise', 'focus-binaural'],
  },
  {
    id: 'ultradian',
    name: 'Ciclo Ultradiano',
    description: '90 min siguiendo ritmos naturales',
    workDuration: 90,
    shortBreakDuration: 20,
    longBreakDuration: 20,
    sessionsBeforeLongBreak: 1,
    recommendedTrackIds: ['ocean-waves', 'forest', 'river-stream'],
  },
];

@Injectable()
export class FocusAudioService {
  private readonly logger = new Logger(FocusAudioService.name);

  // Cache domain entities
  private readonly ambientTracks: AmbientTrack[];
  private readonly focusModes: FocusMode[];

  constructor(
    @Inject('FocusRepository')
    private readonly focusRepo: FocusRepository,
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase,
    private readonly updateUserPreferencesUseCase: UpdateUserPreferencesUseCase,
    private readonly toggleFavoriteTrackUseCase: ToggleFavoriteTrackUseCase,
    private readonly getFocusStatsUseCase: GetFocusStatsUseCase,
    private readonly recordTrackUsageUseCase: RecordTrackUsageUseCase,
    private readonly getRecommendedTracksUseCase: GetRecommendedTracksUseCase,
  ) {
    // Initialize domain entities from static data
    this.ambientTracks = AMBIENT_TRACKS_DATA.map(
      (data) =>
        new AmbientTrack({
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.category,
          iconEmoji: data.iconEmoji,
          url: data.url,
          duration: data.duration,
          isPremium: data.isPremium,
        }),
    );

    this.focusModes = FOCUS_MODES_DATA.map(
      (data) =>
        new FocusMode({
          id: data.id,
          name: data.name,
          description: data.description,
          workDuration: data.workDuration,
          shortBreakDuration: data.shortBreakDuration,
          longBreakDuration: data.longBreakDuration,
          sessionsBeforeLongBreak: data.sessionsBeforeLongBreak,
          recommendedTrackIds: data.recommendedTrackIds,
        }),
    );
  }

  // ============ AMBIENT TRACKS ============

  /**
   * Get all available ambient tracks
   */
  getAvailableTracks(includePremium = true): AmbientTrack[] {
    if (includePremium) {
      return this.ambientTracks;
    }
    return this.ambientTracks.filter((t) => !t.isPremium);
  }

  /**
   * Get tracks by category
   */
  getTracksByCategory(category: AmbientTrack['category']): AmbientTrack[] {
    return this.ambientTracks.filter((t) => t.matchesCategory(category));
  }

  /**
   * Get a specific track by ID
   */
  getTrack(trackId: string): AmbientTrack | null {
    return this.ambientTracks.find((t) => t.id === trackId) || null;
  }

  /**
   * Get recommended tracks based on time of day and user history
   */
  async getRecommendedTracks(
    userId: string,
    hasPremium = true,
  ): Promise<AmbientTrack[]> {
    return await this.getRecommendedTracksUseCase.execute({
      userId,
      hasPremium,
      allAvailableTracks: this.getAvailableTracks(hasPremium),
    });
  }

  // ============ FOCUS MODES ============

  /**
   * Get all available focus modes
   */
  getAvailableModes(): FocusMode[] {
    return this.focusModes;
  }

  /**
   * Get a specific focus mode by ID
   */
  getMode(modeId: string): FocusMode | null {
    return this.focusModes.find((m) => m.id === modeId) || null;
  }

  // ============ USER PREFERENCES ============

  /**
   * Get user's favorite tracks
   */
  async getUserFavorites(userId: string): Promise<AmbientTrack[]> {
    const prefs = await this.getUserPreferencesUseCase.execute({ userId });
    return this.ambientTracks.filter((t) => prefs.isFavorite(t.id));
  }

  /**
   * Toggle a track as favorite
   */
  async toggleFavorite(
    userId: string,
    trackId: string,
  ): Promise<{ isFavorite: boolean }> {
    const result = await this.toggleFavoriteTrackUseCase.execute({
      userId,
      trackId,
    });
    return { isFavorite: result.isFavorite };
  }

  /**
   * Get user's audio preferences
   */
  async getUserPreferences(userId: string): Promise<FocusPreferences> {
    return await this.getUserPreferencesUseCase.execute({ userId });
  }

  /**
   * Save user's audio preferences
   */
  async saveUserPreferences(
    userId: string,
    prefs: Partial<FocusPreferences>,
  ): Promise<FocusPreferences> {
    return await this.updateUserPreferencesUseCase.execute({
      userId,
      defaultVolume: prefs.defaultVolume,
      enableTransitions: prefs.enableTransitions,
      preferredModeId: prefs.preferredModeId,
    });
  }

  // ============ STATISTICS ============

  /**
   * Get focus session statistics
   */
  async getFocusStats(userId: string): Promise<FocusStats> {
    return await this.getFocusStatsUseCase.execute({ userId });
  }

  /**
   * Record track usage for analytics
   */
  async recordTrackUsage(
    userId: string,
    trackId: string,
    durationMinutes: number,
  ): Promise<void> {
    await this.recordTrackUsageUseCase.execute({
      userId,
      trackId,
      durationMinutes,
    });
  }
}
