/**
 * Search-related types for semantic search, suggestions, and AI answers
 */

export interface SearchOptions {
  types?: Array<'task' | 'project' | 'habit'>;
  projectId?: string;
  includeCompleted?: boolean;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'habit';
  title: string;
  score: number;
  metadata?: {
    projectName?: string;
    status?: string;
    priority?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  interpretation: string | null;
  totalCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'task';
  count: number;
}

export interface SuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface AIAnswerResponse {
  answer: string;
  type: 'summary' | 'error';
  data?: {
    totalCount?: number;
    highPriority?: number;
    dueThisWeek?: number;
  };
}

export interface QuickSearchResult {
  id: string;
  type: 'task' | 'project';
  title: string;
  subtitle: string;
}

export interface QuickSearchResponse {
  results: QuickSearchResult[];
}
