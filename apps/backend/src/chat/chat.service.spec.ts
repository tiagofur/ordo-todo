import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ProductivityCoachService } from './productivity-coach.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatConversation, ChatMessage } from '@ordo-todo/core';
import type { IChatRepository } from '@ordo-todo/core';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: jest.Mocked<IChatRepository>;
  let coachService: jest.Mocked<ProductivityCoachService>;

  const mockUserId = 'user-123';
  const mockConversationId = 'conv-456';

  const mockConversation = new ChatConversation({
    id: mockConversationId,
    userId: mockUserId,
    title: 'Test',
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
  });

  beforeEach(async () => {
    const mockChatRepository = {
      createConversation: jest.fn(),
      findConversationsByUserId: jest.fn(),
      findConversationById: jest.fn(),
      addMessage: jest.fn(),
      updateConversation: jest.fn(),
      deleteConversation: jest.fn(),
      getMessageHistory: jest.fn(),
      verifyOwnership: jest.fn(),
    };

    const mockCoachService = {
      chat: jest.fn(),
      getProactiveInsights: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: 'ChatRepository', useValue: mockChatRepository },
        { provide: ProductivityCoachService, useValue: mockCoachService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get('ChatRepository');
    coachService = module.get<ProductivityCoachService>(
      ProductivityCoachService,
    ) as jest.Mocked<ProductivityCoachService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation without initial message', async () => {
      chatRepository.createConversation.mockResolvedValue(mockConversation);

      const result = await service.createConversation(mockUserId, {
        title: 'Test',
      });

      expect(chatRepository.createConversation).toHaveBeenCalled();
      expect(result).toHaveProperty('id', mockConversationId);
    });

    it('should create conversation and send initial message', async () => {
      const mockMessage = new ChatMessage({
        id: 'msg-1',
        conversationId: mockConversationId,
        content: 'Hello',
        role: 'USER',
        createdAt: new Date(),
      });
      const mockAIResponse = new ChatMessage({
        id: 'msg-2',
        conversationId: mockConversationId,
        content: 'Hi!',
        role: 'ASSISTANT',
        createdAt: new Date(),
      });

      chatRepository.createConversation.mockResolvedValue(mockConversation);
      chatRepository.verifyOwnership.mockResolvedValue(true);
      chatRepository.getMessageHistory.mockResolvedValue([]);
      chatRepository.addMessage.mockResolvedValueOnce(mockMessage);
      chatRepository.addMessage.mockResolvedValueOnce(mockAIResponse);
      chatRepository.findConversationById.mockResolvedValue(mockConversation);
      coachService.chat.mockResolvedValue({
        message: 'Hi!',
        actions: [],
        suggestions: [],
      });

      const result = await service.createConversation(mockUserId, {
        title: 'Test',
        initialMessage: 'Hello',
      });

      expect(result).toHaveProperty('conversationId');
      expect(result).toHaveProperty('aiResponse');
    });
  });

  describe('getConversations', () => {
    it('should return paginated conversations', async () => {
      chatRepository.findConversationsByUserId.mockResolvedValue({
        conversations: [mockConversation],
        total: 1,
      });

      const result = await service.getConversations(mockUserId, {
        limit: 20,
        offset: 0,
      });

      expect(chatRepository.findConversationsByUserId).toHaveBeenCalledWith(
        mockUserId,
        {
          limit: 20,
          offset: 0,
        },
      );
      expect(result.total).toBe(1);
      expect(result.conversations).toHaveLength(1);
    });
  });

  describe('getConversation', () => {
    it('should return conversation with messages', async () => {
      const convWithMsg = new ChatConversation({
        ...mockConversation.props,
        messages: [
          new ChatMessage({
            id: 'msg-1',
            conversationId: mockConversationId,
            role: 'USER',
            content: 'Hello',
            createdAt: new Date(),
          }),
        ],
      });
      chatRepository.findConversationById.mockResolvedValue(convWithMsg);

      const result = await service.getConversation(
        mockConversationId,
        mockUserId,
      );

      expect(result).toHaveProperty('id', mockConversationId);
      expect(result.messages).toHaveLength(1);
    });

    it('should throw NotFoundException when conversation not found', async () => {
      chatRepository.findConversationById.mockResolvedValue(null);

      await expect(
        service.getConversation('non-existent', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    it('should send message and receive AI response', async () => {
      const mockUserMessage = new ChatMessage({
        id: 'msg-1',
        conversationId: mockConversationId,
        content: 'Hello',
        role: 'USER',
        createdAt: new Date(),
      });
      const mockAIMessage = new ChatMessage({
        id: 'msg-2',
        conversationId: mockConversationId,
        content: 'Hi!',
        role: 'ASSISTANT',
        createdAt: new Date(),
      });

      chatRepository.verifyOwnership.mockResolvedValue(true);
      chatRepository.getMessageHistory.mockResolvedValue([]);
      chatRepository.addMessage
        .mockResolvedValueOnce(mockUserMessage)
        .mockResolvedValueOnce(mockAIMessage);
      chatRepository.findConversationById.mockResolvedValue(mockConversation);
      coachService.chat.mockResolvedValue({
        message: 'Hi!',
        actions: [],
        suggestions: [],
      });

      const result = await service.sendMessage(mockConversationId, mockUserId, {
        message: 'Hello',
      });

      expect(result).toHaveProperty('conversationId', mockConversationId);
      expect(result.message.role).toBe('USER');
      expect(result.aiResponse.role).toBe('ASSISTANT');
    });

    it('should throw ForbiddenException when user does not own conversation', async () => {
      chatRepository.verifyOwnership.mockResolvedValue(false);

      await expect(
        service.sendMessage(mockConversationId, mockUserId, {
          message: 'Hello',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('archiveConversation', () => {
    it('should archive conversation when owned', async () => {
      chatRepository.verifyOwnership.mockResolvedValue(true);
      chatRepository.updateConversation.mockResolvedValue(undefined);

      await service.archiveConversation(mockConversationId, mockUserId);

      expect(chatRepository.updateConversation).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
        expect.objectContaining({ isArchived: true }),
      );
    });
  });
});
