import { X } from 'lucide-react';

export interface TagType {
  id?: string | number;
  name: string;
  color: string;
}

interface TagBadgeProps {
  tag: TagType;
  onRemove?: () => void;
  removable?: boolean;
  className?: string;
}

/**
 * TagBadge - Display a colored tag label
 * 
 * Platform-agnostic component for rendering tags.
 * 
 * @example
 * <TagBadge tag={{ name: "urgent", color: "#ef4444" }} />
 * <TagBadge tag={tag} removable onRemove={() => handleRemove(tag.id)} />
 */
export function TagBadge({ tag, onRemove, removable = false, className = '' }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      {tag.name}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label={`Remove ${tag.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
