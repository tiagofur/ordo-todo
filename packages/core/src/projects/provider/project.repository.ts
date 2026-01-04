import { Project } from "../model/project.entity";

/**
 * Repository interface for Project entity persistence operations.
 *
 * This interface defines the contract for Project data access, providing CRUD operations
 * plus specialized methods for soft-deletion, slug-based lookup, and recovery of deleted projects.
 * Implementations should handle database-specific details while maintaining this clean interface.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaProjectRepository implements ProjectRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(project: Project): Promise<Project> {
 *     const data = await this.prisma.project.create({
 *       data: {
 *         id: project.id,
 *         name: project.name,
 *         slug: project.slug,
 *         description: project.description,
 *         color: project.color,
 *         icon: project.icon,
 *         workflowId: project.workflowId,
 *         status: project.status,
 *         startDate: project.startDate,
 *         endDate: project.endDate,
 *         workspaceId: project.workspaceId,
 *         ownerId: project.ownerId,
 *         createdAt: project.createdAt,
 *         updatedAt: project.updatedAt,
 *       }
 *     });
 *     return new Project(data);
 *   }
 *
 *   async findById(id: string): Promise<Project | null> {
 *     const data = await this.prisma.project.findUnique({ where: { id } });
 *     return data ? new Project(data) : null;
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/project.entity.ts | Project entity}
 */
export interface ProjectRepository {
  /**
   * Creates a new project in the repository.
   *
   * Used when creating a new project through the UI or API.
   * The project should have all required fields populated before calling this method.
   *
   * @param project - The project entity to create (must be valid)
   * @returns Promise resolving to the created project with any database-generated fields populated
   * @throws {Error} If project validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const project = new Project({
   *   name: 'Website Redesign',
   *   slug: 'website-redesign',
   *   workspaceId: 'workspace-123',
   *   ownerId: 'user-456',
   *   status: 'ACTIVE'
   * });
   *
   * const created = await repository.create(project);
   * console.log(`Project created with ID: ${created.id}`);
   * ```
   */
  create(project: Project): Promise<Project>;

  /**
   * Finds a project by its unique ID.
   *
   * Used for fetching project details when the ID is known, such as from a URL parameter
   * or after creating/updating a project.
   *
   * @param id - The unique identifier of the project
   * @returns Promise resolving to the project if found, null otherwise
   *
   * @example
   * ```typescript
   * const project = await repository.findById('proj-123');
   * if (project) {
   *   console.log(`Found project: ${project.name}`);
   * } else {
   *   console.log('Project not found');
   * }
   * ```
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Finds a project by its slug within a specific workspace.
   *
   * Used for human-readable project URLs, such as `/workflows/:workflowSlug/projects/:projectSlug`.
   * Slug lookups are scoped to a workspace to allow duplicate slugs across different workspaces.
   *
   * @param slug - The URL-friendly slug identifier
   * @param workspaceId - The workspace ID to scope the search to
   * @returns Promise resolving to the project if found, null otherwise
   * @throws {Error} If workspaceId is not provided
   *
   * @example
   * ```typescript
   * const project = await repository.findBySlug('website-redesign', 'workspace-123');
   * // Returns the project with that slug in the specified workspace
   * ```
   */
  findBySlug(slug: string, workspaceId: string): Promise<Project | null>;

  /**
   * Finds all projects that belong to a specific workspace.
   *
   * Used for displaying the project list within a workflow or workspace view.
   * Returns projects in the order specified by the workspace (typically by position/createdAt).
   *
   * @param workspaceId - The workspace ID to filter projects by
   * @returns Promise resolving to an array of projects in the workspace (empty array if none found)
   *
   * @example
   * ```typescript
   * const projects = await repository.findByWorkspaceId('workflow-123');
   * console.log(`Found ${projects.length} projects in workflow`);
   *
   * // Render project list
   * projects.forEach(project => {
   *   console.log(`- ${project.name} (${project.status})`);
   * });
   * ```
   */
  findByWorkspaceId(workspaceId: string): Promise<Project[]>;

