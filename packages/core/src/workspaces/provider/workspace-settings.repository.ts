import { WorkspaceSettings } from "../model/workspace-settings.entity";

/**
 * Repository interface for WorkspaceSettings entity persistence operations.
 *
 * This interface defines the contract for workspace settings data access, providing methods
 * for managing workspace-level preferences and configurations. Settings control workspace-wide
 * behaviors such as default task views, notification preferences, and collaboration features.
 *
 * @example
 * ```typescript
 * // Prisma implementation example
 * class PrismaWorkspaceSettingsRepository implements WorkspaceSettingsRepository {
 *   constructor(private prisma: PrismaClient) {}
 *
 *   async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null> {
 *     const data = await this.prisma.workspaceSettings.findUnique({
 *       where: { workspaceId }
 *     });
 *     return data ? new WorkspaceSettings(data) : null;
 *   }
 *
 *   async upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
 *     const data = await this.prisma.workspaceSettings.upsert({
 *       where: { workspaceId: settings.workspaceId },
 *       update: {
 *         defaultTaskView: settings.defaultTaskView,
 *         enableNotifications: settings.enableNotifications,
 *         allowGuestAccess: settings.allowGuestAccess
 *       },
 *       create: {
 *         id: settings.id,
 *         workspaceId: settings.workspaceId,
 *         defaultTaskView: settings.defaultTaskView,
 *         enableNotifications: settings.enableNotifications,
 *         allowGuestAccess: settings.allowGuestAccess,
 *         createdAt: settings.createdAt,
 *         updatedAt: settings.updatedAt
 *       }
 *     });
 *     return new WorkspaceSettings(data);
 *   }
 *
 *   // ... other methods
 * }
 * ```
 *
 * @see {@link ../model/workspace-settings.entity.ts | WorkspaceSettings entity}
 */
export interface WorkspaceSettingsRepository {
  /**
   * Retrieves settings for a specific workspace.
   *
   * Used for loading workspace configuration when a user opens a workspace or when
   * workspace-wide preferences need to be accessed. Returns null if settings haven't
   * been customized (default settings should be used).
   *
   * @param workspaceId - The workspace ID to find settings for
   * @returns Promise resolving to the workspace settings if found, null otherwise
   *
   * @example
   * ```typescript
   * const settings = await repository.findByWorkspaceId('workspace-123');
   * if (settings) {
   *   console.log(`Default task view: ${settings.defaultTaskView}`);
   *   console.log(`Notifications: ${settings.enableNotifications ? 'enabled' : 'disabled'}`);
   *   console.log(`Guest access: ${settings.allowGuestAccess ? 'allowed' : 'not allowed'}`);
   * } else {
   *   console.log('Using default workspace settings');
   * }
   * ```
   */
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettings | null>;

  /**
   * Creates or updates workspace settings.
   *
   * Used when saving workspace configuration changes. If settings don't exist for the
   * workspace, they are created. If they exist, they are updated (upsert operation).
   * This is the preferred method for persisting settings as it handles both cases.
   *
   * @param settings - The workspace settings entity to save (must be valid)
   * @returns Promise resolving to the saved or updated settings
   * @throws {Error} If settings validation fails or database constraint is violated
   *
   * @example
   * ```typescript
   * const settings = new WorkspaceSettings({
   *   workspaceId: 'workspace-123',
   *   defaultTaskView: 'BOARD',
   *   enableNotifications: true,
   *   allowGuestAccess: false,
   *   defaultRole: 'MEMBER',
   *   taskRetentionDays: 90
   * });
   *
   * const saved = await repository.upsert(settings);
   * console.log('Workspace settings saved');
   * console.log(`Default view: ${saved.defaultTaskView}`);
   * ```
   */
  upsert(settings: WorkspaceSettings): Promise<WorkspaceSettings>;

  /**
   * Deletes settings for a workspace.
   *
   * Used when resetting workspace settings to defaults or when deleting a workspace.
   * After deletion, the workspace will revert to using default settings.
   *
   * @param workspaceId - The workspace ID to delete settings for
   * @returns Promise resolving when the deletion is complete
   * @throws {NotFoundException} If the settings don't exist
   *
   * @example
   * ```typescript
   * // Reset workspace settings to defaults
   * await repository.delete('workspace-123');
   * console.log('Workspace settings reset to defaults');
   *
   * // On next access, default settings will be used
   * const settings = await repository.findByWorkspaceId('workspace-123');
   * if (!settings) {
   *   console.log('Using default workspace settings');
   * }
   * ```
   */
  delete(workspaceId: string): Promise<void>;
}
