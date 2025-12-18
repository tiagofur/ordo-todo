interface TaskFormProps {
    /** Project ID to create task in */
    projectId?: string;
    /** Whether task creation is pending */
    isPending?: boolean;
    /** Called when form is submitted */
    onSubmit?: (data: {
        title: string;
        projectId: string;
    }) => void;
    /** Custom labels for i18n */
    labels?: {
        label?: string;
        placeholder?: string;
        add?: string;
        adding?: string;
    };
    className?: string;
}
/**
 * TaskForm - Simple inline task creation form
 *
 * @example
 * const createTask = useCreateTask();
 *
 * <TaskForm
 *   projectId={projectId}
 *   isPending={createTask.isPending}
 *   onSubmit={(data) => {
 *     createTask.mutate(data, {
 *       onSuccess: () => notify.success('Created!'),
 *       onError: (e) => notify.error(e.message),
 *     });
 *   }}
 *   labels={{ label: t('label'), placeholder: t('placeholder') }}
 * />
 */
export declare function TaskForm({ projectId, isPending, onSubmit, labels, className, }: TaskFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-form.d.ts.map