  /**
   * Finds all projects owned by a specific user across all workspaces.
   *
   * Used for dashboard widgets showing "My Projects" or for user profile pages.
   * Includes projects from all workspaces where the user is the owner.
   *
   * @param userId - The user ID to filter projects by
   * @returns Promise resolving to an array of projects owned by the user (empty array if none found)
   *
   * @example
   * ```typescript
   * const projects = await repository.findAllByUserId('user-456');
   * console.log(`User owns ${projects.length} projects`);
   *
   * // Group by workspace
   * const byWorkspace = projects.reduce((acc, project) => {
   *   (acc[project.workflowId] ||= []).push(project);
   *   return acc;
   * }, {} as Record<string, Project[]>);
   * ```
   */
  findAllByUserId(userId: string): Promise<Project[]>;

  /**
   * Updates an existing project in the repository.
   *
   * Used when modifying project details such as name, description, status, or dates.
   * The project entity should already exist and be valid before calling this method.
   *
   * @param project - The project entity with updated fields
   * @returns Promise resolving to the updated project
   * @throws {NotFoundException} If the project doesn't exist
   * @throws {Error} If validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const existing = await repository.findById('proj-123');
   * if (existing) {
   *   const updated = existing.clone({
   *     status: 'COMPLETED',
   *     endDate: new Date()
   *   });
   *   await repository.update(updated);
   * }
   * ```
   */
  update(project: Project): Promise<Project>;

  /**
   * Permanently deletes a project from the repository.
   *
   * WARNING: This operation is irreversible. All associated tasks, comments, and attachments
   * will be deleted. Consider using softDelete() instead for safer deletion with recovery.
   *
   * @param id - The unique identifier of the project to delete
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the project doesn't exist
   *
   * @example
   * ```typescript
   * // ⚠️ Use with caution - permanent deletion
   * await repository.delete('proj-123');
   * console.log('Project permanently deleted');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Soft deletes a project by marking it as deleted without removing it from the database.
   *
   * This is the preferred deletion method as it allows for recovery and maintains data integrity.
   * The project won't appear in normal queries but can be restored if needed.
   *
   * @param id - The unique identifier of the project to soft delete
   * @returns Promise resolving when the soft deletion is complete
   * @throws {NotFoundException} If the project doesn't exist
   *
   * @example
   * ```typescript
   * // Soft delete (recommended)
   * await repository.softDelete('proj-123');
   * console.log('Project moved to trash');
   *
   * // Later restore if needed
   * await repository.restore('proj-123');
   * ```
   */
  softDelete(id: string): Promise<void>;

  /**
   * Restores a previously soft-deleted project.
   *
   * Used when a user wants to recover a project from the trash/bin.
   * The project will appear in normal queries again after restoration.
   *
   * @param id - The unique identifier of the project to restore
   * @returns Promise resolving when the restoration is complete
   * @throws {NotFoundException} If the project doesn't exist or wasn't deleted
   *
   * @example
   * ```typescript
   * await repository.restore('proj-123');
   * console.log('Project restored from trash');
   * ```
   */
  restore(id: string): Promise<void>;

  /**
   * Permanently deletes a soft-deleted project from the repository.
   *
   * This operation is irreversible and should only be used after a project has been soft deleted
   * and the user confirms they want to permanently remove it (e.g., "Empty Trash" action).
   *
   * @param id - The unique identifier of the project to permanently delete
   * @returns Promise resolving when the permanent deletion is complete
   * @throws {NotFoundException} If the project doesn't exist
   *
   * @example
   * ```typescript
   * // Empty trash - permanently delete all soft-deleted projects
   * const deletedProjects = await repository.findDeleted('workspace-123');
   * for (const project of deletedProjects) {
   *   await repository.permanentDelete(project.id);
   * }
   * ```
   */
  permanentDelete(id: string): Promise<void>;

  /**
   * Finds all soft-deleted projects in a workspace.
   *
   * Used for displaying the trash/bin view where users can see and restore deleted projects.
   * Only returns projects that have been soft deleted, not permanently deleted ones.
   *
   * @param workspaceId - The workspace ID to filter deleted projects by
   * @returns Promise resolving to an array of soft-deleted projects (empty array if none found)
   *
   * @example
   * ```typescript
   * const deletedProjects = await repository.findDeleted('workspace-123');
   * console.log(`Found ${deletedProjects.length} deleted projects`);
   *
   * // Show trash UI with restore options
   * deletedProjects.forEach(project => {
   *   console.log(`${project.name} - deleted on ${project.deletedAt}`);
   * });
   * ```
   */
  findDeleted(workspaceId: string): Promise<Project[]>;
}
