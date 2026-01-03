import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  WorkspaceRepository,
  UserRepository,
  WorkspaceSettingsRepository,
  WorkspaceAuditLogRepository,
  WorkflowRepository,
  HashService,
} from '@ordo-todo/core';
import {
  CreateWorkspaceUseCase,
  AddMemberToWorkspaceUseCase,
  RemoveMemberFromWorkspaceUseCase,
  SoftDeleteWorkspaceUseCase,
  RestoreWorkspaceUseCase,
  PermanentDeleteWorkspaceUseCase,
  GetDeletedWorkspacesUseCase,
  ArchiveWorkspaceUseCase,
  InviteMemberUseCase,
  AcceptInvitationUseCase,
  UpdateWorkspaceSettingsUseCase,
  GetWorkspaceSettingsUseCase,
  CreateAuditLogUseCase,
  GetWorkspaceAuditLogsUseCase,
  CreateWorkflowUseCase,
} from '@ordo-todo/core';
import type { WorkspaceInvitationRepository } from '@ordo-todo/core';
import type { Workspace } from '@ordo-todo/core';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject('WorkspaceRepository')
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject('WorkspaceInvitationRepository')
    private readonly invitationRepository: WorkspaceInvitationRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('WorkspaceSettingsRepository')
    private readonly settingsRepository: WorkspaceSettingsRepository,
    @Inject('WorkspaceAuditLogRepository')
    private readonly auditLogRepository: WorkspaceAuditLogRepository,
    @Inject('WorkflowRepository')
    private readonly workflowRepository: WorkflowRepository,
    @Inject('HashService')
    private readonly hashService: HashService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Creates a new workspace with the user as owner
   *
   * The workspace is created with a default workflow named "General".
   * The creator is automatically added as a WorkspaceMember with OWNER role
   * within the same transaction (handled by the repository).
   *
   * @param createWorkspaceDto - Workspace creation data
   * @param userId - ID of the user creating the workspace
   * @returns The created workspace
   * @throws ForbiddenException if user already has a workspace with the same slug
   */
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    // Get user to retrieve username for slug generation
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const username = user.props.username;

    // The CreateWorkspaceUseCase will generate slug automatically as username/workspace-name
    const createWorkspaceUseCase = new CreateWorkspaceUseCase(
      this.workspaceRepository,
      username,
    );

    const workspace = await createWorkspaceUseCase.execute(
      {
        ...createWorkspaceDto,
        tier: 'FREE',
        color: createWorkspaceDto.color ?? '#2563EB',
        ownerId: userId,
      },
      username,
    );

    // Note: The workspace repository already adds the creator as a WorkspaceMember with OWNER role
    // in the same transaction during workspace creation (see PrismaWorkspaceRepository.create)
    // So we don't need to call AddMemberToWorkspaceUseCase here

    // Create default workflow
    const createWorkflowUseCase = new CreateWorkflowUseCase(
      this.workflowRepository,
    );
    await createWorkflowUseCase.execute({
      name: 'General',
      workspaceId: workspace.id as string,
      description: 'Default workflow for general projects',
    });

    // Log workspace creation
    await this.createAuditLog(
      workspace.id as string,
      'WORKSPACE_CREATED',
      userId,
      {
        name: workspace.props.name,
        type: workspace.props.type,
      },
    );

    return workspace.props;
  }

  /**
   * Lists all workspaces accessible to the user
   *
   * Returns workspaces where the user is either the owner or a member.
   * Includes statistics like project count, member count, and task count.
   *
   * @param userId - ID of the user
   * @returns Array of workspaces with statistics
   */
  async findAll(userId: string) {
    const workspaces = await this.workspaceRepository.findByUserId(userId);

    const results = await Promise.all(
      workspaces.map(async (workspace) => {
        const owner = await this.userRepository.findById(
          workspace.props.ownerId as string,
        );

        return {
          id: workspace.id,
          name: workspace.props.name,
          slug: workspace.props.slug,
          description: workspace.props.description,
          type: workspace.props.type,
          tier: workspace.props.tier,
          color: workspace.props.color,
          icon: workspace.props.icon,
          ownerId: workspace.props.ownerId,
          owner: owner
            ? {
                id: owner.id,
                username: owner.props.username,
                name: owner.props.name,
                email: owner.props.email,
              }
            : null,
          isArchived: workspace.props.isArchived,
          createdAt: workspace.props.createdAt,
          updatedAt: workspace.props.updatedAt,
          stats: workspace.props.stats,
        };
      }),
    );

    return results;
  }

  /**
   * Gets a workspace by ID
   *
   * @param id - Workspace ID
   * @returns Workspace data
   * @throws NotFoundException if workspace not found or deleted
   */
  async findOne(id: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace || workspace.props.isDeleted) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace.props;
  }

  async findByUserAndSlug(username: string, slug: string) {
    // Fetch user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch workspace by ownerId and slug
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        ownerId_slug: {
          ownerId: user.id,
          slug,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
        projects: {
          select: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!workspace || workspace.isDeleted) {
      throw new NotFoundException('Workspace not found');
    }

    // Format stats manually as in repository (simplified)
    const taskCount = workspace.projects.reduce(
      (acc, p) => acc + p._count.tasks,
      0,
    );

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      type: workspace.type,
      tier: workspace.tier,
      color: workspace.color,
      icon: workspace.icon,
      ownerId: workspace.ownerId,
      owner: workspace.owner,
      isArchived: workspace.isArchived,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      stats: {
        projectCount: workspace._count.projects,
        memberCount: workspace._count.members,
        taskCount: taskCount,
      },
    };
  }

  async findBySlug(slug: string) {
    const workspace = await this.workspaceRepository.findBySlug(slug);
    if (!workspace || workspace.props.isDeleted) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace.props;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace || workspace.props.isDeleted) {
      throw new NotFoundException('Workspace not found');
    }

    const updatedWorkspace = workspace.update(updateWorkspaceDto);
    await this.workspaceRepository.update(updatedWorkspace);

    // Log workspace update
    await this.createAuditLog(id, 'WORKSPACE_UPDATED', undefined, {
      changes: updateWorkspaceDto,
    });

    return updatedWorkspace.props;
  }

  async remove(id: string, userId: string) {
    const softDeleteUseCase = new SoftDeleteWorkspaceUseCase(
      this.workspaceRepository,
    );

    try {
      await softDeleteUseCase.execute(id, userId);

      // Log workspace deletion
      await this.createAuditLog(id, 'WORKSPACE_DELETED', userId);

      return { success: true };
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      if (error.message === 'Unauthorized') {
        throw new ForbiddenException(
          'No tienes permisos para eliminar este workspace',
        );
      }
      throw error;
    }
  }

  async getDeleted(userId: string) {
    const getDeletedUseCase = new GetDeletedWorkspacesUseCase(
      this.workspaceRepository,
    );

    try {
      const workspaces = await getDeletedUseCase.execute(userId);
      return workspaces.map((w: Workspace) => ({
        ...w.props,
        id: w.id,
      }));
    } catch (error) {
      throw error;
    }
  }

  async restore(id: string, userId: string) {
    const restoreUseCase = new RestoreWorkspaceUseCase(
      this.workspaceRepository,
    );

    try {
      await restoreUseCase.execute(id, userId);

      // Log workspace restoration
      await this.createAuditLog(id, 'WORKSPACE_RESTORED', userId);

      return { success: true };
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      if (error.message === 'Unauthorized') {
        throw new ForbiddenException(
          'No tienes permisos para restaurar este workspace',
        );
      }
      throw error;
    }
  }

  async permanentDelete(id: string, userId: string) {
    const permanentDeleteUseCase = new PermanentDeleteWorkspaceUseCase(
      this.workspaceRepository,
    );

    try {
      await permanentDeleteUseCase.execute(id, userId);

      // Log permanent deletion
      await this.createAuditLog(id, 'WORKSPACE_PERMANENTLY_DELETED', userId);

      return { success: true };
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      if (error.message === 'Unauthorized') {
        throw new ForbiddenException(
          'No tienes permisos para eliminar este workspace permanentemente',
        );
      }
      if (error.message === 'Workspace must be soft deleted first') {
        throw new ForbiddenException(
          'El workspace debe ser eliminado temporalmente primero',
        );
      }
      throw error;
    }
  }

  async archive(id: string, userId: string) {
    const archiveUseCase = new ArchiveWorkspaceUseCase(
      this.workspaceRepository,
    );

    try {
      const workspace = await archiveUseCase.execute(id, userId);

      // Log workspace archive
      await this.createAuditLog(id, 'WORKSPACE_ARCHIVED', userId);

      return workspace.props;
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      if (error.message === 'Unauthorized') {
        throw new ForbiddenException(
          'No tienes permisos para archivar este workspace',
        );
      }
      throw error;
    }
  }

  /**
   * Adds a member to a workspace
   *
   * This operation is idempotent - if the user is already a member,
   * their existing membership is returned without changes.
   *
   * @param workspaceId - ID of the workspace
   * @param addMemberDto - Member data (userId and optional role)
   * @returns The created or existing workspace member
   */
  async addMember(workspaceId: string, addMemberDto: AddMemberDto) {
    const addMemberToWorkspaceUseCase = new AddMemberToWorkspaceUseCase(
      this.workspaceRepository,
    );
    const member = await addMemberToWorkspaceUseCase.execute(
      workspaceId,
      addMemberDto.userId,
      addMemberDto.role ?? 'MEMBER',
    );

    // Log member addition
    await this.createAuditLog(workspaceId, 'MEMBER_ADDED', undefined, {
      userId: addMemberDto.userId,
      role: addMemberDto.role ?? 'MEMBER',
    });

    return member.props;
  }

  /**
   * Removes a member from a workspace
   *
   * The workspace owner cannot be removed.
   *
   * @param workspaceId - ID of the workspace
   * @param userId - ID of the user to remove
   * @returns Success indicator
   * @throws Error if workspace not found, user not a member, or attempting to remove owner
   */
  async removeMember(workspaceId: string, userId: string) {
    const removeMemberFromWorkspaceUseCase =
      new RemoveMemberFromWorkspaceUseCase(this.workspaceRepository);
    await removeMemberFromWorkspaceUseCase.execute(workspaceId, userId);

    // Log member removal
    await this.createAuditLog(workspaceId, 'MEMBER_REMOVED', undefined, {
      userId,
    });

    return { success: true };
  }

  /**
   * Creates an invitation for a user to join a workspace
   *
   * Generates a secure token, hashes it, and stores the invitation.
   * The plain token is returned for development/testing (in production, this would be sent via email).
   *
   * @param workspaceId - ID of the workspace
   * @param userId - ID of the user creating the invitation
   * @param email - Email address of the user to invite
   * @param role - Role to assign when invitation is accepted
   * @returns Invitation data with dev token (for testing only)
   * @throws NotFoundException if workspace not found
   */
  async inviteMember(
    workspaceId: string,
    userId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' | 'VIEWER',
  ) {
    const inviteMemberUseCase = new InviteMemberUseCase(
      this.workspaceRepository,
      this.invitationRepository,
      this.hashService,
    );

    try {
      const result = await inviteMemberUseCase.execute(
        workspaceId,
        email,
        role,
        userId,
      );

      // Log member invitation
      await this.createAuditLog(workspaceId, 'MEMBER_INVITED', userId, {
        email,
        role,
      });

      // In a real app, we would send the email here using result.token
      return {
        success: true,
        message: 'Invitation created',
        invitationId: result.invitation.id,
        // Returning token for dev purposes/MVP so we can test without email service
        // IMPORTANT: The token is hashed in the database, this plain token should only be sent via email
        devToken: result.token,
      };
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Accepts a workspace invitation
   *
   * Validates the token, adds the user as a workspace member with the invited role,
   * and marks the invitation as accepted. This operation is idempotent - if the user
   * is already a member, the invitation is simply marked as accepted.
   *
   * @param token - Plain invitation token (from email)
   * @param userId - ID of the user accepting the invitation
   * @returns Success indicator
   * @throws NotFoundException if token is invalid or invitation expired
   */
  async acceptInvitation(token: string, userId: string) {
    const acceptInvitationUseCase = new AcceptInvitationUseCase(
      this.workspaceRepository,
      this.invitationRepository,
      this.hashService,
    );

    try {
      // Get all pending invitations to find the matching one
      // We can't use findByToken directly because tokens are now hashed
      const pendingInvitations =
        await this.invitationRepository.findPendingInvitations();

      let matchedInvitation:
        | Awaited<
            ReturnType<typeof this.invitationRepository.findPendingInvitations>
          >[number]
        | null = null;
      for (const invitation of pendingInvitations) {
        const isValid = await this.hashService.compare(
          token,
          invitation.props.tokenHash,
        );
        if (isValid) {
          matchedInvitation = invitation;
          break;
        }
      }

      if (!matchedInvitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      const workspaceId = matchedInvitation.props.workspaceId;

      await acceptInvitationUseCase.execute(token, userId);

      // Log invitation acceptance
      await this.createAuditLog(workspaceId, 'INVITATION_ACCEPTED', userId);

      return { success: true, message: 'Invitation accepted' };
    } catch (error) {
      if (
        error.message === 'Invalid invitation token' ||
        error.message === 'Invitation expired' ||
        error.message === 'Invitation is not pending'
      ) {
        throw new NotFoundException(error.message); // Or BadRequest
      }
      throw error;
    }
  }

  /**
   * Gets all members of a workspace, including the owner
   *
   * This method handles both regular workspaces (where owner is in the members table)
   * and legacy workspaces (where owner exists only in workspace.ownerId).
   *
   * For legacy workspaces, it creates a virtual owner entry and attempts auto-repair
   * by adding the owner to the members table asynchronously.
   *
   * @param workspaceId - The workspace ID
   * @returns Array of workspace members with user information
   */
  async getMembers(workspaceId: string) {
    // Get workspace to find owner
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return [];
    }

    const ownerId = workspace.props.ownerId;

    // Get members from database
    const members = await this.workspaceRepository.listMembers(workspaceId);

    // Check if owner is in the members list
    const ownerInMembers = members.find((m) => m.props.userId === ownerId);

    // Build the result list
    const result: Array<{
      id: string;
      workspaceId: string;
      userId: string;
      role: string;
      joinedAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
      } | null;
    }> = [];

    // If owner exists but is NOT in members table, add them as a virtual OWNER member
    // This ensures backwards compatibility for workspaces created before the fix
    if (ownerId && !ownerInMembers) {
      const ownerUser = await this.userRepository.findById(ownerId);
      if (ownerUser) {
        result.push({
          id: `owner-${ownerId}`,
          workspaceId,
          userId: ownerId,
          role: 'OWNER',
          joinedAt: workspace.props.createdAt || new Date(),
          user: {
            id: ownerUser.id,
            name: ownerUser.props.name || ownerUser.props.username || 'Usuario',
            email: ownerUser.props.email || '',
            image: ownerUser.props.image,
          },
        });

        // Also try to persist the owner as member (non-blocking, fire and forget)
        this.ensureOwnerIsMember(workspaceId, ownerId).catch(() => {
          // Silently ignore errors - the virtual member will still show
        });
      }
    }

    // Add all members from the database
    for (const member of members) {
      const user = await this.userRepository.findById(member.props.userId);

      const memberData = {
        id: member.id as string,
        workspaceId: member.props.workspaceId,
        userId: member.props.userId,
        role: member.props.role,
        joinedAt: member.props.joinedAt,
        user: user
          ? {
              id: user.id,
              name: user.props.name || user.props.username || 'Usuario',
              email: user.props.email || '',
              image: user.props.image,
            }
          : null,
      };
      result.push(memberData);
    }

    return result;
  }

  /**
   * Helper to persist owner as workspace member (for legacy workspaces)
   * This is fire-and-forget to not block the getMembers response
   */
  private async ensureOwnerIsMember(
    workspaceId: string,
    ownerId: string,
  ): Promise<void> {
    try {
      const existingMember = await this.workspaceRepository.findMember(
        workspaceId,
        ownerId,
      );
      if (!existingMember) {
        const addMemberUseCase = new AddMemberToWorkspaceUseCase(
          this.workspaceRepository,
        );
        await addMemberUseCase.execute(workspaceId, ownerId, 'OWNER');
      }
    } catch {
      // Ignore errors - the owner will still appear via virtual member
    }
  }

  async getInvitations(workspaceId: string) {
    const invitations =
      await this.invitationRepository.findByWorkspaceId(workspaceId);
    return invitations.map((i) => i.props);
  }

  // ============ WORKSPACE SETTINGS ============

  async getSettings(workspaceId: string) {
    const getSettingsUseCase = new GetWorkspaceSettingsUseCase(
      this.settingsRepository,
    );

    const settings = await getSettingsUseCase.execute({ workspaceId });
    return settings ? settings.props : null;
  }

  async updateSettings(
    workspaceId: string,
    settingsDto: {
      defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
      defaultDueTime?: number;
      timezone?: string;
      locale?: string;
    },
  ) {
    const updateSettingsUseCase = new UpdateWorkspaceSettingsUseCase(
      this.settingsRepository,
    );

    const settings = await updateSettingsUseCase.execute({
      workspaceId,
      ...settingsDto,
    });

    // Log the settings update
    await this.createAuditLog(workspaceId, 'SETTINGS_UPDATED', undefined, {
      changes: settingsDto,
    });

    return settings.props;
  }

  // ============ AUDIT LOGS ============

  async getAuditLogs(workspaceId: string, limit?: number, offset?: number) {
    const getAuditLogsUseCase = new GetWorkspaceAuditLogsUseCase(
      this.auditLogRepository,
    );

    const result = await getAuditLogsUseCase.execute({
      workspaceId,
      limit,
      offset,
    });

    return {
      logs: result.logs.map((log) => log.props),
      total: result.total,
    };
  }

  async createAuditLog(
    workspaceId: string,
    action: string,
    actorId?: string,
    payload?: Record<string, any>,
  ) {
    const createAuditLogUseCase = new CreateAuditLogUseCase(
      this.auditLogRepository,
    );

    const log = await createAuditLogUseCase.execute({
      workspaceId,
      actorId,
      action: action as any, // Type assertion for flexibility
      payload,
    });

    return log.props;
  }
}
