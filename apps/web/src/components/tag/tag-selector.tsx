'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';
import { TagBadge, type TagType } from './tag-badge.js';

interface TagSelectorProps {
  /** Currently selected tags */
  selectedTags: TagType[];
  /** All available tags to choose from */
  availableTags: TagType[];
  /** Whether tags are loading */
  isLoading?: boolean;
  /** Called when a tag is toggled (added/removed) */
  onTagToggle: (tag: TagType, isSelected: boolean) => void;
  /** Called when a tag is removed directly from badge */
  onTagRemove?: (tag: TagType) => void;
  /** Whether tag operations are in progress */
  isPending?: boolean;
  /** Custom labels for i18n */
  labels?: {
    addTag?: string;
    loading?: string;
    noTags?: string;
  };
  className?: string;
}

/**
 * TagSelector - Platform-agnostic tag selection component
 * 
 * This component is designed to work in both web and desktop environments.
 * Data fetching and mutations are handled externally via props.
 * 
 * @example
 * // In web app
 * const { data: tags, isLoading } = useTags(workspaceId);
 * const assignTag = useAssignTagToTask();
 * 
 * <TagSelector
 *   selectedTags={task.tags}
 *   availableTags={tags ?? []}
 *   isLoading={isLoading}
 *   onTagToggle={(tag, isSelected) => {
 *     if (isSelected) {
 *       removeTag.mutate({ tagId: tag.id, taskId });
 *     } else {
 *       assignTag.mutate({ tagId: tag.id, taskId });
 *     }
 *   }}
 *   labels={{ addTag: t('addTag'), loading: t('loading') }}
 * />
 */
export function TagSelector({
  selectedTags = [],
  availableTags = [],
  isLoading = false,
  onTagToggle,
  onTagRemove,
  isPending = false,
  labels = {},
  className = '',
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  const {
    addTag = 'Add tag',
    loading = 'Loading...',
    noTags = 'No tags available',
  } = labels;

  const isTagSelected = (tagId: string | number | undefined) => {
    return selectedTags.some((t) => t.id === tagId);
  };

  const handleToggleTag = (tag: TagType) => {
    if (!tag.id) return;
    const selected = isTagSelected(tag.id);
    onTagToggle(tag, selected);
  };

  const handleRemoveTag = (tag: TagType) => {
    if (onTagRemove) {
      onTagRemove(tag);
    } else if (tag.id) {
      onTagToggle(tag, true);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          removable
          onRemove={() => handleRemoveTag(tag)}
        />
      ))}

      {/* Add Tag Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs font-medium hover:bg-accent transition-colors">
            <Plus className="h-3 w-3" />
            {addTag}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">{loading}</div>
            ) : availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag)}
                  disabled={isPending}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                  {isTagSelected(tag.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                {noTags}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
