import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { WorkspaceRepository } from '@ordo-todo/core';
import {
  CreateWorkspaceUseCase,
  AddMemberToWorkspaceUseCase,
  RemoveMemberFromWorkspaceUseCase,
} from '@ordo-todo/core';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject('WorkspaceRepository')
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    const createWorkspaceUseCase = new CreateWorkspaceUseCase(
      this.workspaceRepository,
    );
    const workspace = await createWorkspaceUseCase.execute({
      ...createWorkspaceDto,
      color: createWorkspaceDto.color ?? '#2563EB',
      ownerId: userId,
    });
    return workspace.props;
  }

  async findAll(userId: string) {
    const workspaces = await this.workspaceRepository.findByOwnerId(userId);
    return workspaces.map((w) => w.props);
  }

  async findOne(id: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace.props;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    Object.assign(workspace.props, updateWorkspaceDto);
    await this.workspaceRepository.update(workspace);
    return workspace.props;
  }

  async remove(id: string, userId: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.props.ownerId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este workspace',
      );
    }

    await this.workspaceRepository.delete(id);
    return { success: true };
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
}
