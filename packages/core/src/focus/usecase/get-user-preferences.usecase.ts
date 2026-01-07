import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';
import { FocusPreferences } from '../model';

export interface GetUserPreferencesInput {
  userId: string;
}

export class GetUserPreferencesUseCase
  implements UseCase<GetUserPreferencesInput, FocusPreferences>
{
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: GetUserPreferencesInput): Promise<FocusPreferences> {
    const prefs = await this.focusRepo.getUserPreferences(input.userId);

    if (!prefs) {
      // Return default preferences if none exist
      return FocusPreferences.create(input.userId);
    }

    return prefs;
  }
}
