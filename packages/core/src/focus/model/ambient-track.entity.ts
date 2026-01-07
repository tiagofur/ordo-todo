import { Entity, EntityProps } from '../../shared/entity';

export type TrackCategory = 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural';

export interface AmbientTrackProps extends EntityProps {
  name: string;
  description: string;
  category: TrackCategory;
  iconEmoji: string;
  url: string;
  duration: number; // in seconds, 0 = looping
  isPremium: boolean;
}

export class AmbientTrack extends Entity<AmbientTrackProps> {
  constructor(props: AmbientTrackProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('AmbientTrack name is required');
    }
    if (this.props.name.length > 255) {
      throw new Error('AmbientTrack name must be 255 characters or less');
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('AmbientTrack description is required');
    }
    if (this.props.description.length > 1000) {
      throw new Error('AmbientTrack description must be 1000 characters or less');
    }
    if (!this.props.url || this.props.url.trim().length === 0) {
      throw new Error('AmbientTrack URL is required');
    }
    if (this.props.duration < 0) {
      throw new Error('AmbientTrack duration cannot be negative');
    }
    if (!this.props.iconEmoji || this.props.iconEmoji.trim().length === 0) {
      throw new Error('AmbientTrack iconEmoji is required');
    }
  }

  // Business logic methods
  isLooping(): boolean {
    return this.props.duration === 0;
  }

  getDurationInMinutes(): number {
    return this.props.duration / 60;
  }

  isAccessibleToUser(hasPremium: boolean): boolean {
    return !this.props.isPremium || hasPremium;
  }

  matchesCategory(category: TrackCategory): boolean {
    return this.props.category === category;
  }

  isNature(): boolean {
    return this.props.category === 'nature';
  }

  isCafe(): boolean {
    return this.props.category === 'cafe';
  }

  isMusic(): boolean {
    return this.props.category === 'music';
  }

  isWhiteNoise(): boolean {
    return this.props.category === 'white-noise';
  }

  isBinaural(): boolean {
    return this.props.category === 'binaural';
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): TrackCategory {
    return this.props.category;
  }

  get iconEmoji(): string {
    return this.props.iconEmoji;
  }

  get url(): string {
    return this.props.url;
  }

  get duration(): number {
    return this.props.duration;
  }

  get isPremium(): boolean {
    return this.props.isPremium;
  }
}
