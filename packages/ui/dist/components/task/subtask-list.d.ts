export interface Subtask {
    id: string | number;
    title: string;
    status: string;
    position?: number;
    parentTaskId?: string | number | null;
}
interface SubtaskListProps {
    /** Subtasks to display */
    subtasks: Subtask[];
    /** Whether create operation is pending */
    isCreating?: boolean;
    /** Whether update operation is pending */
    isUpdating?: boolean;
    /** Called when a subtask should be created */
    onCreate?: (title: string) => void;
    /** Called when a subtask status should be toggled */
    onToggleComplete?: (subtaskId: string, currentStatus: string) => void;
    /** Called when a subtask should be deleted */
    onDelete?: (subtaskId: string) => void;
    /** Called when a subtask should be updated */
    onUpdate?: (subtaskId: string, title: string) => void;
    /** Custom labels for i18n */
    labels?: {
        title?: string;
        add?: string;
        placeholder?: string;
        empty?: string;
        nested?: string;
        confirmDelete?: string;
        tooltipDrag?: string;
        tooltipEdit?: string;
        tooltipDelete?: string;
    };
    className?: string;
}
/**
 * SubtaskList - Platform-agnostic subtask management component
 *
 * All CRUD operations handled via props.
 *
 * @example
 * const createSubtask = useCreateSubtask();
 * const completeTask = useCompleteTask();
 *
 * <SubtaskList
 *   subtasks={task.subtasks || []}
 *   isCreating={createSubtask.isPending}
 *   onCreate={(title) => createSubtask.mutate({ parentTaskId, data: { title } })}
 *   onToggleComplete={(id, status) => {
 *     if (status === 'COMPLETED') updateTask.mutate({ taskId: id, data: { status: 'TODO' } });
 *     else completeTask.mutate(id);
 *   }}
 *   onDelete={(id) => deleteTask.mutate(id)}
 *   onUpdate={(id, title) => updateTask.mutate({ taskId: id, data: { title } })}
 *   labels={{ title: t('title'), add: t('add') }}
 * />
 */
export declare function SubtaskList({ subtasks, isCreating, isUpdating, onCreate, onToggleComplete, onDelete, onUpdate, labels, className, }: SubtaskListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=subtask-list.d.ts.map