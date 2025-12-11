import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ProductivityCoachService } from './productivity-coach.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatRole } from '@prisma/client';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: jest.Mocked<ChatRepository>;
  let coachService: jest.Mocked<ProductivityCoachService>;

  const mockUserId = 'user-123';
  const mockConversationId = 'conv-456';

  beforeEach(async () => {
    const mockChatRepository = {
      createConversation: jest.fn(),
      getConversations: jest.fn(),
      getConversation: jest.fn(),
      addMessage: jest.fn(),
      updateConversationTitle: jest.fn(),
      archiveConversation: jest.fn(),
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
        { provide: ChatRepository, useValue: mockChatRepository },
        { provide: ProductivityCoachService, useValue: mockCoachService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepository = module.get<ChatRepository>(
      ChatRepository,
    ) as jest.Mocked<ChatRepository>;
    coachService = module.get<ProductivityCoachService>(
      ProductivityCoachService,
    ) as jest.Mocked<ProductivityCoachService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConversation', () => {
    it('should create a conversation without initial message', async () => {
      const mockConversation = {
        id: mockConversationId,
        title: 'Test',
        context: null,
        messages: [],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      chatRepository.createConversation.mockResolvedValue(
        mockConversation as any,
      );

      const result = await service.createConversation(mockUserId, {
        title: 'Test',
      });

      expect(chatRepository.createConversation).toHaveBeenCalledWith({
        userId: mockUserId,
        title: 'Test',
        context: null,
      });
      expect(result).toHaveProperty('id', mockConversationId);
    });

    it('should create conversation and send initial message', async () => {
      const mockConversation = {
        id: mockConversationId,
        title: 'Test',
        context: null,
        messages: [],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockMessage = {
        id: 'msg-1',
        content: 'Hello',
        role: ChatRole.USER,
        createdAt: new Date(),
      };
      const mockAIResponse = {
        id: 'msg-2',
        content: 'Hi!',
        role: ChatRole.ASSISTANT,
        createdAt: new Date(),
        metadata: null,
      };

      chatRepository.createConversation.mockResolvedValue(
        mockConversation as any,
      );
      chatRepository.verifyOwnership.mockResolvedValue(true);
      chatRepository.getMessageHistory.mockResolvedValue([]);
      chatRepository.addMessage.mockResolvedValueOnce(mockMessage as any);
      chatRepository.addMessage.mockResolvedValueOnce(mockAIResponse as any);
      chatRepository.getConversation.mockResolvedValue({
        ...mockConversation,
        title: null,
      } as any);
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
      const mockResult = {
        conversations: [{ id: 'conv-1', title: 'Chat 1', messageCount: 5 }],
        total: 1,
        limit: 20,
        offset: 0,
      };
      chatRepository.getConversations.mockResolvedValue(mockResult);

      const result = await service.getConversations(mockUserId, {
        limit: 20,
        offset: 0,
      });

      expect(chatRepository.getConversations).toHaveBeenCalledWith(mockUserId, {
        limit: 20,
        offset: 0,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getConversation', () => {
    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: mockConversationId,
        title: 'Test Chat',
        context: null,
        messages: [
          {
            id: 'msg-1',
            role: ChatRole.USER,
            content: 'Hello',
            createdAt: new Date(),
            metadata: null,
          },
        ],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      chatRepository.getConversation.mockResolvedValue(mockConversation as any);

      const result = await service.getConversation(
        mockConversationId,
        mockUserId,
      );

      expect(result).toHaveProperty('id', mockConversationId);
      expect(result.messages).toHaveLength(1);
    });

    it('should throw NotFoundException when conversation not found', async () => {
      chatRepository.getConversation.mockResolvedValue(null);

      await expect(
        service.getConversation('non-existent', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    it('should send message and receive AI response', async () => {
      const mockUserMessage = {
        id: 'msg-1',
        content: 'Hello',
        role: ChatRole.USER,
        createdAt: new Date(),
      };
      const mockAIMessage = {
        id: 'msg-2',
        content: 'Hi!',
        role: ChatRole.ASSISTANT,
        createdAt: new Date(),
        metadata: null,
      };

      chatRepository.verifyOwnership.mockResolvedValue(true);
      chatRepository.getMessageHistory.mockResolvedValue([]);
      chatRepository.addMessage.mockResolvedValueOnce(mockUserMessage as any);
      chatRepository.addMessage.mockResolvedValueOnce(mockAIMessage as any);
      chatRepository.getConversation.mockResolvedValue({
        title: 'Existing',
      } as any);
      coachService.chat.mockResolvedValue({
        message: 'Hi!',
        actions: [],
        suggestions: [],
      });

      const result = await service.sendMessage(mockConversationId, mockUserId, {
        message: 'Hello',
      });

      expect(result).toHaveProperty('conversationId', mockConversationId);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('aiResponse');
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
      chatRepository.archiveConversation.mockResolvedValue({ count: 1 });

      await service.archiveConversation(mockConversationId, mockUserId);

      expect(chatRepository.archiveConversation).toHaveBeenCalledWith(
        mockConversationId,
        mockUserId,
      );
    });

    it('should throw ForbiddenException when not owned', async () => {
      chatRepository.verifyOwnership.mockResolvedValue(false);

      await expect(
        service.archiveConversation(mockConversationId, mockUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getInsights', () => {
    it('should return proactive insights', async () => {
      const mockInsights = [
        {
          type: 'OVERDUE_ALERT',
          message: 'You have overdue tasks',
          priority: 'HIGH' as const,
          actionable: true,
        },
      ];
      coachService.getProactiveInsights.mockResolvedValue(mockInsights);

      const result = await service.getInsights(mockUserId);

      expect(coachService.getProactiveInsights).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(result).toEqual(mockInsights);
    });
  });
});
