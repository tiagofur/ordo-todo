import { UseCase } from '../../shared/use-case';
import { RecurrenceRepository, RecurrenceInput } from '../provider/recurrence.repository';
import { Recurrence } from '../model/recurrence.entity';

export class CreateRecurrenceUseCase implements UseCase<RecurrenceInput, Recurrence> {
  constructor(private readonly recurrenceRepo: RecurrenceRepository) {}

  async execute(input: RecurrenceInput): Promise<Recurrence> {
    return await this.recurrenceRepo.create(input);
  }
}
