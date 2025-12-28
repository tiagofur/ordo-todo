import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: jest.Mocked<ChatService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test',
  };

  beforeEach(async () => {
    const mockChatService = {
      getConversations: jest.fn(),
      getConversation: jest.fn(),
      createConversation: jest.fn(),
      sendMessage: jest.fn(),
      updateTitle: jest.fn(),
      archiveConversation: jest.fn(),
      deleteConversation: jest.fn(),
      getInsights: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: mockChatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(
      ChatService,
    ) as jest.Mocked<ChatService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConversations', () => {
    it('should return paginated conversations', async () => {
      const mockResult = {
        conversations: [{ id: 'conv-1', title: 'Chat' }],
        total: 1,
        limit: 20,
        offset: 0,
      };
      chatService.getConversations.mockResolvedValue(mockResult as any);

      const result = await controller.getConversations(
        mockUser,
        '20',
        '0',
        'false',
      );

      expect(chatService.getConversations).toHaveBeenCalledWith(mockUser.id, {
        limit: 20,
        offset: 0,
        includeArchived: false,
      });
      expect(result).toEqual(mockResult);
    });

    it('should include archived when specified', async () => {
      chatService.getConversations.mockResolvedValue({
        conversations: [],
        total: 0,
        limit: 20,
        offset: 0,
      } as any);

      await controller.getConversations(mockUser, undefined, undefined, 'true');

      expect(chatService.getConversations).toHaveBeenCalledWith(mockUser.id, {
        limit: undefined,
        offset: undefined,
        includeArchived: true,
      });
    });
  });

  describe('getConversation', () => {
    it('should return conversation by id', async () => {
      const mockConv = { id: 'conv-123', title: 'Test', messages: [] };
      chatService.getConversation.mockResolvedValue(mockConv as any);

      const result = await controller.getConversation('conv-123', mockUser);

      expect(chatService.getConversation).toHaveBeenCalledWith(
        'conv-123',
        mockUser.id,
      );
      expect(result).toEqual(mockConv);
    });
  });

  describe('createConversation', () => {
    it('should create new conversation', async () => {
      const dto = { title: 'New Chat', workspaceId: 'ws-123' };
      const mockResult = { id: 'conv-new', title: 'New Chat' };
      chatService.createConversation.mockResolvedValue(mockResult as any);

      const result = await controller.createConversation(dto, mockUser);

      expect(chatService.createConversation).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('sendMessage', () => {
    it('should send message and return response', async () => {
      const dto = { message: 'Hello AI' };
      const mockResponse = {
        conversationId: 'conv-123',
        message: { id: 'msg-1', role: 'USER', content: 'Hello AI' },
        aiResponse: { id: 'msg-2', role: 'ASSISTANT', content: 'Hi!' },
      };
      chatService.sendMessage.mockResolvedValue(mockResponse as any);

      const result = await controller.sendMessage('conv-123', dto, mockUser);

      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'conv-123',
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation title', async () => {
      chatService.updateTitle.mockResolvedValue(undefined);

      await controller.updateConversation('conv-123', 'New Title', mockUser);

      expect(chatService.updateTitle).toHaveBeenCalledWith(
        'conv-123',
        mockUser.id,
        'New Title',
      );
    });
  });

  describe('archiveConversation', () => {
    it('should archive conversation', async () => {
      chatService.archiveConversation.mockResolvedValue(undefined);

      await controller.archiveConversation('conv-123', mockUser);

      expect(chatService.archiveConversation).toHaveBeenCalledWith(
        'conv-123',
        mockUser.id,
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation', async () => {
      chatService.deleteConversation.mockResolvedValue(undefined);

      await controller.deleteConversation('conv-123', mockUser);

      expect(chatService.deleteConversation).toHaveBeenCalledWith(
        'conv-123',
        mockUser.id,
      );
    });
  });

  describe('getInsights', () => {
    it('should return productivity insights', async () => {
      const mockInsights = [
        {
          type: 'PEAK_HOUR',
          message: 'Best time to focus',
          priority: 'MEDIUM',
        },
      ];
      chatService.getInsights.mockResolvedValue(mockInsights as any);

      const result = await controller.getInsights(mockUser);

      expect(chatService.getInsights).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockInsights);
    });
  });
});
