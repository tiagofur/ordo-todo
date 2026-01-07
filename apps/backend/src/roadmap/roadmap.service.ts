import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RoadmapItem, RoadmapVote, calculateVoteWeight } from '@ordo-todo/core';
import type { IRoadmapRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { CreateRoadmapItemDto } from './dto/create-roadmap-item.dto';
import { UpdateRoadmapItemStatusDto } from './dto/update-roadmap-item-status.dto';
import { RoadmapStatus } from '@prisma/client';

@Injectable()
export class RoadmapService {
  constructor(
    @Inject('RoadmapRepository')
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly prisma: PrismaService, // Still needed for user/subscription lookup for now
  ) {}

  async create(data: CreateRoadmapItemDto) {
    const item = RoadmapItem.create({
      title: data.title,
      description: data.description,
    });

    return this.roadmapRepository.createItem(item);
  }

  async findAll(params: { skip?: number; take?: number; status?: string }) {
    return this.roadmapRepository.findAllItems({
      skip: params.skip,
      take: params.take,
      status: params.status as any,
    });
  }

  async findOne(id: string) {
    const item = await this.roadmapRepository.findItemById(id);
    if (!item) {
      throw new NotFoundException(`Roadmap item '${id}' not found`);
    }
    return item;
  }

  async updateStatus(id: string, dto: UpdateRoadmapItemStatusDto) {
    await this.findOne(id);
    return this.roadmapRepository.updateItem(id, { status: dto.status as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.roadmapRepository.deleteItem(id);
    return { success: true };
  }

  async vote(itemId: string, userId: string) {
    // Check if item exists
    await this.findOne(itemId);

    // Check if user already voted
    const hasVoted = await this.roadmapRepository.hasUserVoted(itemId, userId);
    if (hasVoted) {
      throw new BadRequestException('User already voted for this item');
    }

    // Determine weight based on subscription
    // Note: In a full DDD implementation, we might have a Subscription service or repository
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let weight = 1;
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      weight = calculateVoteWeight(user.subscription.plan);
    }

    const vote = RoadmapVote.create({
      itemId,
      userId,
      weight,
    });

    return this.roadmapRepository.createVote(vote);
  }

  async removeVote(itemId: string, userId: string) {
    const hasVoted = await this.roadmapRepository.hasUserVoted(itemId, userId);
    if (!hasVoted) {
      throw new NotFoundException('Vote not found');
    }

    return this.roadmapRepository.deleteVote(itemId, userId);
  }
}
