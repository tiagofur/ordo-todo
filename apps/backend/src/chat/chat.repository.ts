import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChatRole, Prisma } from '@prisma/client';

export interface CreateConversationData {
  userId: string;
  title?: string;
  context?: any;
}

export interface CreateMessageData {
  conversationId: string;
  role: ChatRole;
  content: string;
  metadata?: any;
}

export interface GetConversationsOptions {
  limit?: number;
  offset?: number;
  includeArchived?: boolean;
}

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationData) {
    return this.prisma.chatConversation.create({
      data: {
        userId: data.userId,
        title: data.title,
        context: data.context,
      },
      include: {
        messages: true,
      },
    });
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string,
    options: GetConversationsOptions = {},
  ) {
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
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.chatConversation.count({ where }),
    ]);

    return {
      conversations: conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        context: conv.context,
        messageCount: conv._count.messages,
        lastMessage: conv.messages[0]?.content,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single conversation with all messages
   */
  async getConversation(id: string, userId: string) {
    return this.prisma.chatConversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(data: CreateMessageData) {
    // Update conversation updatedAt and add message in transaction
    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          conversationId: data.conversationId,
          role: data.role,
          content: data.content,
          metadata: data.metadata,
        },
      }),
      this.prisma.chatConversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(id: string, userId: string, title: string) {
    return this.prisma.chatConversation.updateMany({
      where: { id, userId },
      data: { title },
    });
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(id: string, userId: string) {
    return this.prisma.chatConversation.updateMany({
      where: { id, userId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Delete a conversation (hard delete)
   */
  async deleteConversation(id: string, userId: string) {
    return this.prisma.chatConversation.deleteMany({
      where: { id, userId },
    });
  }

  /**
   * Get message history for a conversation (for AI context)
   */
  async getMessageHistory(conversationId: string, limit = 20) {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Verify conversation ownership
   */
  async verifyOwnership(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    return !!conversation;
  }
}
