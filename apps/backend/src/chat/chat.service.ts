import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ChatConversation, ChatMessage } from '@ordo-todo/core';
import type { IChatRepository } from '@ordo-todo/core';
import {
  ProductivityCoachService,
  CoachResponse,
} from './productivity-coach.service';
import {
  CreateConversationDto,
  SendMessageDto,
  ConversationResponseDto,
  ConversationDetailDto,
  SendMessageResponseDto,
  ChatMessageResponseDto,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject('ChatRepository')
    private readonly chatRepository: IChatRepository,
    private readonly coachService: ProductivityCoachService,
  ) {}

  /**
   * Create a new conversation, optionally with an initial message
   */
  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationDetailDto | SendMessageResponseDto> {
    // Create the conversation
    const conversationEntity = ChatConversation.create({
      userId,
      title: dto.title,
      context:
        dto.workspaceId || dto.projectId
          ? { workspaceId: dto.workspaceId, projectId: dto.projectId }
          : null,
    });

    const conversation =
      await this.chatRepository.createConversation(conversationEntity);

    // If there's an initial message, process it
    if (dto.initialMessage) {
      return this.sendMessage(conversation.id as string, userId, {
        message: dto.initialMessage,
      });
    }

    return {
      id: conversation.id as string,
      title: conversation.title ?? null,
      context: conversation.props.context ?? null,
      messages: [],
      isArchived: conversation.isArchived,
      createdAt: conversation.props.createdAt!,
      updatedAt: conversation.props.updatedAt!,
    };
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string,
    options?: { limit?: number; offset?: number; includeArchived?: boolean },
  ): Promise<{
    conversations: ConversationResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { conversations, total } =
      await this.chatRepository.findConversationsByUserId(userId, options);

    return {
      conversations: conversations.map((conv) => ({
        id: conv.id as string,
        title: conv.title ?? null,
        context: conv.props.context ?? null,
        messageCount: conv.props.messages?.length || 0,
        lastMessage: conv.props.messages?.[0]?.content,
        createdAt: conv.props.createdAt!,
        updatedAt: conv.props.updatedAt!,
      })),
      total,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };
  }

  /**
   * Get a single conversation with all messages
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailDto> {
    const conversation = await this.chatRepository.findConversationById(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: conversation.id as string,
      title: conversation.title ?? null,
      context: conversation.props.context ?? null,
      messages: (conversation.props.messages || []).map((m) => ({
        id: m.id as string,
        role: m.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
        content: m.content,
        metadata: m.metadata as
          | {
              actions?: Array<{
                type: string;
                data?: any;
                result?: any;
              }>;
              suggestions?: string[];
              modelUsed?: string;
              processingTimeMs?: number;
            }
          | undefined,
        createdAt: m.createdAt,
      })),
      isArchived: conversation.isArchived,
      createdAt: conversation.props.createdAt!,
      updatedAt: conversation.props.updatedAt!,
    };
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    // Verify ownership
    const isOwner = await this.chatRepository.verifyOwnership(
      conversationId,
      userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Not authorized to access this conversation',
      );
    }

    // Get conversation history for context (recent 20)
    const history = await this.chatRepository.getMessageHistory(
      conversationId,
      20,
    );

    // Repositories usually return recent first, reverse to get chronological order for AI
    const chronologicalHistory = [...history].reverse();

    const startTime = Date.now();

    // Save user message
    const userMessageEntity = ChatMessage.create({
      conversationId,
      role: 'USER',
      content: dto.message,
    });
    const userMessage = await this.chatRepository.addMessage(userMessageEntity);

    // Get AI response from coach
    const aiResponse: CoachResponse = await this.coachService.chat(
      userId,
      dto.message,
      chronologicalHistory.map((m) => ({
        role: m.role as any,
        content: m.content,
      })),
    );

    const processingTime = Date.now() - startTime;

    // Save AI response
    const assistantMessageEntity = ChatMessage.create({
      conversationId,
      role: 'ASSISTANT',
      content: aiResponse.message,
      metadata: {
        actions: aiResponse.actions,
        suggestions: aiResponse.suggestions,
        processingTimeMs: processingTime,
      },
    });
    const assistantMessage = await this.chatRepository.addMessage(
      assistantMessageEntity,
    );

    // Auto-generate title from first message if not set
    const conversation = await this.chatRepository.findConversationById(
      conversationId,
      userId,
    );
    if (!conversation?.title && history.length === 0) {
      const title = this.generateTitle(dto.message);
      await this.chatRepository.updateConversation(conversationId, userId, {
        title,
      });
    }

    this.logger.debug(
      `Message processed in ${processingTime}ms for conversation ${conversationId}`,
    );

    return {
      conversationId,
      message: {
        id: userMessage.id as string,
        role: 'USER',
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      aiResponse: {
        id: assistantMessage.id as string,
        role: 'ASSISTANT',
        content: assistantMessage.content,
        metadata:
          assistantMessage.metadata as ChatMessageResponseDto['metadata'],
        createdAt: assistantMessage.createdAt,
      },
    };
  }

  /**
   * Update conversation title
   */
  async updateTitle(
    conversationId: string,
    userId: string,
    title: string,
  ): Promise<void> {
    const isOwner = await this.chatRepository.verifyOwnership(
      conversationId,
      userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Not authorized to access this conversation',
      );
    }

    await this.chatRepository.updateConversation(conversationId, userId, {
      title,
    });
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const isOwner = await this.chatRepository.verifyOwnership(
      conversationId,
      userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Not authorized to access this conversation',
      );
    }

    await this.chatRepository.updateConversation(conversationId, userId, {
      isArchived: true,
      archivedAt: new Date(),
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const isOwner = await this.chatRepository.verifyOwnership(
      conversationId,
      userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Not authorized to access this conversation',
      );
    }

    await this.chatRepository.deleteConversation(conversationId, userId);
  }

  /**
   * Get proactive insights for user
   */
  async getInsights(userId: string) {
    const insights = await this.coachService.getProactiveInsights(userId);
    return { insights };
  }

  // ============ PRIVATE HELPERS ============

  private generateTitle(firstMessage: string): string {
    // Take first 50 chars, clean up, and use as title
    const clean = firstMessage
      .replace(/[\n\r]/g, ' ')
      .trim()
      .substring(0, 50);
    return clean.length < firstMessage.length ? `${clean}...` : clean;
  }
}
