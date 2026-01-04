import { Workflow } from "../model/workflow.entity";

/**
 * Repository interface for Workflow entity persistence operations.
 *
 * This interface defines the contract for Workflow data access, providing CRUD operations
 * for workflows within workspaces. Workflows are organizational units that group projects
 * together (e.g., "Personal", "Work", "Side Projects").
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkflowRepository implements WorkflowRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async save(workflow: Workflow): Promise<void> {
 *     await this.prisma.workflow.create({
 *       data: {
 *         id: workflow.id,
 *         name: workflow.name,
 *         slug: workflow.slug,
 *         workspaceId: workflow.workspaceId,
 *         createdAt: workflow.createdAt,
 *         updatedAt: workflow.updatedAt
 *       }
 *     });
 *   }
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<Workflow[]> {
 *     const workflows = await this.prisma.workflow.findMany({
 *       where: { workspaceId },
 *       orderBy: { createdAt: 'asc' }
 *     });
 *     return workflows.map(w => new Workflow(w));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workflow.entity.ts | Workflow entity}
 */
export interface WorkflowRepository {
  /**
   * Saves a new workflow to the repository.
   *
   * Used when creating a new workflow through the UI or API.
   * The workflow should have all required fields populated before calling this method.
   *
   * @param workflow - The workflow entity to save (must be valid)
   * @returns Promise resolving when the save is complete
   * @throws {Error} If workflow validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const workflow = new Workflow({
   *   name: 'Work Projects',
   *   slug: 'work-projects',
   *   workspaceId: 'workspace-123'
   * });
   *
   * await repository.save(workflow);
   * console.log('Workflow created successfully');
   * ```
   */
  save(workflow: Workflow): Promise<void>;

  /**
   * Finds a workflow by its unique ID.
   *
   * Used for fetching workflow details when the ID is known, such as from a URL parameter
   * or after creating/updating a workflow.
   *
   * @param id - The unique identifier of the workflow
   * @returns Promise resolving to the workflow if found, null otherwise
   *
   * @example
   * ```typescript
   * const workflow = await repository.findById('workflow-abc-123');
   * if (workflow) {
   *   console.log(`Found workflow: ${workflow.name}`);
   * } else {
   *   console.log('Workflow not found');
   * }
   * ```
   */
  findById(id: string): Promise<Workflow | null>;

  /**
   * Finds all workflows that belong to a specific workspace.
   *
   * Used for displaying the workflow list in a workspace, such as in the sidebar
   * or workflow selector. Returns workflows in creation order.
   *
   * @param workspaceId - The workspace ID to filter workflows by
   * @returns Promise resolving to an array of workflows in the workspace (empty array if none found)
   *
   * @example
   * ```typescript
   * const workflows = await repository.findByWorkspaceId('workspace-123');
   * console.log(`Found ${workflows.length} workflows in workspace`);
   *
   * // Render workflow navigation
   * workflows.forEach(workflow => {
   *   console.log(`📁 ${workflow.name}`);
   *   // Each workflow contains multiple projects
   * });
   * ```
   */
  findByWorkspaceId(workspaceId: string): Promise<Workflow[]>;

  /**
   * Updates an existing workflow in the repository.
   *
   * Used when modifying workflow details such as name or slug.
   * The workflow entity should already exist and be valid before calling this method.
   *
   * @param workflow - The workflow entity with updated fields
   * @returns Promise resolving when the update is complete
   * @throws {NotFoundException} If the workflow doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('workflow-123');
   * if (existing) {
   *   const updated = existing.clone({
   *     name: 'Client Projects (Updated)',
   *     slug: 'client-projects-updated'
   *   });
   *   await repository.update(updated);
   *   console.log('Workflow updated successfully');
   * }
   * ```
   */
  update(workflow: Workflow): Promise<void>;

  /**
   * Deletes a workflow from the repository.
   *
   * WARNING: This will also delete all projects within the workflow.
   * Consider moving projects to another workflow or soft-deletion if you want to keep them.
   *
   * @param id - The unique identifier of the workflow to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the workflow doesn't exist
   *
   * @example
   * ```typescript
   * await repository.delete('workflow-123');
   * console.log('Workflow deleted (and all its projects)');
   * ```
   */
  delete(id: string): Promise<void>;
}
