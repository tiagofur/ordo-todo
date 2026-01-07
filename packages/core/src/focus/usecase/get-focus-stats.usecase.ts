import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';
import { FocusStats } from '../model';

export interface GetFocusStatsInput {
  userId: string;
}

export class GetFocusStatsUseCase
  implements UseCase<GetFocusStatsInput, FocusStats>
{
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: GetFocusStatsInput): Promise<FocusStats> {
    return await this.focusRepo.getFocusStats(input.userId);
  }
}
