import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Objective, KeyResult } from '@ordo-todo/core';
import type { IObjectiveRepository } from '@ordo-todo/core';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { LinkTaskDto } from './dto/link-task.dto';
import {
  startOfQuarter,
  endOfQuarter,
  differenceInDays,
} from 'date-fns';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ObjectivesService {
  private readonly logger = new Logger(ObjectivesService.name);

  constructor(
    @Inject('ObjectiveRepository')
    private readonly objectiveRepository: IObjectiveRepository,
    // We keep PrismaService for complex queries with includes that are not yet in repositories
    // or for cross-domain checks.
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Create a new objective
   */
  async create(createDto: CreateObjectiveDto, userId: string): Promise<Objective> {
    this.logger.log(
      `Creating objective for user ${userId}: ${createDto.title}`,
    );

    const objective = Objective.create({
      title: createDto.title,
      description: createDto.description,
      userId,
      workspaceId: createDto.workspaceId,
      startDate: createDto.startDate ? new Date(createDto.startDate) : new Date(),
      endDate: new Date(createDto.endDate),
      period: (createDto.period as any) ?? 'QUARTERLY',
      color: createDto.color ?? '#3B82F6',
      icon: createDto.icon,
    });

    return this.objectiveRepository.create(objective);
  }

  /**
   * Get all objectives for a user
   */
  async findAll(
    userId: string,
    options?: { status?: string; period?: string; workspaceId?: string },
  ): Promise<Objective[]> {
    // For now we use the repository and manual filtering if needed, 
    // or keep using prisma if the repository doesn't support complex filters yet.
    // Let's implement filters in repository later if needed, for now use user repository findByUserId
    let objectives = await this.objectiveRepository.findByUserId(userId);

    if (options?.status) {
      objectives = objectives.filter(o => o.props.status === options.status);
    }
    if (options?.workspaceId) {
      objectives = objectives.filter(o => o.props.workspaceId === options.workspaceId);
    }

    return objectives;
  }

  /**
   * Get objectives for the current period (quarter by default)
   */
  async findCurrentPeriod(userId: string): Promise<Objective[]> {
    const now = new Date();
    const quarterStart = startOfQuarter(now);
    const quarterEnd = endOfQuarter(now);

    const objectives = await this.objectiveRepository.findByUserId(userId);

    return objectives.filter(o =>
      (o.props.status === 'ACTIVE' || (o.props.status as any) === 'AT_RISK') &&
      o.props.startDate <= quarterEnd &&
      o.props.endDate >= quarterStart
    );
  }

  /**
   * Get dashboard summary for objectives
   */
  async getDashboardSummary(userId: string) {
    const objectives = await this.findCurrentPeriod(userId);

    const summary = {
      total: objectives.length,
      completed: objectives.filter((o) => o.props.status === 'COMPLETED').length,
      atRisk: objectives.filter((o) => (o.props.status as any) === 'AT_RISK').length,
      averageProgress:
        objectives.length > 0
          ? Math.round(
            objectives.reduce((sum, o) => sum + o.progress, 0) /
            objectives.length,
          )
          : 0,
      objectives: objectives.slice(0, 3).map((o) => ({
        id: o.id as string,
        title: o.title,
        progress: o.progress,
        status: o.props.status,
        color: o.props.color,
        daysRemaining: differenceInDays(o.props.endDate, new Date()),
        keyResultsCount: o.props.keyResults?.length || 0,
      })),
    };

    return summary;
  }

  /**
   * Get a single objective
   */
  async findOne(id: string, userId: string): Promise<Objective> {
    const objective = await this.objectiveRepository.findById(id);

    if (!objective || objective.userId !== userId) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }

    return objective;
  }

  /**
   * Update an objective
   */
  async update(id: string, updateDto: UpdateObjectiveDto, userId: string): Promise<Objective> {
    const objective = await this.findOne(id, userId);

    const updatedObjective = objective.clone({
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : objective.props.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : objective.props.endDate,
      period: updateDto.period as any ?? objective.props.period,
      updatedAt: new Date(),
    } as any);

    return this.objectiveRepository.update(updatedObjective);
  }

  /**
   * Delete an objective
   */
  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    await this.findOne(id, userId);
    await this.objectiveRepository.delete(id);
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
  ): Promise<KeyResult> {
    await this.findOne(objectiveId, userId);

    const keyResult = KeyResult.create({
      objectiveId,
      title: createDto.title,
      description: createDto.description,
      metricType: (createDto.metricType as any) ?? 'PERCENTAGE',
      startValue: createDto.startValue ?? 0,
      targetValue: createDto.targetValue,
      currentValue: createDto.currentValue ?? 0,
      unit: createDto.unit,
    });

    const created = await this.objectiveRepository.createKeyResult(keyResult);

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(objectiveId);

    return created;
  }

  /**
   * Update a key result
   */
  async updateKeyResult(
    keyResultId: string,
    updateDto: UpdateKeyResultDto,
    userId: string,
  ): Promise<KeyResult> {
    const keyResult = await this.objectiveRepository.findKeyResultById(keyResultId);

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    // Verify ownership via objective
    const objective = await this.objectiveRepository.findById(keyResult.props.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    const updatedKR = keyResult.clone({
      ...updateDto,
      updatedAt: new Date(),
    } as any);

    // If values changed, update progress
    let finalKR = updatedKR;
    if (updateDto.currentValue !== undefined) {
      finalKR = updatedKR.updateProgress(updateDto.currentValue);
    }

    const updated = await this.objectiveRepository.updateKeyResult(finalKR);

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(keyResult.props.objectiveId);

    return updated;
  }

  /**
   * Delete a key result
   */
  async removeKeyResult(keyResultId: string, userId: string): Promise<{ success: boolean }> {
    const keyResult = await this.objectiveRepository.findKeyResultById(keyResultId);

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    const objective = await this.objectiveRepository.findById(keyResult.props.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    const objectiveId = keyResult.props.objectiveId;
    await this.objectiveRepository.deleteKeyResult(keyResultId);

    // Recalculate objective progress
    await this.recalculateObjectiveProgress(objectiveId);

    return { success: true };
  }

  // ============ TASK LINKING ============

  /**
   * Link a task to a key result
   */
  async linkTask(keyResultId: string, linkDto: LinkTaskDto, userId: string) {
    const keyResult = await this.objectiveRepository.findKeyResultById(keyResultId);

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    const objective = await this.objectiveRepository.findById(keyResult.props.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    // Verify task exists and belongs to user
    // We use prisma for now as TaskRepository might not be injected or the service is not ready
    const task = await this.prisma.client.task.findFirst({
      where: { id: linkDto.taskId, ownerId: userId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${linkDto.taskId} not found`);
    }

    await this.objectiveRepository.linkTask(keyResultId, linkDto.taskId, linkDto.weight);

    return { success: true };
  }

  /**
   * Unlink a task from a key result
   */
  async unlinkTask(keyResultId: string, taskId: string, userId: string) {
    const keyResult = await this.objectiveRepository.findKeyResultById(keyResultId);

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    const objective = await this.objectiveRepository.findById(keyResult.props.objectiveId);
    if (!objective || objective.userId !== userId) {
      throw new NotFoundException(`Key Result with ID ${keyResultId} not found`);
    }

    await this.objectiveRepository.unlinkTask(keyResultId, taskId);

    return { success: true };
  }

  // ============ PROGRESS CALCULATIONS ============

  /**
   * Calculate and update objective progress based on key results
   */
  private async recalculateObjectiveProgress(objectiveId: string) {
    const objective = await this.objectiveRepository.findById(objectiveId);
    if (!objective) return;

    const keyResults = objective.props.keyResults || [];

    let progress = 0;
    if (keyResults.length > 0) {
      const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
      progress = Math.round(totalProgress / keyResults.length);
    }

    let status = objective.props.status;
    if (status !== 'COMPLETED' && status !== 'CANCELLED') {
      const daysRemaining = differenceInDays(objective.props.endDate, new Date());
      const totalDays = differenceInDays(objective.props.endDate, objective.props.startDate);
      const daysPassed = differenceInDays(new Date(), objective.props.startDate);
      const expectedProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;

      if (progress >= 100) {
        status = 'COMPLETED';
      } else if (daysRemaining < 7 && progress < expectedProgress - 20) {
        status = 'AT_RISK' as any;
      } else if (status === ('AT_RISK' as any) && progress >= expectedProgress - 10) {
        status = 'ACTIVE';
      }
    }

    const updatedObjective = objective.clone({
      progress,
      status,
      updatedAt: new Date(),
    } as any);

    await this.objectiveRepository.update(updatedObjective);
  }
}
