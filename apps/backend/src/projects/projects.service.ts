import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { ProjectRepository } from '@ordo-todo/core';
import {
  CreateProjectUseCase,
  UpdateProjectUseCase,
  ArchiveProjectUseCase,
  DeleteProjectUseCase,
  SoftDeleteProjectUseCase,
  RestoreProjectUseCase,
  PermanentDeleteProjectUseCase,
  GetDeletedProjectsUseCase,
} from '@ordo-todo/core';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const createProjectUseCase = new CreateProjectUseCase(
      this.projectRepository,
    );

    // Generate slug if not provided
    const slug =
      createProjectDto.slug || this.generateSlug(createProjectDto.name);

    const project = await createProjectUseCase.execute({
      ...createProjectDto,
      slug,
      color: createProjectDto.color ?? '#6B7280',
      isDeleted: false,
    });
    return project.props;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
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

  async findBySlug(slug: string, workspaceId: string) {
    const project = await this.projectRepository.findBySlug(slug, workspaceId);
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
    this.logger.log(`Archiving project: ${id}`);
    const archiveProjectUseCase = new ArchiveProjectUseCase(
      this.projectRepository,
    );
    const project = await archiveProjectUseCase.execute(id);
    this.logger.log(
      `Project ${id} archived successfully. Status: ${project.props.archived}`,
    );
    return project.props;
  }

  async complete(id: string) {
    this.logger.log(`Completing project: ${id}`);
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

    this.logger.log(`Project ${id} completed at: ${updated.props.completedAt}`);
    return updated.props;
  }

  async remove(id: string) {
    const softDeleteProjectUseCase = new SoftDeleteProjectUseCase(
      this.projectRepository,
    );
    await softDeleteProjectUseCase.execute(id);
    return { success: true };
  }

  async getDeleted(workspaceId: string) {
    const getDeletedProjectsUseCase = new GetDeletedProjectsUseCase(
      this.projectRepository,
    );
    return getDeletedProjectsUseCase.execute(workspaceId);
  }

  async restore(id: string) {
    const restoreProjectUseCase = new RestoreProjectUseCase(
      this.projectRepository,
    );
    await restoreProjectUseCase.execute(id);

    // Get the restored project to return it
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project.props;
  }

  async permanentDelete(id: string) {
    const permanentDeleteProjectUseCase = new PermanentDeleteProjectUseCase(
      this.projectRepository,
    );
    await permanentDeleteProjectUseCase.execute(id);
    return { success: true };
  }
}
