export interface SelectableTask {
    id: string;
    title: string;
    status?: string;
}
interface TaskSelectorProps {
    /** ID of currently selected task */
    selectedTaskId?: string | null;
    /** Available tasks to choose from */
    tasks: SelectableTask[];
    /** Called when a task is selected */
    onSelect: (taskId: string | null) => void;
    /** Whether the selector is disabled */
    disabled?: boolean;
    /** Custom labels for i18n */
    labels?: {
        placeholder?: string;
        searchPlaceholder?: string;
        noTasks?: string;
        groupHeading?: string;
        noTaskAssigned?: string;
    };
    className?: string;
}
/**
 * TaskSelector - Platform-agnostic task selection dropdown
 *
 * Tasks are passed via props. Typically used with timer to select which task to track.
 *
 * @example
 * const { data: tasks } = useTasks();
 * const pendingTasks = tasks?.filter(t => t.status !== 'COMPLETED') || [];
 *
 * <TaskSelector
 *   tasks={pendingTasks}
 *   selectedTaskId={selectedTaskId}
 *   onSelect={setSelectedTaskId}
 *   labels={{ placeholder: t('placeholder') }}
 * />
 */
export declare function TaskSelector({ selectedTaskId, tasks, onSelect, disabled, labels, className, }: TaskSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-selector.d.ts.map