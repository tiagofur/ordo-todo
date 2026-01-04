'use client';

import { Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';

export interface TagOption {
  id: string;
  name: string;
  color: string;
}

export interface TaskFiltersState {
  status: string[];
  priority: string[];
  tags?: string[];
}

interface TaskFiltersProps {
  /** Current filter state */
  filters: TaskFiltersState;
  /** Called when filters change */
  onFiltersChange: (filters: TaskFiltersState) => void;
  /** Available tags to filter by */
  tags?: TagOption[];
  /** Custom labels for i18n */
  labels?: {
    label?: string;
    clear?: string;
    statusLabel?: string;
    statusTodo?: string;
    statusInProgress?: string;
    statusCompleted?: string;
    statusCancelled?: string;
    priorityLabel?: string;
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    tagsLabel?: string;
  };
  className?: string;
}

/**
 * TaskFilters - Platform-agnostic task filtering dropdown
 * 
 * Tags passed via props instead of fetched internally.
 * 
 * @example
 * const { data: tags } = useTags(workspaceId);
 * const [filters, setFilters] = useState({ status: [], priority: [], tags: [] });
 * 
 * <TaskFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   tags={tags}
 *   labels={{ statusLabel: t('status.label') }}
 * />
 */
export function TaskFilters({
  filters,
  onFiltersChange,
  tags = [],
  labels = {},
  className = '',
}: TaskFiltersProps) {
  const {
    label = 'Filters',
    clear = 'Clear',
    statusLabel = 'Status',
    statusTodo = 'To Do',
    statusInProgress = 'In Progress',
    statusCompleted = 'Completed',
    statusCancelled = 'Cancelled',
    priorityLabel = 'Priority',
    priorityLow = 'Low',
    priorityMedium = 'Medium',
    priorityHigh = 'High',
    priorityUrgent = 'Urgent',
    tagsLabel = 'Tags',
  } = labels;

  const statusOptions = [
    { value: 'TODO', label: statusTodo },
    { value: 'IN_PROGRESS', label: statusInProgress },
    { value: 'COMPLETED', label: statusCompleted },
    { value: 'CANCELLED', label: statusCancelled },
  ];

  const priorityOptions = [
    { value: 'LOW', label: priorityLow },
    { value: 'MEDIUM', label: priorityMedium },
    { value: 'HIGH', label: priorityHigh },
    { value: 'URGENT', label: priorityUrgent },
  ];

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const togglePriority = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const toggleTag = (tagId: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({ status: [], priority: [], tags: [] });
  };

  const hasActiveFilters =
    filters.status.length > 0 || filters.priority.length > 0 || (filters.tags?.length || 0) > 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
            <Filter className="h-4 w-4" />
            {label}
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {filters.status.length + filters.priority.length + (filters.tags?.length || 0)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{statusLabel}</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.status.includes(option.value)}
              onCheckedChange={() => toggleStatus(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>{priorityLabel}</DropdownMenuLabel>
          {priorityOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.priority.includes(option.value)}
              onCheckedChange={() => togglePriority(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          {tags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{tagsLabel}</DropdownMenuLabel>
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={filters.tags?.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {clear}
        </button>
      )}
    </div>
  );
}
