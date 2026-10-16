import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SeriesRepository } from './series.repository';
import { CreateSeriesDto, UpdateSeriesDto, SeriesResponseDto } from './dto';
import { Series } from '@prisma/client';

@Injectable()
export class SeriesService {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateSeriesDto,
  ): Promise<SeriesResponseDto> {
    const series = await this.seriesRepository.create({
      ...dto,
      seriesType: dto.seriesType || 'EPISODIC',
      user: { connect: { id: userId } },
      workspace: { connect: { id: workspaceId } },
    });

    return this.mapToDto(series);
  }

  async findById(
    id: string,
    userId: string,
    workspaceId: string,
  ): Promise<SeriesResponseDto> {
    const series = await this.seriesRepository.findById(id, workspaceId);

    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    if (series.userId !== userId) {
      throw new ForbiddenException('You do not have access to this series');
    }

    return this.mapToDto(series);
  }

  async findMany(
    userId: string,
    workspaceId: string,
    options: { isActive?: boolean; page?: number; limit?: number } = {},
  ): Promise<{
    data: SeriesResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { isActive, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const { items, total } = await this.seriesRepository.findMany(
      userId,
      workspaceId,
      {
        isActive,
        skip,
        take: limit,
      },
    );

    return {
      data: items.map((item) => this.mapToDto(item)),
      total,
      page,
      limit,
    };
  }

  async update(
    id: string,
    userId: string,
    workspaceId: string,
    dto: UpdateSeriesDto,
  ): Promise<SeriesResponseDto> {
    const existing = await this.seriesRepository.findById(id, workspaceId);

    if (!existing) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have access to this series');
    }

    const updated = await this.seriesRepository.update(id, dto);
    return this.mapToDto(updated);
  }

  async delete(id: string, userId: string, workspaceId: string): Promise<void> {
    const series = await this.seriesRepository.findById(id, workspaceId);

    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    if (series.userId !== userId) {
      throw new ForbiddenException('You do not have access to this series');
    }

    await this.seriesRepository.delete(id);
  }

  async addContentPiece(
    seriesId: string,
    contentPieceId: string,
    userId: string,
    workspaceId: string,
    episodeNumber?: number,
  ): Promise<SeriesResponseDto> {
    const series = await this.seriesRepository.findById(seriesId, workspaceId);

    if (!series) {
      throw new NotFoundException(`Series with ID ${seriesId} not found`);
    }

    if (series.userId !== userId) {
      throw new ForbiddenException('You do not have access to this series');
    }

    // Auto-assign episode number if not provided
    const epNumber =
      episodeNumber ??
      (await this.seriesRepository.getNextEpisodeNumber(seriesId));
    await this.seriesRepository.addContentPiece(
      seriesId,
      contentPieceId,
      epNumber,
    );

    const updated = await this.seriesRepository.findById(seriesId, workspaceId);
    return this.mapToDto(updated!);
  }

  async removeContentPiece(
    seriesId: string,
    contentPieceId: string,
    userId: string,
    workspaceId: string,
  ): Promise<SeriesResponseDto> {
    const series = await this.seriesRepository.findById(seriesId, workspaceId);

    if (!series) {
      throw new NotFoundException(`Series with ID ${seriesId} not found`);
    }

    if (series.userId !== userId) {
      throw new ForbiddenException('You do not have access to this series');
    }

    await this.seriesRepository.removeContentPiece(contentPieceId);

    const updated = await this.seriesRepository.findById(seriesId, workspaceId);
    return this.mapToDto(updated!);
  }

  private mapToDto(
    series: Series & {
      contentPieces?: Array<{
        id: string;
        title: string;
        status: string;
        episodeNumber: number | null;
      }>;
      _count?: { contentPieces: number };
    },
  ): SeriesResponseDto {
    return {
      id: series.id,
      name: series.name,
      description: series.description ?? undefined,
      color: series.color,
      coverImage: series.coverImage ?? undefined,
      seriesType: series.seriesType,
      isActive: series.isActive,
      userId: series.userId,
      workspaceId: series.workspaceId,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      contentCount: series._count?.contentPieces,
      contentPieces: series.contentPieces?.map((cp) => ({
        id: cp.id,
        title: cp.title,
        status: cp.status,
        episodeNumber: cp.episodeNumber ?? undefined,
      })),
    };
  }
}
