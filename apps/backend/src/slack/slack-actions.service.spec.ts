import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { SlackActionsService } from './slack-actions.service';
import { PrismaService } from '../database/prisma.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { AIService } from '../ai/ai.service';
import { SlackNotifierService } from './slack-notifier.service';

describe('SlackActionsService', () => {
  let service: SlackActionsService;

  const mockPrisma = {
    userIntegration: { findMany: jest.fn() },
    slackWorkspaceMap: { findMany: jest.fn(), findFirst: jest.fn() },
    task: { findUnique: jest.fn() },
  };
  const mockV1Tasks = {
    create: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
  };
  const mockAI = { parseNaturalLanguageTask: jest.fn() };
  const mockNotifier = {
    verifyAction: jest.fn(),
    postEphemeral: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackActionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: V1TasksService, useValue: mockV1Tasks },
        { provide: AIService, useValue: mockAI },
        { provide: SlackNotifierService, useValue: mockNotifier },
        {
          provide: ModuleRef,
          useValue: {
            get: (token: unknown) => {
              if (token === V1TasksService) return mockV1Tasks;
              if (token === AIService) return mockAI;
              throw new Error('unexpected token');
            },
          },
        },
      ],
    }).compile();

    service = module.get<SlackActionsService>(SlackActionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockUserMapping() {
    mockPrisma.slackWorkspaceMap.findMany.mockResolvedValue([
      { userId: 'user-1', teamId: 'T1', slackUserId: 'U1' },
    ]);
    mockPrisma.slackWorkspaceMap.findFirst.mockResolvedValue({
      userId: 'user-1',
      teamId: 'T1',
      projectId: 'proj-inbox',
    });
  }

  describe('handleBlockAction', () => {
    it('should complete the task on ordo_task_complete', async () => {
      mockUserMapping();
      mockNotifier.verifyAction.mockResolvedValue({
        taskId: 'task-1',
        timestamp: Date.now(),
      });
      mockV1Tasks.update.mockResolvedValue({ id: 'task-1' });

      await service.handleBlockAction({
        actionId: 'ordo_task_complete',
        value: 'task-1.123.abc',
        teamId: 'T1',
        slackUserId: 'U1',
      });

      expect(mockNotifier.verifyAction).toHaveBeenCalledWith('task-1.123.abc');
      expect(mockV1Tasks.update).toHaveBeenCalledWith(
        'user-1',
        'task-1',
        expect.objectContaining({ status: 'COMPLETED' }),
      );
    });

    it('should postpone to tomorrow on ordo_task_postpone', async () => {
      mockUserMapping();
      mockNotifier.verifyAction.mockResolvedValue({
        taskId: 'task-1',
        timestamp: Date.now(),
      });
      mockV1Tasks.update.mockResolvedValue({ id: 'task-1' });

      await service.handleBlockAction({
        actionId: 'ordo_task_postpone',
        value: 'task-1.123.abc',
        teamId: 'T1',
        slackUserId: 'U1',
      });

      const [, , dto] = mockV1Tasks.update.mock.calls[0];
      const expected = new Date();
      expected.setDate(expected.getDate() + 1);
      expect(dto.dueDate).toBe(expected.toISOString().slice(0, 10));
    });

    it('should reject forged action values and unknown users', async () => {
      mockUserMapping();
      mockNotifier.verifyAction.mockRejectedValue(
        new UnauthorizedException('Invalid action signature'),
      );

      await expect(
        service.handleBlockAction({
          actionId: 'ordo_task_complete',
          value: 'task-9.123.forged',
          teamId: 'T1',
          slackUserId: 'U1',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockV1Tasks.update).not.toHaveBeenCalled();

      mockPrisma.slackWorkspaceMap.findMany.mockResolvedValue([]);
      await expect(
        service.handleBlockAction({
          actionId: 'ordo_task_complete',
          value: 'task-1.123.abc',
          teamId: 'T1',
          slackUserId: 'U99',
        }),
      ).rejects.toThrow('Slack user is not linked');
    });
  });

  describe('handleMessageAction', () => {
    it('should create a task from a message with NL parsing', async () => {
      mockUserMapping();
      mockAI.parseNaturalLanguageTask.mockResolvedValue({
        title: 'Follow up with Ana',
        description: 'From Slack message',
        dueDate: '2026-10-27',
        priority: 'MEDIUM',
      });
      mockV1Tasks.create.mockResolvedValue({ id: 'task-new' });

      const result = await service.handleMessageAction({
        teamId: 'T1',
        slackUserId: 'U1',
        channelId: 'C1',
        messageText: 'remind me to follow up with Ana tomorrow',
        messageTs: '123.456',
        triggerId: 'trigger-1',
      });

      expect(mockAI.parseNaturalLanguageTask).toHaveBeenCalledWith(
        'remind me to follow up with Ana tomorrow',
        undefined,
        undefined,
      );
      expect(mockV1Tasks.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          title: 'Follow up with Ana',
          projectId: expect.any(String),
        }),
      );
      expect(result.taskId).toBe('task-new');
      expect(result.messageLink).toContain('C1');
    });
  });

  describe('handleSlashCommand', () => {
    it('should route /ordo create through NL parsing', async () => {
      mockUserMapping();
      mockPrisma.slackWorkspaceMap.findFirst.mockResolvedValue({
        userId: 'user-1',
        teamId: 'T1',
        projectId: 'proj-inbox',
      });
      mockAI.parseNaturalLanguageTask.mockResolvedValue({
        title: 'Buy milk',
        priority: 'LOW',
      });
      mockV1Tasks.create.mockResolvedValue({ id: 'task-2' });

      const result = await service.handleSlashCommand({
        teamId: 'T1',
        slackUserId: 'U1',
        channelId: 'C1',
        text: 'create buy milk',
      });

      expect(result.text).toContain('Buy milk');
      expect(mockV1Tasks.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ projectId: 'proj-inbox' }),
      );
    });

    it('should list today tasks on /ordo today', async () => {
      mockUserMapping();
      mockV1Tasks.list.mockResolvedValue([
        { id: 'task-1', title: 'Write report' },
        { id: 'task-2', title: 'Review PR' },
      ]);

      const result = await service.handleSlashCommand({
        teamId: 'T1',
        slackUserId: 'U1',
        channelId: 'C1',
        text: 'today',
      });

      expect(result.text).toContain('Write report');
      expect(result.text).toContain('Review PR');
    });

    it('should show help on unknown subcommands', async () => {
      mockUserMapping();

      const result = await service.handleSlashCommand({
        teamId: 'T1',
        slackUserId: 'U1',
        channelId: 'C1',
        text: 'frobnicate',
      });

      expect(result.text).toContain('/ordo create');
      expect(result.text).toContain('/ordo today');
    });
  });
});
