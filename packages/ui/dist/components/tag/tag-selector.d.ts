import { type TagType } from './tag-badge.js';
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
export declare function TagSelector({ selectedTags, availableTags, isLoading, onTagToggle, onTagRemove, isPending, labels, className, }: TagSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=tag-selector.d.ts.map