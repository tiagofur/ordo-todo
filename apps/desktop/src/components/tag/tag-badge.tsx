import { X } from "lucide-react";

interface TagBadgeProps {
  tag: {
    id?: string | number;
    name: string;
    color: string;
  };
  onRemove?: () => void;
  removable?: boolean;
}

export function TagBadge({ tag, onRemove, removable = false }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      {tag.name}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
