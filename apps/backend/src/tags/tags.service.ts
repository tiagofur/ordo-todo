import { Injectable, Inject, Logger } from '@nestjs/common';
import type { TagRepository } from '@ordo-todo/core';
import {
  CreateTagUseCase,
  UpdateTagUseCase,
  AssignTagToTaskUseCase,
  RemoveTagFromTaskUseCase,
} from '@ordo-todo/core';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @Inject('TagRepository')
    private readonly tagRepository: TagRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const createTagUseCase = new CreateTagUseCase(this.tagRepository);
    const tag = await createTagUseCase.execute({
      ...createTagDto,
      color: createTagDto.color ?? '#6B7280',
    });
    return tag.props;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const updateTagUseCase = new UpdateTagUseCase(this.tagRepository);
    const tag = await updateTagUseCase.execute(id, updateTagDto);
    return tag.props;
  }

  async findAll(workspaceId: string) {
    // Get tags with task count from Prisma directly
    const tagsWithCount = await this.prisma.tag.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    const result = tagsWithCount.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      workspaceId: tag.workspaceId,
      createdAt: tag.createdAt,
      taskCount: tag._count.tasks,
    }));

    this.logger.debug(
      `Found ${result.length} tags for workspace ${workspaceId}`,
    );
    return result;
  }

  async findOne(id: string) {
    // Get tag with task count from Prisma directly
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!tag) {
      this.logger.warn(`Tag ${id} not found`);
      return null;
    }

    this.logger.debug(`Found tag ${id}`);
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      workspaceId: tag.workspaceId,
      createdAt: tag.createdAt,
      taskCount: tag._count.tasks,
    };
  }

  async assignToTask(tagId: string, taskId: string) {
    const assignTagToTaskUseCase = new AssignTagToTaskUseCase(
      this.tagRepository,
    );
    await assignTagToTaskUseCase.execute(tagId, taskId);
    return { success: true };
  }

  async removeFromTask(tagId: string, taskId: string) {
    const removeTagFromTaskUseCase = new RemoveTagFromTaskUseCase(
      this.tagRepository,
    );
    await removeTagFromTaskUseCase.execute(tagId, taskId);
    return { success: true };
  }

  async findByTask(taskId: string) {
    const tags = await this.tagRepository.findByTaskId(taskId);
    return tags.map((t) => t.props);
  }

  async remove(id: string) {
    await this.tagRepository.delete(id);
    return { success: true };
  }
}
