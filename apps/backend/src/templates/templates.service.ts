import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { TaskTemplate } from '@ordo-todo/core';
import type { ITaskTemplateRepository } from '@ordo-todo/core';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @Inject('TaskTemplateRepository')
    private readonly templateRepository: ITaskTemplateRepository
  ) { }

  async create(dto: CreateTemplateDto): Promise<TaskTemplate> {
    const template = TaskTemplate.create({
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      titlePattern: dto.titlePattern,
      defaultPriority: dto.defaultPriority as any,
      defaultEstimatedMinutes: dto.defaultEstimatedMinutes,
      defaultDescription: dto.defaultDescription,
      defaultTags: dto.defaultTags,
      workspaceId: dto.workspaceId,
      isPublic: dto.isPublic ?? true,
    });

    return this.templateRepository.create(template);
  }

  async findAll(workspaceId: string): Promise<TaskTemplate[]> {
    return this.templateRepository.findByWorkspaceId(workspaceId);
  }

  async findOne(id: string): Promise<TaskTemplate> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException(`Task template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<TaskTemplate> {
    const template = await this.findOne(id);

    const updatedTemplate = template.update({
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      titlePattern: dto.titlePattern,
      defaultPriority: dto.defaultPriority as any,
      defaultEstimatedMinutes: dto.defaultEstimatedMinutes,
      defaultDescription: dto.defaultDescription,
      defaultTags: dto.defaultTags,
      isPublic: dto.isPublic,
    });

    return this.templateRepository.update(updatedTemplate);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.templateRepository.delete(id);
  }
}
