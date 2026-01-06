import { TaskTemplate } from "../model/task-template.entity";

/**
 * Repository interface for TaskTemplate persistence operations.
 */
export interface ITaskTemplateRepository {
    /**
     * Find a template by ID
     */
    findById(id: string): Promise<TaskTemplate | null>;

    /**
     * Find all templates in a workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<TaskTemplate[]>;

    /**
     * Create a new template
     */
    create(template: TaskTemplate): Promise<TaskTemplate>;

    /**
     * Update an existing template
     */
    update(template: TaskTemplate): Promise<TaskTemplate>;

    /**
     * Delete a template
     */
    delete(id: string): Promise<void>;
}
