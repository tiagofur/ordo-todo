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
} from '@ordo-todo/core';
import {
  CreateWorkspaceUseCase,
  AddMemberToWorkspaceUseCase,
  RemoveMemberFromWorkspaceUseCase,
  SoftDeleteWorkspaceUseCase,
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
    private readonly prisma: PrismaService,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    // Check if user has a username to namespace the workspace
    const user = await this.userRepository.findById(userId);
    // If we were enforcing username presence, we would check it here.
    // For now, workspace creation proceeds. Uniqueness will be checked by DB constraint if ownerId is set.

    // Also check for slug uniqueness per owner manually if needed, or rely on Prisma error
    if (userId) {
      const existing = await this.prisma.workspace.findUnique({
        where: {
          ownerId_slug: {
            ownerId: userId,
            slug: createWorkspaceDto.slug,
          },
        },
      });
      if (existing) {
        throw new ForbiddenException(
          'You already have a workspace with this slug',
        );
      }
    }

    const createWorkspaceUseCase = new CreateWorkspaceUseCase(
      this.workspaceRepository,
    );

    const workspace = await createWorkspaceUseCase.execute({
      ...createWorkspaceDto,
      tier: 'FREE',
      color: createWorkspaceDto.color ?? '#2563EB',
      ownerId: userId,
    });

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

  async findAll(userId: string) {
    // Fetch workspaces with owner information using Prisma directly
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
        isDeleted: false,
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

    return workspaces.map((w) => {
      const taskCount = w.projects.reduce((acc, p) => acc + p._count.tasks, 0);
      return {
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        type: w.type,
        tier: w.tier,
        color: w.color,
        icon: w.icon,
        ownerId: w.ownerId,
        owner: w.owner,
        isArchived: w.isArchived,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        stats: {
          projectCount: w._count.projects,
          memberCount: w._count.members,
          taskCount: taskCount,
        },
      };
    });
  }

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

  async inviteMember(
    workspaceId: string,
    userId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' | 'VIEWER',
  ) {
    const inviteMemberUseCase = new InviteMemberUseCase(
      this.workspaceRepository,
      this.invitationRepository,
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
        devToken: result.token,
      };
    } catch (error) {
      if (error.message === 'Workspace not found') {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  async acceptInvitation(token: string, userId: string) {
    const acceptInvitationUseCase = new AcceptInvitationUseCase(
      this.workspaceRepository,
      this.invitationRepository,
    );

    try {
      // Get invitation first to extract workspaceId for audit log
      const invitation = await this.invitationRepository.findByToken(token);
      if (!invitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      const workspaceId = invitation.props.workspaceId;

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

  async getMembers(workspaceId: string) {
    const members = await this.workspaceRepository.listMembers(workspaceId);
    const membersWithUser = await Promise.all(
      members.map(async (member) => {
        const user = await this.userRepository.findById(member.props.userId);
        return {
          ...member.props,
          user: user
            ? {
                name: user.props.name,
                email: user.props.email,
              }
            : null,
        };
      }),
    );
    return membersWithUser;
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
