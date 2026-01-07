import { Entity, EntityProps } from '../../shared/entity';

export type SearchEntityType = 'task' | 'project' | 'note' | 'comment' | 'habit';
export type SearchIntent = 'find' | 'filter' | 'aggregate' | 'compare';

export interface SearchQueryProps extends EntityProps {
  userId: string;
  query: string;
  intent: SearchIntent;
  keywords: string[];
  filters: SearchFilters;
  createdAt: Date;
}

export interface SearchFilters {
  types?: SearchEntityType[];
  projectId?: string;
  workspaceId?: string;
  includeCompleted?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  priorities?: string[];
  statuses?: string[];
}

export class SearchQuery extends Entity<SearchQueryProps> {
  constructor(props: SearchQueryProps, mode: 'valid' | 'draft' = 'valid') {
    super(props, mode);
    if (mode === 'valid') {
      this.validate();
    }
  }

  static create(userId: string, query: string, intent: SearchIntent, keywords: string[], filters: SearchFilters): SearchQuery {
    return new SearchQuery({
      id: 'search-' + Date.now(),
      userId,
      query,
      intent,
      keywords,
      filters,
      createdAt: new Date(),
    });
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim().length === 0) {
      throw new Error('SearchQuery userId is required');
    }
    if (!this.props.query || this.props.query.trim().length === 0) {
      throw new Error('SearchQuery query is required');
    }
    if (this.props.query.length > 500) {
      throw new Error('SearchQuery query must be 500 characters or less');
    }
    if (!this.props.keywords || this.props.keywords.length === 0) {
      throw new Error('SearchQuery must have at least one keyword');
    }
  }

  // Business logic
  isTypeSearch(): boolean {
    return this.props.intent === 'find';
  }

  isFilterSearch(): boolean {
    return this.props.intent === 'filter';
  }

  isAggregateSearch(): boolean {
    return this.props.intent === 'aggregate';
  }

  isCompareSearch(): boolean {
    return this.props.intent === 'compare';
  }

  hasTypeFilter(): boolean {
    return !!this.props.filters.types && this.props.filters.types.length > 0;
  }

  hasProjectFilter(): boolean {
    return !!this.props.filters.projectId;
  }

  hasDateRange(): boolean {
    return !!this.props.filters.dateRange && (this.props.filters.dateRange.from || this.props.filters.dateRange.to);
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get query(): string {
    return this.props.query;
  }

  get intent(): SearchIntent {
    return this.props.intent;
  }

  get keywords(): string[] {
    return [...this.props.keywords];
  }

  get filters(): SearchFilters {
    return this.props.filters;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
