import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { LinkTaskDto } from './dto/link-task.dto';
import {
  startOfDay,
  endOfDay,
  startOfQuarter,
  endOfQuarter,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  differenceInDays,
} from 'date-fns';

@Injectable()
export class ObjectivesService {
  private readonly logger = new Logger(ObjectivesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new objective
   */
  async create(createDto: CreateObjectiveDto, userId: string) {
    this.logger.log(
      `Creating objective for user ${userId}: ${createDto.title}`,
    );

    const objective = await this.prisma.client.objective.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        startDate: createDto.startDate
          ? new Date(createDto.startDate)
          : new Date(),
        endDate: new Date(createDto.endDate),
        period: createDto.period ?? 'QUARTERLY',
        color: createDto.color ?? '#3B82F6',
        icon: createDto.icon,
        workspaceId: createDto.workspaceId,
        userId,
      },
      include: {
        keyResults: true,
      },
    });

    return objective;
  }

  /**
   * Get all objectives for a user
   */
  async findAll(
    userId: string,
    options?: { status?: string; period?: string; workspaceId?: string },
  ) {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.workspaceId) {
      where.workspaceId = options.workspaceId;
    }

    return this.prisma.client.objective.findMany({
      where,
      include: {
        keyResults: {
          include: {
            linkedTasks: {
              include: {
                task: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { endDate: 'asc' }],
    });
  }

  /**
   * Get objectives for the current period (quarter by default)
   */
  async findCurrentPeriod(userId: string) {
    const now = new Date();
    const quarterStart = startOfQuarter(now);
    const quarterEnd = endOfQuarter(now);

    return this.prisma.client.objective.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'AT_RISK'] },
        OR: [
          {
            startDate: { lte: quarterEnd },
            endDate: { gte: quarterStart },
          },
        ],
      },
      include: {
        keyResults: {
          include: {
            linkedTasks: {
              include: {
                task: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Get dashboard summary for objectives
   */
  async getDashboardSummary(userId: string) {
    const objectives = await this.findCurrentPeriod(userId);

    const summary = {
      total: objectives.length,
      completed: objectives.filter((o) => o.status === 'COMPLETED').length,
      atRisk: objectives.filter((o) => o.status === 'AT_RISK').length,
      averageProgress:
        objectives.length > 0
          ? Math.round(
              objectives.reduce((sum, o) => sum + o.progress, 0) /
                objectives.length,
            )
          : 0,
      objectives: objectives.slice(0, 3).map((o) => ({
        id: o.id,
        title: o.title,
        progress: o.progress,
        status: o.status,
        color: o.color,
        daysRemaining: differenceInDays(o.endDate, new Date()),
        keyResultsCount: o.keyResults.length,
      })),
    };

    return summary;
  }

  /**
   * Get a single objective
   */
  async findOne(id: string, userId: string) {
    const objective = await this.prisma.client.objective.findFirst({
      where: { id, userId },
      include: {
        keyResults: {
          include: {
            linkedTasks: {
              include: {
                task: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    project: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }

  /**
   * Update an objective
   */
  async update(id: string, updateDto: UpdateObjectiveDto, userId: string) {
    await this.findOne(id, userId);

    const updateData: any = { ...updateDto };

    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate);
    }

    const objective = await this.prisma.client.objective.update({
      where: { id },
      data: updateData,
      include: {
        keyResults: true,
      },
    });

    return objective;
  }

  /**
   * Delete an objective
   */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.objective.delete({ where: { id } });
    return { success: true };
  }

  // ============ KEY RESULTS ============

  /**
   * Add a key result to an objective
   */
  async addKeyResult(
    objectiveId: string,
    createDto: CreateKeyResultDto,
    userId: string,
  ) {
    await this.findOne(objectiveId, userId);

    const keyResult = await this.prisma.client.keyResult.create({
      data: {
        objectiveId,
        title: createDto.title,
        description: createDto.description,
        metricType: createDto.metricType ?? 'PERCENTAGE',
        startValue: createDto.startValue ?? 0,
        targetValue: createDto.targetValue,
        currentValue: createDto.currentValue ?? 0,
        unit: createDto.unit,
      },
      include: {
        linkedTasks: true,
      },
    });

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(objectiveId);

    return keyResult;
  }

  /**
   * Update a key result
   */
  async updateKeyResult(
    keyResultId: string,
    updateDto: UpdateKeyResultDto,
    userId: string,
  ) {
    const keyResult = await this.prisma.client.keyResult.findFirst({
      where: { id: keyResultId },
      include: { objective: true },
    });

    if (!keyResult) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    if (keyResult.objective.userId !== userId) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    const updated = await this.prisma.client.keyResult.update({
      where: { id: keyResultId },
      data: updateDto,
      include: {
        linkedTasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Recalculate progress
    await this.recalculateKeyResultProgress(keyResultId);
    await this.recalculateObjectiveProgress(keyResult.objectiveId);

    return updated;
  }

  /**
   * Delete a key result
   */
  async removeKeyResult(keyResultId: string, userId: string) {
    const keyResult = await this.prisma.client.keyResult.findFirst({
      where: { id: keyResultId },
      include: { objective: true },
    });

    if (!keyResult) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    if (keyResult.objective.userId !== userId) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    const objectiveId = keyResult.objectiveId;
    await this.prisma.client.keyResult.delete({ where: { id: keyResultId } });

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(objectiveId);

    return { success: true };
  }

  // ============ TASK LINKING ============

  /**
   * Link a task to a key result
   */
  async linkTask(keyResultId: string, linkDto: LinkTaskDto, userId: string) {
    const keyResult = await this.prisma.client.keyResult.findFirst({
      where: { id: keyResultId },
      include: { objective: true },
    });

    if (!keyResult) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    if (keyResult.objective.userId !== userId) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    // Verify task exists and belongs to user
    const task = await this.prisma.client.task.findFirst({
      where: { id: linkDto.taskId, ownerId: userId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${linkDto.taskId} not found`);
    }

    // Check if already linked
    const existing = await this.prisma.client.keyResultTask.findUnique({
      where: {
        keyResultId_taskId: {
          keyResultId,
          taskId: linkDto.taskId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Task is already linked to this Key Result',
      );
    }

    const link = await this.prisma.client.keyResultTask.create({
      data: {
        keyResultId,
        taskId: linkDto.taskId,
        weight: linkDto.weight ?? 1,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Recalculate progress if metric type is TASK_COUNT
    if (keyResult.metricType === 'TASK_COUNT') {
      await this.recalculateKeyResultProgress(keyResultId);
      await this.recalculateObjectiveProgress(keyResult.objectiveId);
    }

    return link;
  }

  /**
   * Unlink a task from a key result
   */
  async unlinkTask(keyResultId: string, taskId: string, userId: string) {
    const keyResult = await this.prisma.client.keyResult.findFirst({
      where: { id: keyResultId },
      include: { objective: true },
    });

    if (!keyResult) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    if (keyResult.objective.userId !== userId) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    await this.prisma.client.keyResultTask.delete({
      where: {
        keyResultId_taskId: {
          keyResultId,
          taskId,
        },
      },
    });

    // Recalculate progress if metric type is TASK_COUNT
    if (keyResult.metricType === 'TASK_COUNT') {
      await this.recalculateKeyResultProgress(keyResultId);
      await this.recalculateObjectiveProgress(keyResult.objectiveId);
    }

    return { success: true };
  }

  // ============ PROGRESS CALCULATIONS ============

  /**
   * Calculate and update key result progress
   */
  private async recalculateKeyResultProgress(keyResultId: string) {
    const keyResult = await this.prisma.client.keyResult.findUnique({
      where: { id: keyResultId },
      include: {
        linkedTasks: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!keyResult) return;

    let progress = 0;

    if (keyResult.metricType === 'BOOLEAN') {
      progress = keyResult.currentValue > 0 ? 100 : 0;
    } else if (keyResult.metricType === 'TASK_COUNT') {
      const completedTasks = keyResult.linkedTasks.filter(
        (lt) => lt.task.status === 'COMPLETED',
      );
      progress =
        keyResult.linkedTasks.length > 0
          ? Math.round(
              (completedTasks.length / keyResult.linkedTasks.length) * 100,
            )
          : 0;
    } else {
      // PERCENTAGE, NUMBER, CURRENCY
      const range = keyResult.targetValue - keyResult.startValue;
      if (range === 0) {
        progress = keyResult.currentValue >= keyResult.targetValue ? 100 : 0;
      } else {
        progress =
          ((keyResult.currentValue - keyResult.startValue) / range) * 100;
        progress = Math.min(Math.max(Math.round(progress), 0), 100);
      }
    }

    await this.prisma.client.keyResult.update({
      where: { id: keyResultId },
      data: { progress },
    });
  }

  /**
   * Calculate and update objective progress based on key results
   */
  private async recalculateObjectiveProgress(objectiveId: string) {
    const keyResults = await this.prisma.client.keyResult.findMany({
      where: { objectiveId },
    });

    let progress = 0;
    if (keyResults.length > 0) {
      const totalProgress = keyResults.reduce(
        (sum, kr) => sum + kr.progress,
        0,
      );
      progress = Math.round(totalProgress / keyResults.length);
    }

    // Determine status based on progress and time remaining
    const objective = await this.prisma.client.objective.findUnique({
      where: { id: objectiveId },
    });

    let status = objective?.status;
    if (
      objective &&
      objective.status !== 'COMPLETED' &&
      objective.status !== 'CANCELLED'
    ) {
      const daysRemaining = differenceInDays(objective.endDate, new Date());
      const expectedProgress =
        ((new Date().getTime() - objective.startDate.getTime()) /
          (objective.endDate.getTime() - objective.startDate.getTime())) *
        100;

      if (progress >= 100) {
        status = 'COMPLETED';
      } else if (daysRemaining < 7 && progress < expectedProgress - 20) {
        status = 'AT_RISK';
      } else if (
        objective.status === 'AT_RISK' &&
        progress >= expectedProgress - 10
      ) {
        status = 'ACTIVE';
      }
    }

    await this.prisma.client.objective.update({
      where: { id: objectiveId },
      data: { progress, status },
    });
  }

  /**
   * Recalculate progress for all key results that have a specific task linked
   * Called when a task status changes
   */
  async recalculateProgressForTask(taskId: string) {
    const links = await this.prisma.client.keyResultTask.findMany({
      where: { taskId },
      include: {
        keyResult: true,
      },
    });

    for (const link of links) {
      if (link.keyResult.metricType === 'TASK_COUNT') {
        await this.recalculateKeyResultProgress(link.keyResultId);
        await this.recalculateObjectiveProgress(link.keyResult.objectiveId);
      }
    }
  }
}
