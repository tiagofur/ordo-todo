import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ContentPiecesRepository,
  PipelineView,
} from './content-pieces.repository';
import { IdeasRepository } from '../ideas/ideas.repository';
import {
  CreateContentPieceDto,
  UpdateContentPieceDto,
  ContentPieceResponseDto,
} from './dto';
import { ContentPiece, ContentPipelineStatus } from '@prisma/client';

@Injectable()
export class ContentPiecesService {
  constructor(
    private readonly contentPiecesRepository: ContentPiecesRepository,
    private readonly ideasRepository: IdeasRepository,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    const { ideaId, seriesId, scheduledAt, ...data } = dto;

    // Create the content piece
    const contentPiece = await this.contentPiecesRepository.create({
      ...data,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      user: { connect: { id: userId } },
      workspace: { connect: { id: workspaceId } },
      ...(ideaId && { idea: { connect: { id: ideaId } } }),
      ...(seriesId && { series: { connect: { id: seriesId } } }),
    });

    // If promoting from idea, update the idea status
    if (ideaId) {
      await this.ideasRepository.promote(ideaId, contentPiece.id);
    }

    return this.mapToDto(contentPiece);
  }

  async promoteFromIdea(
    ideaId: string,
    userId: string,
    workspaceId: string,
    dto: CreateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    const idea = await this.ideasRepository.findById(ideaId, workspaceId);

    if (!idea) {
      throw new NotFoundException(`Idea with ID ${ideaId} not found`);
    }

    if (idea.userId !== userId) {
      throw new ForbiddenException('You do not have access to this idea');
    }

    if (idea.status === 'PROMOTED') {
      throw new BadRequestException('This idea has already been promoted');
    }

    return this.create(userId, workspaceId, {
      ...dto,
      ideaId,
      title: dto.title || idea.title,
      description: dto.description || idea.description || undefined,
    });
  }

  async findById(
    id: string,
    userId: string,
    workspaceId: string,
  ): Promise<ContentPieceResponseDto> {
    const contentPiece = await this.contentPiecesRepository.findById(
      id,
      workspaceId,
    );

    if (!contentPiece) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    if (contentPiece.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this content piece',
      );
    }

    return this.mapToDto(contentPiece);
  }

  async findMany(
    userId: string,
    workspaceId: string,
    options: {
      status?: ContentPipelineStatus;
      seriesId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    data: ContentPieceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, seriesId, search, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const { items, total } = await this.contentPiecesRepository.findMany({
      userId,
      workspaceId,
      status,
      seriesId,
      search,
      skip,
      take: limit,
    });

    return {
      data: items.map((item) => this.mapToDto(item)),
      total,
      page,
      limit,
    };
  }

  async getPipelineView(
    userId: string,
    workspaceId: string,
  ): Promise<{
    scripting: ContentPieceResponseDto[];
    filming: ContentPieceResponseDto[];
    editing: ContentPieceResponseDto[];
    scheduled: ContentPieceResponseDto[];
    published: ContentPieceResponseDto[];
  }> {
    const pipeline = await this.contentPiecesRepository.getPipelineView(
      userId,
      workspaceId,
    );

    return {
      scripting: pipeline.scripting.map((item) => this.mapToDto(item)),
      filming: pipeline.filming.map((item) => this.mapToDto(item)),
      editing: pipeline.editing.map((item) => this.mapToDto(item)),
      scheduled: pipeline.scheduled.map((item) => this.mapToDto(item)),
      published: pipeline.published.map((item) => this.mapToDto(item)),
    };
  }

  async update(
    id: string,
    userId: string,
    workspaceId: string,
    dto: UpdateContentPieceDto,
  ): Promise<ContentPieceResponseDto> {
    const existing = await this.contentPiecesRepository.findById(
      id,
      workspaceId,
    );

    if (!existing) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this content piece',
      );
    }

    const { seriesId, scheduledAt, ...data } = dto;

    const updated = await this.contentPiecesRepository.update(id, {
      ...data,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      ...(seriesId !== undefined && {
        series: seriesId ? { connect: { id: seriesId } } : { disconnect: true },
      }),
    });

    return this.mapToDto(updated);
  }

  async updateStatus(
    id: string,
    userId: string,
    workspaceId: string,
    status: ContentPipelineStatus,
  ): Promise<ContentPieceResponseDto> {
    const existing = await this.contentPiecesRepository.findById(
      id,
      workspaceId,
    );

    if (!existing) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this content piece',
      );
    }

    // Validate status transitions
    this.validateStatusTransition(existing.status, status);

    const updated = await this.contentPiecesRepository.updateStatus(id, status);
    return this.mapToDto(updated);
  }

  async delete(id: string, userId: string, workspaceId: string): Promise<void> {
    const contentPiece = await this.contentPiecesRepository.findById(
      id,
      workspaceId,
    );

    if (!contentPiece) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    if (contentPiece.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this content piece',
      );
    }

    await this.contentPiecesRepository.softDelete(id);
  }

  private validateStatusTransition(
    currentStatus: ContentPipelineStatus,
    newStatus: ContentPipelineStatus,
  ): void {
    const validTransitions: Record<
      ContentPipelineStatus,
      ContentPipelineStatus[]
    > = {
      SCRIPTING: ['FILMING', 'ARCHIVED'],
      FILMING: ['SCRIPTING', 'EDITING', 'ARCHIVED'],
      EDITING: ['FILMING', 'SCHEDULED', 'ARCHIVED'],
      SCHEDULED: ['EDITING', 'PUBLISHED', 'ARCHIVED'],
      PUBLISHED: ['ARCHIVED'],
      ARCHIVED: ['SCRIPTING'], // Can restore to scripting
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed.join(', ')}`,
      );
    }
  }

  private mapToDto(
    contentPiece: ContentPiece & {
      series?: { id: string; name: string; color: string } | null;
      socialPosts?: Array<{
        id: string;
        platform: string;
        status: string;
        scheduledAt: Date | null;
        publishedAt: Date | null;
      }>;
    },
  ): ContentPieceResponseDto {
    return {
      id: contentPiece.id,
      title: contentPiece.title,
      description: contentPiece.description ?? undefined,
      status: contentPiece.status,
      statusChangedAt: contentPiece.statusChangedAt,
      contentType: contentPiece.contentType,
      script: contentPiece.script ?? undefined,
      notes: contentPiece.notes ?? undefined,
      scheduledAt: contentPiece.scheduledAt ?? undefined,
      publishedAt: contentPiece.publishedAt ?? undefined,
      thumbnailUrl: contentPiece.thumbnailUrl ?? undefined,
      ideaId: contentPiece.ideaId ?? undefined,
      seriesId: contentPiece.seriesId ?? undefined,
      episodeNumber: contentPiece.episodeNumber ?? undefined,
      userId: contentPiece.userId,
      workspaceId: contentPiece.workspaceId,
      createdAt: contentPiece.createdAt,
      updatedAt: contentPiece.updatedAt,
      series: contentPiece.series ?? undefined,
      socialPosts: contentPiece.socialPosts?.map((post) => ({
        id: post.id,
        platform: post.platform,
        status: post.status,
        scheduledAt: post.scheduledAt ?? undefined,
        publishedAt: post.publishedAt ?? undefined,
      })),
    };
  }
}
