import { Tag } from "../model/tag.entity";

/**
 * Repository interface for Tag entity persistence operations.
 *
 * This interface defines the contract for Tag data access, providing CRUD operations
 * plus specialized methods for managing tag-task relationships. Tags are used for
 * categorizing and organizing tasks within workspaces.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaTagRepository implements TagRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async create(tag: Tag): Promise<Tag> {
 *     const data = await this.prisma.tag.create({
 *       data: {
 *         id: tag.id,
 *         name: tag.name,
 *         color: tag.color,
 *         icon: tag.icon,
 *         workspaceId: tag.workspaceId,
 *         createdAt: tag.createdAt,
 *         updatedAt: tag.updatedAt,
 *       }
 *     });
 *     return new Tag(data);
 *   }
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<Tag[]> {
 *     const tags = await this.prisma.tag.findMany({
 *       where: { workspaceId },
 *       orderBy: { name: 'asc' }
 *     });
 *     return tags.map(tag => new Tag(tag));
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/tag.entity.ts | Tag entity}
 */
export interface TagRepository {
    /**
     * Creates a new tag in the repository.
     *
     * Used when creating a new tag through the UI or API.
     * The tag should have all required fields populated before calling this method.
     *
     * @param tag - The tag entity to create (must be valid)
     * @returns Promise resolving to the created tag with any database-generated fields populated
     * @throws {Error} If tag validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const tag = new Tag({
     *   name: 'urgent',
     *   color: '#ef4444',
     *   icon: 'alert-circle',
     *   workspaceId: 'workspace-123'
     * });
     *
     * const created = await repository.create(tag);
     * console.log(`Tag created with ID: ${created.id}`);
     * ```
     */
    create(tag: Tag): Promise<Tag>;

    /**
     * Updates an existing tag in the repository.
     *
     * Used when modifying tag details such as name, color, or icon.
     * The tag entity should already exist and be valid before calling this method.
     *
     * @param tag - The tag entity with updated fields
     * @returns Promise resolving to the updated tag
     * @throws {NotFoundException} If the tag doesn't exist
     * @throws {Error} If validation fails or database constraint is violated
     *
     * @example
     * ```typescript
     * const existing = await repository.findById('tag-123');
     * if (existing) {
     *   const updated = existing.clone({
     *     name: 'critical',
     *     color: '#dc2626'
     *   });
     *   await repository.update(updated);
     * }
     * ```
     */
    update(tag: Tag): Promise<Tag>;

    /**
     * Finds a tag by its unique ID.
     *
     * Used for fetching tag details when the ID is known, such as from a URL parameter
     * or after creating/updating a tag.
     *
     * @param id - The unique identifier of the tag
     * @returns Promise resolving to the tag if found, null otherwise
     *
     * @example
     * ```typescript
     * const tag = await repository.findById('tag-123');
     * if (tag) {
     *   console.log(`Found tag: ${tag.name}`);
     * } else {
     *   console.log('Tag not found');
     * }
     * ```
     */
    findById(id: string): Promise<Tag | null>;

    /**
     * Finds all tags that belong to a specific workspace.
     *
     * Used for displaying the tag list in a workspace, such as in tag selectors or filters.
     * Returns tags ordered alphabetically by name for easy browsing.
     *
     * @param workspaceId - The workspace ID to filter tags by
     * @returns Promise resolving to an array of tags in the workspace (empty array if none found)
     *
     * @example
     * ```typescript
     * const tags = await repository.findByWorkspaceId('workspace-123');
     * console.log(`Found ${tags.length} tags in workspace`);
     *
     * // Render tag selector
     * tags.forEach(tag => {
     *   console.log(`${tag.icon} ${tag.name}`);
     * });
     * ```
     */
    findByWorkspaceId(workspaceId: string): Promise<Tag[]>;

    /**
     * Deletes a tag from the repository.
     *
     * WARNING: This will also remove the tag from all tasks that have it assigned.
     * The tag itself is permanently deleted and cannot be recovered.
     *
     * @param id - The unique identifier of the tag to delete
     * @returns Promise resolving when the deletion is complete
     * @throws {NotFoundException} If the tag doesn't exist
     *
     * @example
     * ```typescript
     * await repository.delete('tag-123');
     * console.log('Tag deleted (also removed from all tasks)');
     * ```
     */
    delete(id: string): Promise<void>;

    /**
     * Assigns a tag to a task.
     *
     * Used when a user adds a tag to a task through the UI. This creates a many-to-many
     * relationship between the tag and the task. A task can have multiple tags, and a tag
     * can be assigned to multiple tasks.
     *
     * @param tagId - The unique identifier of the tag to assign
     * @param taskId - The unique identifier of the task to assign the tag to
     * @returns Promise resolving when the assignment is complete
     * @throws {NotFoundException} If the tag or task doesn't exist
     * @throws {Error} If the relationship already exists
     *
     * @example
     * ```typescript
     * // User clicks "Add Tag" on a task
     * await repository.assignToTask('tag-urgent', 'task-456');
     * console.log('Tag assigned to task');
     *
     * // Verify assignment
     * const taskTags = await repository.findByTaskId('task-456');
     * console.log(`Task now has ${taskTags.length} tags`);
     * ```
     */
    assignToTask(tagId: string, taskId: string): Promise<void>;

    /**
     * Removes a tag from a task.
     *
     * Used when a user removes a tag from a task through the UI. This deletes the
     * many-to-many relationship between the tag and the task, but does not delete
     * the tag itself.
     *
     * @param tagId - The unique identifier of the tag to remove
     * @param taskId - The unique identifier of the task to remove the tag from
     * @returns Promise resolving when the removal is complete
     * @throws {NotFoundException} If the relationship doesn't exist
     *
     * @example
     * ```typescript
     * // User clicks "Remove Tag" on a task
     * await repository.removeFromTask('tag-urgent', 'task-456');
     * console.log('Tag removed from task');
     * ```
     */
    removeFromTask(tagId: string, taskId: string): Promise<void>;

    /**
     * Finds all tags assigned to a specific task.
     *
     * Used for displaying the tags on a task card or in the task detail view.
     * Returns only the tags that are actually assigned to the task, not all available tags.
     *
     * @param taskId - The unique identifier of the task to find tags for
     * @returns Promise resolving to an array of tags assigned to the task (empty array if none found)
     *
     * @example
     * ```typescript
     * const tags = await repository.findByTaskId('task-456');
     * console.log(`Task has ${tags.length} tags assigned`);
     *
     * // Display tags on task card
     * tags.forEach(tag => {
     *   console.log(`<Badge color={tag.color}>{tag.name}</Badge>`);
     * });
     * ```
     */
    findByTaskId(taskId: string): Promise<Tag[]>;
}
