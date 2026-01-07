import { UseCase } from '../../shared/use-case';
import { RecurrenceRepository } from '../provider/recurrence.repository';

export interface GetNextOccurrenceInput {
  taskId: string;
  fromDate?: Date;
}

export class GetNextOccurrenceUseCase implements UseCase<GetNextOccurrenceInput, Date | null> {
  constructor(private readonly recurrenceRepo: RecurrenceRepository) {}

  async execute(input: GetNextOccurrenceInput): Promise<Date | null> {
    const recurrence = await this.recurrenceRepo.findByTaskId(input.taskId);

    if (!recurrence) {
      return null;
    }

    return recurrence.getNextOccurrence(input.fromDate);
  }
}
