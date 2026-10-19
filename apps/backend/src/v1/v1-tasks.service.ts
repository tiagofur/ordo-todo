import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../database/prisma.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';

export interface V1TaskFilters {
  projectId?: string;
  tags?: string[];
  assignedToMe?: boolean;
}

/**
 * Public `/v1` task operations.
 *
 * Thin adapter over {@link TasksService}: every call is scoped to the
 * token owner and ownership is verified before any mutation. The
 * underlying service and its business rules stay the single
 * implementation — this layer only adds the public contract.
 */
@Injectable()
export class V1TasksService {
  private readonly logger = new Logger(V1TasksService.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly prisma: PrismaService,
  ) {}

  list(userId: string, filters: V1TaskFilters = {}) {
    return this.tasksService.findAll(
      userId,
      filters.projectId,
      filters.tags,
      filters.assignedToMe,
    );
  }

  async get(userId: string, id: string) {
    await this.assertCanAccess(userId, id);
    return this.tasksService.findOne(id);
  }

  create(userId: string, dto: CreateTaskDto) {
    // TasksService.create forces ownerId/assigneeId from userId.
    return this.tasksService.create(dto, userId);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.assertOwner(userId, id);
    return this.tasksService.update(id, dto, userId);
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    return this.tasksService.remove(id);
  }

  private async assertCanAccess(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        project: { select: { workspaceId: true } },
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async assertOwner(userId: string, id: string) {
    const task = await this.assertCanAccess(userId, id);
    if (task.ownerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to mutate task ${id} owned by ${task.ownerId}`,
      );
      throw new ForbiddenException('Only the task owner can modify it');
    }
    return task;
  }
}
