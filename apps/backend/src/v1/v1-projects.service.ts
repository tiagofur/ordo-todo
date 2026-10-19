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

  async get(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    void userId;
    return this.projectsService.findOne(id);
  }

  create(userId: string, dto: CreateProjectDto) {
    void userId;
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
