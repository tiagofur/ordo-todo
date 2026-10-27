import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  Optional,
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
import { PrismaService } from '../database/prisma.service';
import { PlanLimitsService } from '../billing/plan-limits.service';
import { EmbeddingIndexerService } from '../ai/retrieval/embedding-indexer.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
    @Optional() private readonly indexer?: EmbeddingIndexerService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    // ODD 012 S4: el plan del dueño del workspace limita sus proyectos
    await this.planLimits.assertWithinProjectLimit(
      createProjectDto.workspaceId,
    );

    const createProjectUseCase = new CreateProjectUseCase(
      this.projectRepository,
    );

    // Generate slug if not provided
    const slug =
      createProjectDto.slug || this.generateSlug(createProjectDto.name);

    let workflowId = createProjectDto.workflowId;
    if (!workflowId) {
      const defaultWorkflow = await this.prisma.workflow.findFirst({
        where: { workspaceId: createProjectDto.workspaceId },
      });
      if (defaultWorkflow) {
        workflowId = defaultWorkflow.id;
      } else {
        const newWorkflow = await this.prisma.workflow.create({
          data: {
            name: 'General',
            workspaceId: createProjectDto.workspaceId,
          },
        });
        workflowId = newWorkflow.id;
      }
    }

    const project = await createProjectUseCase.execute({
      ...createProjectDto,
      workflowId,
      slug,
      color: createProjectDto.color ?? '#6B7280',
      isDeleted: false,
    });
    await this.indexer?.indexContent(
      'PROJECT',
      String(project.id),
      `${project.props.name}\n${project.props.description ?? ''}`,
    );
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
    await this.indexer?.indexContent(
      'PROJECT',
      String(project.id),
      `${project.props.name}\n${project.props.description ?? ''}`,
    );
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
    await this.indexer?.indexContent(
      'PROJECT',
      String(project.id),
      `${project.props.name}\n${project.props.description ?? ''}`,
    );
    return {
      ...project.props,
      isArchived: project.props.archived,
    };
  }

  async complete(id: string) {
    this.logger.log(`Completing project: ${id}`);
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
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
    await this.indexer?.indexContent(
      'PROJECT',
      String(updated.id),
      `${updated.props.name}\n${updated.props.description ?? ''}`,
    );
    return {
      ...updated.props,
      status: updated.props.completed ? 'COMPLETED' : 'ACTIVE',
    };
  }

  async remove(id: string) {
    const softDeleteProjectUseCase = new SoftDeleteProjectUseCase(
      this.projectRepository,
    );
    await softDeleteProjectUseCase.execute(id);
    await this.indexer?.removeContent('PROJECT', id);
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
    try {
      await restoreProjectUseCase.execute(id);
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message === 'Project not found'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }

    // Get the restored project to return it
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.indexer?.indexContent(
      'PROJECT',
      String(project.id),
      `${project.props.name}\n${project.props.description ?? ''}`,
    );
    return {
      ...project.props,
      deletedAt: null,
    };
  }

  async permanentDelete(id: string) {
    const permanentDeleteProjectUseCase = new PermanentDeleteProjectUseCase(
      this.projectRepository,
    );
    try {
      await permanentDeleteProjectUseCase.execute(id);
      await this.indexer?.removeContent('PROJECT', id);
      return { success: true };
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message === 'Project not found'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }
}
