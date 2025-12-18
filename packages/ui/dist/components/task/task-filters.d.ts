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
export declare function TaskFilters({ filters, onFiltersChange, tags, labels, className, }: TaskFiltersProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-filters.d.ts.map