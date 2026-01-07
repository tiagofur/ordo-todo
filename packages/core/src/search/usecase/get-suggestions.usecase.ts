import { UseCase } from '../../shared/use-case';
import { SearchRepository } from '../provider/search.repository';

export interface GetSuggestionsInput {
  userId: string;
  partialQuery: string;
  limit?: number;
}

export class GetSuggestionsUseCase implements UseCase<GetSuggestionsInput, any> {
  constructor(private readonly searchRepo: SearchRepository) {}

  async execute(input: GetSuggestionsInput): Promise<any> {
    const suggestions = await this.searchRepo.getSuggestions(
      input.userId,
      input.partialQuery,
      input.limit || 5
    );

    return { suggestions };
  }
}
