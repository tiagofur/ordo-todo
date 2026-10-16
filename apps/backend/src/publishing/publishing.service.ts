import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PublishingRepository } from './publishing.repository';
import { ContentPiecesService } from '../content-pieces/content-pieces.service';
import {
  CreateSocialPostDto,
  UpdateSocialPostDto,
  BulkScheduleDto,
  SocialPostResponseDto,
} from './dto';
import { SocialPost, ContentPlatform } from '@prisma/client';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    private readonly publishingRepository: PublishingRepository,
    private readonly contentPiecesService: ContentPiecesService,
  ) {}

  async create(
    userId: string,
    dto: CreateSocialPostDto,
  ): Promise<SocialPostResponseDto> {
    const post = await this.publishingRepository.create({
      contentPiece: { connect: { id: dto.contentPieceId } },
      platform: dto.platform,
      title: dto.title,
      description: dto.description,
      hashtags: dto.hashtags || [],
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      userId,
    });

    return this.mapToDto(post);
  }

  async bulkSchedule(
    userId: string,
    dto: BulkScheduleDto,
  ): Promise<SocialPostResponseDto[]> {
    const posts: SocialPostResponseDto[] = [];

    for (const platformConfig of dto.platforms) {
      const post = await this.create(userId, {
        contentPieceId: dto.contentPieceId,
        platform: platformConfig.platform,
        scheduledAt: platformConfig.scheduledAt,
        title: platformConfig.title,
        description: platformConfig.description,
        hashtags: platformConfig.hashtags,
      });
      posts.push(post);
    }

    return posts;
  }

  async findById(id: string, userId: string): Promise<SocialPostResponseDto> {
    const post = await this.publishingRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Social post with ID ${id} not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    return this.mapToDto(post);
  }

  async findByContentPiece(
    contentPieceId: string,
  ): Promise<SocialPostResponseDto[]> {
    const posts =
      await this.publishingRepository.findByContentPiece(contentPieceId);
    return posts.map((post) => this.mapToDto(post));
  }

  async getScheduledPosts(
    userId: string,
    options: {
      from?: string;
      to?: string;
      platform?: ContentPlatform;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ data: SocialPostResponseDto[]; total: number }> {
    const { from, to, platform, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const { items, total } = await this.publishingRepository.findScheduled(
      userId,
      {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        platform,
        skip,
        take: limit,
      },
    );

    return {
      data: items.map((item) => this.mapToDto(item)),
      total,
    };
  }

  async getCalendarView(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<SocialPostResponseDto[]> {
    const posts = await this.publishingRepository.getCalendarView(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
    return posts.map((post) => this.mapToDto(post));
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSocialPostDto,
  ): Promise<SocialPostResponseDto> {
    const existing = await this.publishingRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Social post with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    if (existing.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot edit a published post');
    }

    const updated = await this.publishingRepository.update(id, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    return this.mapToDto(updated);
  }

  async schedule(
    id: string,
    userId: string,
    scheduledAt: string,
  ): Promise<SocialPostResponseDto> {
    const existing = await this.publishingRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Social post with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    const updated = await this.publishingRepository.update(id, {
      scheduledAt: new Date(scheduledAt),
      status: 'SCHEDULED',
    });

    return this.mapToDto(updated);
  }

  async unschedule(id: string, userId: string): Promise<SocialPostResponseDto> {
    const existing = await this.publishingRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Social post with ID ${id} not found`);
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    const updated = await this.publishingRepository.update(id, {
      scheduledAt: null,
      status: 'DRAFT',
    });

    return this.mapToDto(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.publishingRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Social post with ID ${id} not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    if (post.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot delete a published post');
    }

    await this.publishingRepository.delete(id);
  }

  // Cron job to process scheduled posts
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts(): Promise<void> {
    const duePosts = await this.publishingRepository.findDueForPublishing();

    for (const post of duePosts) {
      try {
        // Mark as publishing
        await this.publishingRepository.updateStatus(post.id, 'PUBLISHING');

        // TODO: Integrate with actual social media APIs
        // For now, we simulate publishing
        this.logger.log(`Publishing post ${post.id} to ${post.platform}`);

        // Mark as published (simulation)
        await this.publishingRepository.updateStatus(post.id, 'PUBLISHED', {
          publishedAt: new Date(),
          platformPostId: `simulated_${post.id}`,
          platformUrl: `https://${post.platform.toLowerCase()}.com/post/${post.id}`,
        });

        this.logger.log(
          `Successfully published post ${post.id} to ${post.platform}`,
        );
      } catch (error) {
        this.logger.error(`Failed to publish post ${post.id}: ${error}`);
        await this.publishingRepository.updateStatus(post.id, 'FAILED', {
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private mapToDto(
    post: SocialPost & {
      contentPiece?: { id: string; title: string; status: string };
    },
  ): SocialPostResponseDto {
    return {
      id: post.id,
      contentPieceId: post.contentPieceId,
      platform: post.platform,
      title: post.title ?? undefined,
      description: post.description ?? undefined,
      hashtags: post.hashtags,
      scheduledAt: post.scheduledAt ?? undefined,
      publishedAt: post.publishedAt ?? undefined,
      status: post.status,
      platformPostId: post.platformPostId ?? undefined,
      platformUrl: post.platformUrl ?? undefined,
      errorMessage: post.errorMessage ?? undefined,
      views: post.views ?? undefined,
      likes: post.likes ?? undefined,
      comments: post.comments ?? undefined,
      shares: post.shares ?? undefined,
      userId: post.userId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      contentPiece: post.contentPiece,
    };
  }
}
