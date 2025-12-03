import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { WorkspaceRepository, UserRepository } from '@ordo-todo/core';
import {
  CreateWorkspaceUseCase,
  AddMemberToWorkspaceUseCase,
  RemoveMemberFromWorkspaceUseCase,
  SoftDeleteWorkspaceUseCase,
  ArchiveWorkspaceUseCase,
  InviteMemberUseCase,
  AcceptInvitationUseCase,
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
    return workspace.props;
  }

  async findAll(userId: string) {
    const workspaces = await this.workspaceRepository.findByOwnerId(userId);
    // Filter out deleted workspaces (although repository should probably handle this, but for now filtering here is safer)
    return workspaces
      .filter(w => !w.props.isDeleted)
      .map((w) => w.props);
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
    return updatedWorkspace.props;
  }

  async remove(id: string, userId: string) {
    const softDeleteUseCase = new SoftDeleteWorkspaceUseCase(
      this.workspaceRepository,
    );

    try {
      await softDeleteUseCase.execute(id, userId);
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
    return member.props;
  }

  async removeMember(workspaceId: string, userId: string) {
    const removeMemberFromWorkspaceUseCase =
      new RemoveMemberFromWorkspaceUseCase(this.workspaceRepository);
    await removeMemberFromWorkspaceUseCase.execute(workspaceId, userId);
    return { success: true };
  }

  async inviteMember(workspaceId: string, userId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    const inviteMemberUseCase = new InviteMemberUseCase(
      this.workspaceRepository,
      this.invitationRepository,
    );

    try {
      const result = await inviteMemberUseCase.execute(workspaceId, email, role, userId);
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
      await acceptInvitationUseCase.execute(token, userId);
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
}
