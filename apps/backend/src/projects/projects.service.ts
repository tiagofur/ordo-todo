import { Injectable, Inject } from '@nestjs/common';
import type { ProjectRepository } from '@ordo-todo/core';
import {
  CreateProjectUseCase,
  UpdateProjectUseCase,
  ArchiveProjectUseCase,
  DeleteProjectUseCase,
} from '@ordo-todo/core';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
  ) { }

  async create(createProjectDto: CreateProjectDto) {
    const createProjectUseCase = new CreateProjectUseCase(
      this.projectRepository,
    );
    const project = await createProjectUseCase.execute({
      ...createProjectDto,
      color: createProjectDto.color ?? '#6B7280',
    });
    return project.props;
  }

  async findAll(workspaceId: string) {
    const projects =
      await this.projectRepository.findByWorkspaceId(workspaceId);
    return projects.map((p) => p.props);
  }

  async findAllByUser(userId: string) {
    const projects = await this.projectRepository.findAllByUserId(userId);
    return projects.map((p) => p.props);
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findById(id);
    return project?.props;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const updateProjectUseCase = new UpdateProjectUseCase(
      this.projectRepository,
    );
    const project = await updateProjectUseCase.execute(id, updateProjectDto);
    return project.props;
  }

  async archive(id: string) {
    console.log('📦 Archive service called for project:', id);
    const archiveProjectUseCase = new ArchiveProjectUseCase(
      this.projectRepository,
    );
    const project = await archiveProjectUseCase.execute(id);
    console.log('✅ Project archived status:', project.props.archived);
    return project.props;
  }

  async complete(id: string) {
    console.log('✅ Complete service called for project:', id);
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Use the complete method from the entity
    const completedProject = project.complete();

    const updateProjectUseCase = new UpdateProjectUseCase(
      this.projectRepository,
    );
    const updated = await updateProjectUseCase.execute(id, {
      completed: completedProject.props.completed,
      completedAt: completedProject.props.completedAt,
    });

    console.log('✅ Project completed at:', updated.props.completedAt);
    return updated.props;
  }

  async remove(id: string) {
    const deleteProjectUseCase = new DeleteProjectUseCase(
      this.projectRepository,
    );
    await deleteProjectUseCase.execute(id);
    return { success: true };
  }
}
