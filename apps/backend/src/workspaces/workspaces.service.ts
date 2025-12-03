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
} from '@ordo-todo/core';
import type { WorkspaceInvitationRepository } from '@ordo-todo/core';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';

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
  ) { }

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    const createWorkspaceUseCase = new CreateWorkspaceUseCase(
      this.workspaceRepository,
    );

    const workspace = await createWorkspaceUseCase.execute({
      ...createWorkspaceDto,
      tier: 'FREE',
      color: createWorkspaceDto.color ?? '#2563EB',
      ownerId: userId,
    });

    // Log workspace creation
    await this.createAuditLog(workspace.id as string, 'WORKSPACE_CREATED', userId, {
      name: workspace.props.name,
      type: workspace.props.type,
    });

    return workspace.props;
  }

  async findAll(userId: string) {
    const workspaces = await this.workspaceRepository.findByUserId(userId);
    // Filter out deleted workspaces (repository already handles this but keeping safe)
    return workspaces
      .filter(w => !w.props.isDeleted)
      .map((w) => ({
        ...w.props,
        // Ensure stats are passed
        stats: w.props.stats
      }));
  }

  async findOne(id: string) {
    const workspace = await this.workspaceRepository.findById(id);
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
        throw new ForbiddenException('No tienes permisos para eliminar este workspace');
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
        throw new ForbiddenException('No tienes permisos para archivar este workspace');
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

  async inviteMember(workspaceId: string, userId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    const inviteMemberUseCase = new InviteMemberUseCase(
      this.workspaceRepository,
      this.invitationRepository,
    );

    try {
      const result = await inviteMemberUseCase.execute(workspaceId, email, role, userId);

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
        devToken: result.token
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
      if (error.message === 'Invalid invitation token' || error.message === 'Invitation expired' || error.message === 'Invitation is not pending') {
        throw new NotFoundException(error.message); // Or BadRequest
      }
      throw error;
    }
  }

  async getMembers(workspaceId: string) {
    const members = await this.workspaceRepository.listMembers(workspaceId);
    const membersWithUser = await Promise.all(members.map(async (member) => {
      const user = await this.userRepository.findById(member.props.userId);
      return {
        ...member.props,
        user: user ? {
          name: user.props.name,
          email: user.props.email,
        } : null
      };
    }));
    return membersWithUser;
  }

  async getInvitations(workspaceId: string) {
    const invitations = await this.invitationRepository.findByWorkspaceId(workspaceId);
    return invitations.map(i => i.props);
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
      logs: result.logs.map(log => log.props),
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
