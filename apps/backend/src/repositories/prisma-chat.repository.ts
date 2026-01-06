import { Injectable } from '@nestjs/common';
import {
    ChatConversation,
    ChatMessage,
    ChatConversationProps,
    GetConversationsOptions,
    GetConversationsResult,
} from '@ordo-todo/core';
import type { IChatRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
    ChatConversation as PrismaChatConversation,
    ChatMessage as PrismaChatMessage,
    ChatRole as PrismaChatRole,
    Prisma,
} from '@prisma/client';

/**
 * Prisma implementation of the IChatRepository interface.
 */
@Injectable()
export class PrismaChatRepository implements IChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createConversation(conversation: ChatConversation): Promise<ChatConversation> {
        const created = await this.prisma.chatConversation.create({
            data: {
                id: conversation.id as string,
                userId: conversation.props.userId,
                title: conversation.props.title,
                context: conversation.props.context as Prisma.InputJsonValue,
                isArchived: conversation.props.isArchived,
            },
            include: {
                messages: true,
            },
        });

        return this.conversationToDomain(created, created.messages);
    }

    async findConversationById(id: string, userId: string): Promise<ChatConversation | null> {
        const conversation = await this.prisma.chatConversation.findFirst({
            where: { id, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        return conversation ? this.conversationToDomain(conversation, conversation.messages) : null;
    }

    async findConversationsByUserId(
        userId: string,
        options: GetConversationsOptions = {}
    ): Promise<GetConversationsResult> {
        const { limit = 20, offset = 0, includeArchived = false } = options;

        const where: Prisma.ChatConversationWhereInput = {
            userId,
            ...(includeArchived ? {} : { isArchived: false }),
        };

        const [conversations, total] = await Promise.all([
            this.prisma.chatConversation.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            }),
            this.prisma.chatConversation.count({ where }),
        ]);

        return {
            conversations: conversations.map((conv) => this.conversationToDomain(conv, conv.messages)),
            total,
        };
    }

    async updateConversation(id: string, userId: string, data: Partial<ChatConversationProps>): Promise<void> {
        const updateData: Prisma.ChatConversationUpdateInput = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;
        if (data.archivedAt !== undefined) updateData.archivedAt = data.archivedAt;
        if (data.context !== undefined) updateData.context = data.context as Prisma.InputJsonValue;
        updateData.updatedAt = new Date();

        await this.prisma.chatConversation.updateMany({
            where: { id, userId },
            data: updateData,
        });
    }

    async deleteConversation(id: string, userId: string): Promise<void> {
        await this.prisma.chatConversation.deleteMany({
            where: { id, userId },
        });
    }

    async addMessage(message: ChatMessage): Promise<ChatMessage> {
        const [createdMessage] = await this.prisma.$transaction([
            this.prisma.chatMessage.create({
                data: {
                    id: message.id as string,
                    conversationId: message.props.conversationId,
                    role: message.props.role as PrismaChatRole,
                    content: message.props.content,
                    metadata: message.props.metadata as Prisma.InputJsonValue,
                },
            }),
            this.prisma.chatConversation.update({
                where: { id: message.props.conversationId },
                data: { updatedAt: new Date() },
            }),
        ]);

        return this.messageToDomain(createdMessage);
    }

    async getMessageHistory(conversationId: string, limit = 20): Promise<ChatMessage[]> {
        const messages = await this.prisma.chatMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // Normally history is used in ascending order for AI, but repository usually follows the sorting if specified or default
        // Let's return as found (descending for recent ones)
        return messages.map((m) => this.messageToDomain(m));
    }

    async verifyOwnership(conversationId: string, userId: string): Promise<boolean> {
        const conversation = await this.prisma.chatConversation.findFirst({
            where: { id: conversationId, userId },
            select: { id: true },
        });
        return !!conversation;
    }

    // ============ Domain Mappers ============

    private conversationToDomain(
        prismaConv: PrismaChatConversation,
        prismaMessages: PrismaChatMessage[] = []
    ): ChatConversation {
        return new ChatConversation({
            id: prismaConv.id,
            userId: prismaConv.userId,
            title: prismaConv.title ?? undefined,
            context: prismaConv.context as any,
            isArchived: prismaConv.isArchived,
            archivedAt: prismaConv.archivedAt ?? undefined,
            createdAt: prismaConv.createdAt,
            updatedAt: prismaConv.updatedAt,
            messages: prismaMessages.map((m) => this.messageToDomain(m)),
        });
    }

    private messageToDomain(prismaMsg: PrismaChatMessage): ChatMessage {
        return new ChatMessage({
            id: prismaMsg.id,
            conversationId: prismaMsg.conversationId,
            role: prismaMsg.role as any,
            content: prismaMsg.content,
            metadata: prismaMsg.metadata as any,
            createdAt: prismaMsg.createdAt,
        });
    }
}
