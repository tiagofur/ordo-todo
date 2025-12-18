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
export declare function TagBadge({ tag, onRemove, removable, className }: TagBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=tag-badge.d.ts.map