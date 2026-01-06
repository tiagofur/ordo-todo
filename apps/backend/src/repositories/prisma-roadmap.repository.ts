import { Injectable } from '@nestjs/common';
import {
    RoadmapItem,
    RoadmapItemProps,
    RoadmapStatus as CoreRoadmapStatus,
    RoadmapVote,
} from '@ordo-todo/core';
import type { IRoadmapRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
    RoadmapItem as PrismaRoadmapItem,
    RoadmapVote as PrismaRoadmapVote,
    RoadmapStatus as PrismaRoadmapStatus,
} from '@prisma/client';

/**
 * Prisma implementation of the IRoadmapRepository interface.
 */
@Injectable()
export class PrismaRoadmapRepository implements IRoadmapRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============ RoadmapItem Operations ============

    async findItemById(id: string): Promise<RoadmapItem | null> {
        const item = await this.prisma.roadmapItem.findUnique({
            where: { id },
        });

        return item ? this.itemToDomain(item) : null;
    }

    async findAllItems(params?: {
        skip?: number;
        take?: number;
        status?: CoreRoadmapStatus;
    }): Promise<RoadmapItem[]> {
        const items = await this.prisma.roadmapItem.findMany({
            skip: params?.skip,
            take: params?.take,
            where: params?.status
                ? { status: params.status as PrismaRoadmapStatus }
                : undefined,
            orderBy: { totalVotes: 'desc' },
        });

        return items.map((item) => this.itemToDomain(item));
    }

    async createItem(item: RoadmapItem): Promise<RoadmapItem> {
        const created = await this.prisma.roadmapItem.create({
            data: {
                id: item.id as string,
                title: item.props.title,
                description: item.props.description,
                status: item.props.status as PrismaRoadmapStatus,
                totalVotes: item.props.totalVotes,
            },
        });

        return this.itemToDomain(created);
    }

    async updateItem(
        id: string,
        data: Partial<RoadmapItemProps>,
    ): Promise<RoadmapItem> {
        const updateData: Record<string, unknown> = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status as PrismaRoadmapStatus;
        if (data.totalVotes !== undefined) updateData.totalVotes = data.totalVotes;

        const updated = await this.prisma.roadmapItem.update({
            where: { id },
            data: updateData,
        });

        return this.itemToDomain(updated);
    }

    async deleteItem(id: string): Promise<void> {
        await this.prisma.roadmapItem.delete({ where: { id } });
    }

    // ============ RoadmapVote Operations ============

    async findVote(itemId: string, userId: string): Promise<RoadmapVote | null> {
        const vote = await this.prisma.roadmapVote.findUnique({
            where: { itemId_userId: { itemId, userId } },
        });

        return vote ? this.voteToDomain(vote) : null;
    }

    async createVote(
        vote: RoadmapVote,
    ): Promise<{ vote: RoadmapVote; item: RoadmapItem }> {
        const result = await this.prisma.$transaction(async (tx) => {
            const createdVote = await tx.roadmapVote.create({
                data: {
                    id: vote.id as string,
                    itemId: vote.props.itemId,
                    userId: vote.props.userId,
                    weight: vote.props.weight,
                },
            });

            const updatedItem = await tx.roadmapItem.update({
                where: { id: vote.props.itemId },
                data: {
                    totalVotes: { increment: vote.props.weight },
                },
            });

            return { vote: createdVote, item: updatedItem };
        });

        return {
            vote: this.voteToDomain(result.vote),
            item: this.itemToDomain(result.item),
        };
    }

    async deleteVote(itemId: string, userId: string): Promise<RoadmapItem> {
        const existingVote = await this.prisma.roadmapVote.findUnique({
            where: { itemId_userId: { itemId, userId } },
        });

        if (!existingVote) {
            throw new Error('Vote not found');
        }

        const updatedItem = await this.prisma.$transaction(async (tx) => {
            await tx.roadmapVote.delete({
                where: { id: existingVote.id },
            });

            return tx.roadmapItem.update({
                where: { id: itemId },
                data: {
                    totalVotes: { decrement: existingVote.weight },
                },
            });
        });

        return this.itemToDomain(updatedItem);
    }

    async hasUserVoted(itemId: string, userId: string): Promise<boolean> {
        const vote = await this.prisma.roadmapVote.findUnique({
            where: { itemId_userId: { itemId, userId } },
        });
        return !!vote;
    }

    // ============ Domain Mappers ============

    private itemToDomain(prismaItem: PrismaRoadmapItem): RoadmapItem {
        return new RoadmapItem({
            id: prismaItem.id,
            title: prismaItem.title,
            description: prismaItem.description,
            status: prismaItem.status as CoreRoadmapStatus,
            totalVotes: prismaItem.totalVotes,
            createdAt: prismaItem.createdAt,
            updatedAt: prismaItem.updatedAt,
        });
    }

    private voteToDomain(prismaVote: PrismaRoadmapVote): RoadmapVote {
        return new RoadmapVote({
            id: prismaVote.id,
            itemId: prismaVote.itemId,
            userId: prismaVote.userId,
            weight: prismaVote.weight,
            createdAt: prismaVote.createdAt,
        });
    }
}
