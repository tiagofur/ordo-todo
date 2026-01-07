export type SearchResultEntityType = 'task' | 'project' | 'note' | 'comment' | 'habit';

export interface SearchResultProps {
  id: string;
  type: SearchResultEntityType;
  title: string;
  description?: string;
  relevanceScore: number;
  highlights: string[];
  metadata: {
    status?: string;
    priority?: string;
    dueDate?: Date;
    projectName?: string;
    createdAt?: Date;
  };
}

export class SearchResult {
  constructor(private readonly props: SearchResultProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.id || this.props.id.trim().length === 0) {
      throw new Error('SearchResult id is required');
    }
    if (!this.props.type) {
      throw new Error('SearchResult type is required');
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new Error('SearchResult title is required');
    }
    if (this.props.relevanceScore < 0 || this.props.relevanceScore > 1) {
      throw new Error('SearchResult relevanceScore must be between 0 and 1');
    }
  }

  // Business logic
  isTask(): boolean {
    return this.props.type === 'task';
  }

  isProject(): boolean {
    return this.props.type === 'project';
  }

  isNote(): boolean {
    return this.props.type === 'note';
  }

  isComment(): boolean {
    return this.props.type === 'comment';
  }

  isHabit(): boolean {
    return this.props.type === 'habit';
  }

  isHighRelevance(threshold: number = 0.8): boolean {
    return this.props.relevanceScore >= threshold;
  }

  hasHighlights(): boolean {
    return this.props.highlights.length > 0;
  }

  getHighlightCount(): number {
    return this.props.highlights.length;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get type(): SearchResultEntityType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get relevanceScore(): number {
    return this.props.relevanceScore;
  }

  get highlights(): string[] {
    return [...this.props.highlights];
  }

  get metadata() {
    return this.props.metadata;
  }
}

export interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  interpretation: {
    intent: string;
    explanation: string;
    suggestedFilters?: any;
  };
  totalCount: number;
  executionTime: number;
}

export class SearchResults {
  constructor(private readonly props: SearchResultsProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.query || this.props.query.trim().length === 0) {
      throw new Error('SearchResults query is required');
    }
    if (!Array.isArray(this.props.results)) {
      throw new Error('SearchResults results must be an array');
    }
    if (this.props.totalCount < 0) {
      throw new Error('SearchResults totalCount cannot be negative');
    }
    if (this.props.executionTime < 0) {
      throw new Error('SearchResults executionTime cannot be negative');
    }
  }

  // Business logic
  hasResults(): boolean {
    return this.props.results.length > 0;
  }

  getResultCount(): number {
    return this.props.results.length;
  }

  getTopResults(count: number = 5): SearchResult[] {
    return this.props.results.slice(0, count);
  }

  getResultsByType(type: SearchResultEntityType): SearchResult[] {
    return this.props.results.filter(r => r.type === type);
  }

  getHighRelevanceResults(threshold: number = 0.8): SearchResult[] {
    return this.props.results.filter(r => r.isHighRelevance(threshold));
  }

  getTaskResults(): SearchResult[] {
    return this.getResultsByType('task');
  }

  getProjectResults(): SearchResult[] {
    return this.getResultsByType('project');
  }

  // Getters
  get query(): string {
    return this.props.query;
  }

  get results(): SearchResult[] {
    return this.props.results;
  }

  get interpretation() {
    return this.props.interpretation;
  }

  get totalCount(): number {
    return this.props.totalCount;
  }

  get executionTime(): number {
    return this.props.executionTime;
  }
}
