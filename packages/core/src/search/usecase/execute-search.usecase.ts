import { UseCase } from '../../shared/use-case';
import { SearchRepository } from '../provider/search.repository';
import { SearchQuery, SearchResults } from '../model';

export interface ExecuteSearchInput {
  userId: string;
  query: string;
  types?: string[];
  projectId?: string;
  includeCompleted?: boolean;
  limit?: number;
}

export class ExecuteSearchUseCase implements UseCase<ExecuteSearchInput, SearchResults> {
  constructor(private readonly searchRepo: SearchRepository) {}

  async execute(input: ExecuteSearchInput): Promise<SearchResults> {
    return await this.searchRepo.search(
      SearchQuery.create(
        input.userId,
        input.query,
        'find',
        [input.query],
        {
          types: input.types as any,
          projectId: input.projectId,
          includeCompleted: input.includeCompleted,
        }
      )
    );
  }
}
