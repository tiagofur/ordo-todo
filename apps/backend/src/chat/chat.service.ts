import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import {
  ProductivityCoachService,
  CoachResponse,
} from './productivity-coach.service';
import { ChatRole } from '@prisma/client';
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
    private readonly chatRepository: ChatRepository,
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
    const conversation = await this.chatRepository.createConversation({
      userId,
      title: dto.title,
      context:
        dto.workspaceId || dto.projectId
          ? { workspaceId: dto.workspaceId, projectId: dto.projectId }
          : null,
    });

    // If there's an initial message, process it
    if (dto.initialMessage) {
      return this.sendMessage(conversation.id, userId, {
        message: dto.initialMessage,
      });
    }

    return {
      id: conversation.id,
      title: conversation.title,
      context: conversation.context,
      messages: [],
      isArchived: conversation.isArchived,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
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
    return this.chatRepository.getConversations(userId, options);
  }

  /**
   * Get a single conversation with all messages
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetailDto> {
    const conversation = await this.chatRepository.getConversation(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      id: conversation.id,
      title: conversation.title,
      context: conversation.context,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
        content: m.content,
        metadata: m.metadata as any,
        createdAt: m.createdAt,
      })),
      isArchived: conversation.isArchived,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
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

    // Get conversation history for context
    const history = await this.chatRepository.getMessageHistory(
      conversationId,
      20,
    );

    // Reverse to get chronological order
    const chronologicalHistory = history.reverse();

    const startTime = Date.now();

    // Save user message
    const userMessage = await this.chatRepository.addMessage({
      conversationId,
      role: ChatRole.USER,
      content: dto.message,
    });

    // Get AI response from coach
    const aiResponse: CoachResponse = await this.coachService.chat(
      userId,
      dto.message,
      chronologicalHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    );

    const processingTime = Date.now() - startTime;

    // Save AI response
    const assistantMessage = await this.chatRepository.addMessage({
      conversationId,
      role: ChatRole.ASSISTANT,
      content: aiResponse.message,
      metadata: {
        actions: aiResponse.actions,
        suggestions: aiResponse.suggestions,
        processingTimeMs: processingTime,
      },
    });

    // Auto-generate title from first message if not set
    const conversation = await this.chatRepository.getConversation(
      conversationId,
      userId,
    );
    if (!conversation?.title && chronologicalHistory.length === 0) {
      const title = this.generateTitle(dto.message);
      await this.chatRepository.updateConversationTitle(
        conversationId,
        userId,
        title,
      );
    }

    this.logger.debug(
      `Message processed in ${processingTime}ms for conversation ${conversationId}`,
    );

    return {
      conversationId,
      message: {
        id: userMessage.id,
        role: 'USER',
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      aiResponse: {
        id: assistantMessage.id,
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

    await this.chatRepository.updateConversationTitle(
      conversationId,
      userId,
      title,
    );
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

    await this.chatRepository.archiveConversation(conversationId, userId);
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
    return this.coachService.getProactiveInsights(userId);
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
