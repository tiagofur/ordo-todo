import { UseCase } from '../../shared/use-case';
import { SearchRepository } from '../provider/search.repository';

export interface AskQuestionInput {
  userId: string;
  question: string;
}

export class AskQuestionUseCase implements UseCase<AskQuestionInput, any> {
  constructor(private readonly searchRepo: SearchRepository) {}

  async execute(input: AskQuestionInput): Promise<any> {
    return await this.searchRepo.askQuestion(input.userId, input.question);
  }
}
