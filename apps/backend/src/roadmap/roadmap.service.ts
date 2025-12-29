import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoadmapItemDto } from './dto/create-roadmap-item.dto';
import { UpdateRoadmapItemStatusDto } from './dto/update-roadmap-item-status.dto';
import { Prisma, RoadmapStatus, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class RoadmapService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateRoadmapItemDto) {
        return this.prisma.roadmapItem.create({
            data: {
                ...data,
                status: RoadmapStatus.CONSIDERING,
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.RoadmapItemWhereInput;
        orderBy?: Prisma.RoadmapItemOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.roadmapItem.findMany({
            skip,
            take,
            where,
            orderBy: orderBy || { totalVotes: 'desc' }, // Default sort by votes
        });
    }

    async findOne(id: string) {
        const item = await this.prisma.roadmapItem.findUnique({
            where: { id },
        });
        if (!item) {
            throw new NotFoundException(`Roadmap item '${id}' not found`);
        }
        return item;
    }

    async updateStatus(id: string, dto: UpdateRoadmapItemStatusDto) {
        await this.findOne(id);
        return this.prisma.roadmapItem.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async delete(id: string) {
        await this.findOne(id);
        return this.prisma.roadmapItem.delete({
            where: { id },
        });
    }

    async vote(itemId: string, userId: string) {
        // Check if item exists
        const item = await this.findOne(itemId);

        // Check if user already voted
        const existingVote = await this.prisma.roadmapVote.findUnique({
            where: {
                itemId_userId: { itemId, userId },
            },
        });

        if (existingVote) {
            throw new BadRequestException('User already voted for this item');
        }

        // Determine weight based on subscription
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });

        if (!user) {
            throw new NotFoundException('User not found'); // Should not happen if guarded
        }

        let weight = 1;
        if (user.subscription && user.subscription.status === 'ACTIVE') {
            switch (user.subscription.plan) {
                case SubscriptionPlan.PRO:
                    weight = 3;
                    break;
                case SubscriptionPlan.TEAM:
                    weight = 5;
                    break;
                case SubscriptionPlan.ENTERPRISE:
                    weight = 10;
                    break;
                default:
                    weight = 1;
            }
        }

        // Transaction: Create vote and update totalVotes
        return this.prisma.$transaction(async (tx) => {
            const vote = await tx.roadmapVote.create({
                data: {
                    itemId,
                    userId,
                    weight,
                },
            });

            const updatedItem = await tx.roadmapItem.update({
                where: { id: itemId },
                data: {
                    totalVotes: { increment: weight },
                },
            });

            return { vote, item: updatedItem };
        });
    }

    async removeVote(itemId: string, userId: string) {
        const existingVote = await this.prisma.roadmapVote.findUnique({
            where: { itemId_userId: { itemId, userId } },
        });

        if (!existingVote) {
            throw new NotFoundException('Vote not found');
        }

        // Transaction: Delete vote and decrement totalVotes
        return this.prisma.$transaction(async (tx) => {
            await tx.roadmapVote.delete({
                where: { id: existingVote.id },
            });

            const updatedItem = await tx.roadmapItem.update({
                where: { id: itemId },
                data: {
                    totalVotes: { decrement: existingVote.weight },
                },
            });

            return updatedItem;
        });
    }
}
