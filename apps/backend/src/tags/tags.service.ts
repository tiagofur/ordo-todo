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
    // Use TagRepository to get tags with task count
    const tags = await this.tagRepository.findByWorkspaceIdWithTaskCount(
      workspaceId,
    );

    this.logger.debug(`Found ${tags.length} tags for workspace ${workspaceId}`);
    return tags;
  }

  async findOne(id: string) {
    // Use TagRepository to get tag with task count
    const tag = await this.tagRepository.findByIdWithTaskCount(id);

    if (!tag) {
      this.logger.warn(`Tag ${id} not found`);
      return null;
    }

    this.logger.debug(`Found tag ${id}`);
    return tag;
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
