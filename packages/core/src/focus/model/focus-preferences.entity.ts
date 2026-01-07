import { Entity, EntityProps } from '../../shared/entity';

export interface FocusPreferencesProps extends EntityProps {
  userId: string;
  favoriteTrackIds: string[];
  defaultVolume: number; // 0-100
  enableTransitions: boolean;
  preferredModeId: string | null;
}

export class FocusPreferences extends Entity<FocusPreferencesProps> {
  constructor(props: FocusPreferencesProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  static create(userId: string): FocusPreferences {
    return new FocusPreferences({
      id: 'prefs', // Not stored as separate entity
      userId,
      favoriteTrackIds: [],
      defaultVolume: 50,
      enableTransitions: true,
      preferredModeId: null,
    });
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error('FocusPreferences userId is required');
    }
    if (this.props.defaultVolume < 0 || this.props.defaultVolume > 100) {
      throw new Error('FocusPreferences defaultVolume must be between 0 and 100');
    }
    if (!Array.isArray(this.props.favoriteTrackIds)) {
      throw new Error('FocusPreferences favoriteTrackIds must be an array');
    }
  }

  // Business logic methods
  addFavorite(trackId: string): FocusPreferences {
    if (this.props.favoriteTrackIds.includes(trackId)) {
      return this; // Already favorited, return same instance
    }
    return this.clone({
      favoriteTrackIds: [...this.props.favoriteTrackIds, trackId],
    });
  }

  removeFavorite(trackId: string): FocusPreferences {
    return this.clone({
      favoriteTrackIds: this.props.favoriteTrackIds.filter((id) => id !== trackId),
    });
  }

  toggleFavorite(trackId: string): FocusPreferences {
    if (this.props.favoriteTrackIds.includes(trackId)) {
      return this.removeFavorite(trackId);
    }
    return this.addFavorite(trackId);
  }

  isFavorite(trackId: string): boolean {
    return this.props.favoriteTrackIds.includes(trackId);
  }

  updateVolume(volume: number): FocusPreferences {
    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }
    return this.clone({
      defaultVolume: volume,
    });
  }

  setTransitionsEnabled(enabled: boolean): FocusPreferences {
    return this.clone({
      enableTransitions: enabled,
    });
  }

  setPreferredMode(modeId: string | null): FocusPreferences {
    return this.clone({
      preferredModeId: modeId,
    });
  }

  hasPreferredMode(): boolean {
    return this.props.preferredModeId !== null;
  }

  getFavoriteCount(): number {
    return this.props.favoriteTrackIds.length;
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get favoriteTrackIds(): string[] {
    return [...this.props.favoriteTrackIds];
  }

  get defaultVolume(): number {
    return this.props.defaultVolume;
  }

  get enableTransitions(): boolean {
    return this.props.enableTransitions;
  }

  get preferredModeId(): string | null {
    return this.props.preferredModeId;
  }
}
