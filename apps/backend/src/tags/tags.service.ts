import { Injectable, Inject } from '@nestjs/common';
import type { TagRepository } from '@ordo-todo/core';
import {
  CreateTagUseCase,
  AssignTagToTaskUseCase,
  RemoveTagFromTaskUseCase,
} from '@ordo-todo/core';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @Inject('TagRepository')
    private readonly tagRepository: TagRepository,
  ) {}

  async create(createTagDto: CreateTagDto) {
    const createTagUseCase = new CreateTagUseCase(this.tagRepository);
    const tag = await createTagUseCase.execute({
      ...createTagDto,
      color: createTagDto.color ?? '#6B7280',
    });
    return tag.props;
  }

  async findAll(workspaceId: string) {
    const tags = await this.tagRepository.findByWorkspaceId(workspaceId);
    return tags.map((t) => t.props);
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
