import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';
import { FocusPreferences } from '../model';

export interface ToggleFavoriteTrackInput {
  userId: string;
  trackId: string;
}

export class ToggleFavoriteTrackUseCase
  implements UseCase<ToggleFavoriteTrackInput, { isFavorite: boolean; preferences: FocusPreferences }>
{
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: ToggleFavoriteTrackInput): Promise<{
    isFavorite: boolean;
    preferences: FocusPreferences;
  }> {
    const prefs = await this.focusRepo.getUserPreferences(input.userId);

    if (!prefs) {
      // Create new preferences and add favorite
      const newPrefs = FocusPreferences.create(input.userId).addFavorite(input.trackId);
      await this.focusRepo.saveUserPreferences(newPrefs);
      return { isFavorite: true, preferences: newPrefs };
    }

    // Toggle favorite
    const updatedPrefs = prefs.toggleFavorite(input.trackId);
    await this.focusRepo.saveUserPreferences(updatedPrefs);

    return {
      isFavorite: updatedPrefs.isFavorite(input.trackId),
      preferences: updatedPrefs,
    };
  }
}
