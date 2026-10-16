import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IdeasRepository, FindIdeasParams } from './ideas.repository';
import { CreateIdeaDto, UpdateIdeaDto, IdeaResponseDto } from './dto';
import { Idea, IdeaStatus } from '@prisma/client';

@Injectable()
export class IdeasService {
  constructor(private readonly ideasRepository: IdeasRepository) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateIdeaDto,
  ): Promise<IdeaResponseDto> {
    const { tagIds, ...data } = dto;

    const idea = await this.ideasRepository.create({
      ...data,
      source: data.source || 'MANUAL',
      user: { connect: { id: userId } },
      workspace: { connect: { id: workspaceId } },
    });

    if (tagIds && tagIds.length > 0) {
      await this.ideasRepository.setTags(idea.id, tagIds);
    }

    return this.mapToDto(idea);
  }

  async findById(
    id: string,
    userId: string,
    workspaceId: string,
  ): Promise<IdeaResponseDto> {
    const idea = await this.ideasRepository.findById(id, workspaceId);

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${id} not found`);
    }

    if (idea.userId !== userId) {
      throw new ForbiddenException('You do not have access to this idea');
    }

    return this.mapToDto(idea);
  }

  async findMany(
    userId: string,
    workspaceId: string,
    options: {
      status?: IdeaStatus;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    data: IdeaResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, search, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const params: FindIdeasParams = {
      userId,
      workspaceId,
      status,
      search,
      skip,
      take: limit,
    };

    const { ideas, total } = await this.ideasRepository.findMany(params);

    return {
      data: ideas.map((idea) => this.mapToDto(idea)),
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    userId: string,
    workspaceId: string,
    dto: UpdateIdeaDto,
  ): Promise<IdeaResponseDto> {
    const existingIdea = await this.ideasRepository.findById(id, workspaceId);

    if (!existingIdea) {
      throw new NotFoundException(`Idea with ID ${id} not found`);
    }

    if (existingIdea.userId !== userId) {
      throw new ForbiddenException('You do not have access to this idea');
    }

    const { tagIds, ...data } = dto;

    const updatedIdea = await this.ideasRepository.update(id, data);

    if (tagIds !== undefined) {
      await this.ideasRepository.setTags(id, tagIds);
    }

    return this.mapToDto(updatedIdea);
  }

  async delete(id: string, userId: string, workspaceId: string): Promise<void> {
    const idea = await this.ideasRepository.findById(id, workspaceId);

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${id} not found`);
    }

    if (idea.userId !== userId) {
      throw new ForbiddenException('You do not have access to this idea');
    }

    await this.ideasRepository.delete(id);
  }

  async archive(
    id: string,
    userId: string,
    workspaceId: string,
  ): Promise<IdeaResponseDto> {
    const idea = await this.ideasRepository.findById(id, workspaceId);

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${id} not found`);
    }

    if (idea.userId !== userId) {
      throw new ForbiddenException('You do not have access to this idea');
    }

    const archivedIdea = await this.ideasRepository.archive(id);
    return this.mapToDto(archivedIdea);
  }

  private mapToDto(
    idea: Idea & {
      tags?: Array<{ tag: { id: string; name: string; color: string } }>;
    },
  ): IdeaResponseDto {
    return {
      id: idea.id,
      title: idea.title,
      description: idea.description ?? undefined,
      source: idea.source,
      voiceNoteUrl: idea.voiceNoteUrl ?? undefined,
      screenshot: idea.screenshot ?? undefined,
      sourceUrl: idea.sourceUrl ?? undefined,
      status: idea.status,
      archivedAt: idea.archivedAt ?? undefined,
      promotedAt: idea.promotedAt ?? undefined,
      contentPieceId: idea.contentPieceId ?? undefined,
      userId: idea.userId,
      workspaceId: idea.workspaceId,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      tags: idea.tags?.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      })),
    };
  }
}
