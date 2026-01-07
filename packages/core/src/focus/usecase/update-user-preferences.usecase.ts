import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';
import { FocusPreferences } from '../model';

export interface UpdateUserPreferencesInput {
  userId: string;
  defaultVolume?: number;
  enableTransitions?: boolean;
  preferredModeId?: string | null;
}

export class UpdateUserPreferencesUseCase
  implements UseCase<UpdateUserPreferencesInput, FocusPreferences>
{
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: UpdateUserPreferencesInput): Promise<FocusPreferences> {
    // Get current preferences
    const currentPrefs = await this.focusRepo.getUserPreferences(input.userId);

    if (!currentPrefs) {
      // Create new preferences with updates applied
      let newPrefs = FocusPreferences.create(input.userId);

      if (input.defaultVolume !== undefined) {
        newPrefs = newPrefs.updateVolume(input.defaultVolume);
      }
      if (input.enableTransitions !== undefined) {
        newPrefs = newPrefs.setTransitionsEnabled(input.enableTransitions);
      }
      if (input.preferredModeId !== undefined) {
        newPrefs = newPrefs.setPreferredMode(input.preferredModeId);
      }

      await this.focusRepo.saveUserPreferences(newPrefs);
      return newPrefs;
    }

    // Update existing preferences
    let updatedPrefs = currentPrefs;

    if (input.defaultVolume !== undefined) {
      updatedPrefs = updatedPrefs.updateVolume(input.defaultVolume);
    }
    if (input.enableTransitions !== undefined) {
      updatedPrefs = updatedPrefs.setTransitionsEnabled(input.enableTransitions);
    }
    if (input.preferredModeId !== undefined) {
      updatedPrefs = updatedPrefs.setPreferredMode(input.preferredModeId);
    }

    await this.focusRepo.saveUserPreferences(updatedPrefs);
    return updatedPrefs;
  }
}
