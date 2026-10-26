import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { UpdateProjectDto } from '../projects/dto/update-project.dto';

/**
 * Public `/v1` project operations.
 *
 * Thin adapter over {@link ProjectsService}: listing is scoped to the
 * token owner and ownership is verified before any mutation.
 */
@Injectable()
export class V1ProjectsService {
  private readonly logger = new Logger(V1ProjectsService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  list(userId: string) {
    return this.projectsService.findAllByUser(userId);
  }

  /**
   * Read access = owner or member of the workspace that owns the
   * project. This used to ignore `userId` entirely — any token could
   * read any project by id (issue #408, reviewer finding on PR #407).
   */
  async get(userId: string, id: string) {
    await this.assertCanAccess(userId, id);
    return this.projectsService.findOne(id);
  }

  async create(userId: string, dto: CreateProjectDto) {
    // Same gate as the UI: projects can only be created in workspaces
    // the caller belongs to (the endpoint used to ignore this too).
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: dto.workspaceId, userId },
      },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException(
        'You can only create projects in workspaces you belong to',
      );
    }
    return this.projectsService.create(dto);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.assertOwner(userId, id);
    return this.projectsService.update(id, dto);
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.projectsService.remove(id);
  }

  private async assertCanAccess(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        workspaceId: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.ownerId !== userId) {
      const member = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
            userId,
          },
        },
        select: { id: true },
      });
      if (!member) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }
    return project;
  }

  private async assertOwner(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.ownerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to mutate project ${id} owned by ${project.ownerId}`,
      );
      throw new ForbiddenException('Only the project owner can modify it');
    }
    return project;
  }
}
