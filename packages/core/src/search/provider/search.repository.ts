import { SearchQuery, SearchResult, SearchResults } from '../model';

export interface SearchRepository {
  // Search operations
  search(query: SearchQuery): Promise<SearchResults>;

  // Suggestions
  getSuggestions(userId: string, partialQuery: string, limit?: number): Promise<Array<{
    text: string;
    type: 'query' | 'task' | 'project';
    count: number;
  }>>;

  // Quick search
  quickSearch(userId: string, query: string, limit?: number): Promise<SearchResult[]>;

  // Ask natural language questions
  askQuestion(userId: string, question: string): Promise<{
    answer: string;
    type: 'summary' | 'data' | 'error';
    data?: any;
  }>;
}

export interface SearchService {
  // AI-based interpretation
  interpretQuery(query: string): Promise<{
    intent: 'find' | 'filter' | 'aggregate' | 'compare';
    keywords: string[];
    suggestedFilters: any;
    explanation: string;
  }>;
}
