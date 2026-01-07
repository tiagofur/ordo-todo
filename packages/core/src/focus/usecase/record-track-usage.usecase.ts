import { UseCase } from '../../shared/use-case';
import { FocusRepository } from '../provider/focus.repository';

export interface RecordTrackUsageInput {
  userId: string;
  trackId: string;
  durationMinutes: number;
}

export class RecordTrackUsageUseCase implements UseCase<RecordTrackUsageInput, void> {
  constructor(private readonly focusRepo: FocusRepository) {}

  async execute(input: RecordTrackUsageInput): Promise<void> {
    if (input.durationMinutes < 0) {
      throw new Error('Duration cannot be negative');
    }

    await this.focusRepo.recordTrackUsage({
      trackId: input.trackId,
      durationMinutes: input.durationMinutes,
      userId: input.userId,
      recordedAt: new Date(),
    });
  }
}
