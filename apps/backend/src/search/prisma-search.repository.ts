import { Injectable } from '@nestjs/common';
import {
  SearchQuery,
  SearchResult,
  SearchResults,
  SearchRepository,
} from '@ordo-todo/core';
import { SemanticSearchService } from './semantic-search.service';

/**
 * Adapter that implements SearchRepository using the existing SemanticSearchService.
 * Search is primarily an AI service without a dedicated Prisma model, so we wrap the existing service.
 */
@Injectable()
export class PrismaSearchRepository implements SearchRepository {
  constructor(private readonly semanticSearchService: SemanticSearchService) { }

  async search(query: SearchQuery): Promise<SearchResults> {
    const result = await this.semanticSearchService.search(
      query.userId,
      query.query,
      {
        types: query.filters.types,
        projectId: query.filters.projectId,
        includeCompleted: query.filters.includeCompleted,
        limit: 20, // Default limit
      },
    );

    // Convert to domain entities
    const searchResults = result.results.map(r =>
      new SearchResult({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        relevanceScore: r.relevanceScore,
        highlights: r.highlights,
        metadata: r.metadata,
      }),
    );

    return new SearchResults({
      query: query.query,
      results: searchResults,
      interpretation: {
        intent: result.interpretation.intent,
        explanation: result.interpretation.explanation,
        suggestedFilters: result.interpretation.suggestedFilters,
      },
      totalCount: result.totalCount,
      executionTime: 0, // Track if needed
    });
  }

  async getSuggestions(
    userId: string,
    partialQuery: string,
    limit: number = 5,
  ): Promise<Array<{ text: string; type: 'query' | 'task' | 'project'; count: number }>> {
    const suggestions = await this.semanticSearchService.getSuggestions(userId, partialQuery);
    return suggestions.slice(0, limit).map(s => ({ text: s, type: 'query', count: 0 }));
  }

  async quickSearch(userId: string, query: string, limit: number = 5): Promise<SearchResult[]> {
    const result = await this.semanticSearchService.search(userId, query, {
      limit,
      types: ['task', 'project'],
    });

    return result.results.map(r =>
      new SearchResult({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        relevanceScore: r.relevanceScore,
        highlights: r.highlights,
        metadata: r.metadata,
      }),
    );
  }

  async askQuestion(userId: string, question: string): Promise<{
    answer: string;
    type: 'summary' | 'data' | 'error';
    data?: any;
  }> {
    const result = await this.semanticSearchService.ask(userId, question);

    // Map internal types to repository types
    const typeMapping: Record<string, 'summary' | 'data' | 'error'> = {
      'count': 'data',
      'list': 'data',
      'summary': 'summary',
      'insight': 'summary'
    };

    return {
      answer: result.answer,
      type: typeMapping[result.type] || 'summary',
      data: result.data
    };
  }
}
