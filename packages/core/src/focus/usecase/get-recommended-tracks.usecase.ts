import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';
import { AmbientTrack, FocusPreferences } from '../model';

export interface GetRecommendedTracksInput {
  userId: string;
  hasPremium: boolean;
  allAvailableTracks: AmbientTrack[];
}

export class GetRecommendedTracksUseCase
  implements UseCase<GetRecommendedTracksInput, AmbientTrack[]>
{
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: GetRecommendedTracksInput): Promise<AmbientTrack[]> {
    const hour = new Date().getHours();
    const prefs = await this.focusRepo.getUserPreferences(input.userId);
    const userPrefs = prefs || FocusPreferences.create(input.userId);

    // Get accessible tracks
    const accessibleTracks = input.allAvailableTracks.filter((track) =>
      track.isAccessibleToUser(input.hasPremium),
    );

    // Filter by time of day
    let recommended: AmbientTrack[];

    // Morning: energizing sounds
    if (hour >= 6 && hour < 12) {
      recommended = accessibleTracks.filter(
        (track) =>
          track.isCafe() ||
          track.id === 'forest' ||
          track.id === 'focus-binaural',
      );
    }
    // Afternoon: focus sounds
    else if (hour >= 12 && hour < 17) {
      recommended = accessibleTracks.filter(
        (track) =>
          track.isWhiteNoise() ||
          track.id === 'rain-soft' ||
          track.isMusic(),
      );
    }
    // Evening: calming sounds
    else if (hour >= 17 && hour < 22) {
      recommended = accessibleTracks.filter(
        (track) =>
          track.id === 'rain-soft' ||
          track.id === 'ocean-waves' ||
          track.id === 'river-stream',
      );
    }
    // Night: deep focus
    else {
      recommended = accessibleTracks.filter(
        (track) =>
          track.isWhiteNoise() ||
          track.id === 'brown-noise' ||
          track.isBinaural(),
      );
    }

    // Prioritize favorite tracks
    const favorites = recommended.filter((track) =>
      userPrefs.isFavorite(track.id),
    );
    const nonFavorites = recommended.filter(
      (track) => !userPrefs.isFavorite(track.id),
    );

    return [...favorites, ...nonFavorites];
  }
}
