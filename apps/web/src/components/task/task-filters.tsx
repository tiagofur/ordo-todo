"use client";

import { Filter, X } from "lucide-react";
import { useTags } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";
import { useTranslations } from "next-intl";

interface TaskFiltersProps {
  filters: {
    status: string[];
    priority: string[];
    tags?: string[];
  };
  onFiltersChange: (filters: { status: string[]; priority: string[]; tags?: string[] }) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const t = useTranslations('TaskFilters');
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: tags } = useTags(selectedWorkspaceId || "");

  const statusOptions = [
    { value: "TODO", label: t('status.TODO') },
    { value: "IN_PROGRESS", label: t('status.IN_PROGRESS') },
    { value: "COMPLETED", label: t('status.COMPLETED') },
    { value: "CANCELLED", label: t('status.CANCELLED') },
  ];

  const priorityOptions = [
    { value: "LOW", label: t('priority.LOW') },
    { value: "MEDIUM", label: t('priority.MEDIUM') },
    { value: "HIGH", label: t('priority.HIGH') },
    { value: "URGENT", label: t('priority.URGENT') },
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

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || (filters.tags?.length || 0) > 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
            <Filter className="h-4 w-4" />
            {t('label')}
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {filters.status.length + filters.priority.length + (filters.tags?.length || 0)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{t('status.label')}</DropdownMenuLabel>
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
          
          <DropdownMenuLabel>{t('priority.label')}</DropdownMenuLabel>
          {priorityOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.priority.includes(option.value)}
              onCheckedChange={() => togglePriority(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>{t('tags.label')}</DropdownMenuLabel>
          {tags?.map((tag: any) => (
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
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {t('clear')}
        </button>
      )}
    </div>
  );
}
