import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import {
  SemanticSearchService,
  SearchOptions,
} from './semantic-search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SemanticSearchService) {}

  /**
   * Perform a semantic search across all user content
   * @param q - The search query in natural language
   * @param types - Optional comma-separated list of types to search (task,project,habit)
   * @param projectId - Optional project filter
   * @param includeCompleted - Include completed items (default: false)
   * @param limit - Max results (default: 20)
   */
  @Get()
  async search(
    @Query('q') query: string,
    @Query('types') types?: string,
    @Query('projectId') projectId?: string,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!query || query.trim().length === 0) {
      return {
        results: [],
        interpretation: null,
        totalCount: 0,
        error: 'Query is required',
      };
    }

    const options: SearchOptions = {
      limit: limit ? parseInt(limit, 10) : 20,
      includeCompleted: includeCompleted === 'true',
      projectId,
    };

    if (types) {
      options.types = types.split(',') as Array<'task' | 'project' | 'habit'>;
    }

    return this.searchService.search(user!.id, query, options);
  }

  /**
   * Get search suggestions based on partial input
   */
  @Get('suggestions')
  async getSuggestions(
    @Query('q') partialQuery: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!partialQuery || partialQuery.length < 2) {
      return { suggestions: [] };
    }

    const suggestions = await this.searchService.getSuggestions(
      user.id,
      partialQuery,
    );
    return { suggestions };
  }

  /**
   * Ask a natural language question about your data
   * Examples:
   * - "¿Cuántas tareas tengo pendientes?"
   * - "¿Qué tareas vencen esta semana?"
   * - "¿Cómo va mi productividad?"
   */
  @Get('ask')
  async ask(@Query('q') question: string, @CurrentUser() user: RequestUser) {
    if (!question || question.trim().length === 0) {
      return {
        answer: 'Por favor, haz una pregunta',
        type: 'error',
      };
    }

    return this.searchService.ask(user.id, question);
  }

  /**
   * Quick search - simplified search for autocomplete/quick access
   */
  @Get('quick')
  async quickSearch(
    @Query('q') query: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!query || query.length < 2) {
      return { results: [] };
    }

    const result = await this.searchService.search(user.id, query, {
      limit: 5,
      types: ['task', 'project'],
    });

    // Return simplified results
    return {
      results: result.results.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        subtitle: r.metadata.projectName || r.metadata.status,
      })),
    };
  }
}
