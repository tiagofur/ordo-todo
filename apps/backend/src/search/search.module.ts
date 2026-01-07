import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AIModule } from '../ai/ai.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { SearchController } from './search.controller';
import { SemanticSearchService } from './semantic-search.service';
import { ExecuteSearchUseCase } from '@ordo-todo/core';
import { GetSuggestionsUseCase } from '@ordo-todo/core';
import { AskQuestionUseCase } from '@ordo-todo/core';

@Module({
  imports: [DatabaseModule, AIModule, RepositoriesModule],
  controllers: [SearchController],
  providers: [
    SemanticSearchService,
    {
      provide: 'ExecuteSearchUseCase',
      useFactory: (searchRepo: any) => new ExecuteSearchUseCase(searchRepo),
      inject: ['SearchRepository'],
    },
    {
      provide: 'GetSuggestionsUseCase',
      useFactory: (searchRepo: any) => new GetSuggestionsUseCase(searchRepo),
      inject: ['SearchRepository'],
    },
    {
      provide: 'AskQuestionUseCase',
      useFactory: (searchRepo: any) => new AskQuestionUseCase(searchRepo),
      inject: ['SearchRepository'],
    },
  ],
  exports: [SemanticSearchService, 'ExecuteSearchUseCase', 'GetSuggestionsUseCase', 'AskQuestionUseCase'],
})
export class SearchModule {}
