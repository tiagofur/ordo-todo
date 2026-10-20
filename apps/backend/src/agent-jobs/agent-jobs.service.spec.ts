import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobsService } from './agent-jobs.service';
import { AgentJobsScheduler } from './agent-jobs.scheduler';
import { PrismaService } from '../database/prisma.service';
import { AIService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('AgentJobsService', () => {
  let service: AgentJobsService;

  const job = {
    id: 'job-1',
    userId: 'user-1',
    name: 'Resumen semanal',
    schedule: '0 17 * * 5',
    timezone: 'America/Mexico_City',
    taskPrompt: 'prepárame el resumen semanal',
    isActive: true,
  };

  const mockAgentJob = {
    create: jest.fn(async ({ data }: { data: object }) => ({
      ...job,
      ...data,
    })),
    findMany: jest.fn(async () => []),
    findFirst: jest.fn(async () => job),
    findUnique: jest.fn(async () => ({ ...job, userId: 'user-1' })),
    update: jest.fn(async ({ data }: { data: object }) => ({
      ...job,
      ...data,
    })),
    delete: jest.fn(async () => job),
  };
  const mockPrisma = {
    agentJob: mockAgentJob,
    user: { findUnique: jest.fn(async () => ({ timezone: 'Europe/Madrid' })) },
  };
  const mockAi = {
    generateWeeklyReport: jest.fn(async () => ({ summary: 'weekly!' })),
    generateDailyReport: jest.fn(async () => ({ summary: 'daily!' })),
    chat: jest.fn(async () => ({ message: 'chat!' })),
  };
  const mockNotifications = { create: jest.fn(async () => ({})) };
  const mockScheduler = {
    register: jest.fn(() => new Date('2026-10-24T17:00:00Z')),
    unregister: jest.fn(),
    isRegistered: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentJobsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AIService, useValue: mockAi },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: AgentJobsScheduler, useValue: mockScheduler },
      ],
    }).compile();
    service = module.get<AgentJobsService>(AgentJobsService);
  });

  describe('create', () => {
    it('parses NL schedule and registers the cron', async () => {
      const created = await service.create('user-1', {
        name: 'Resumen semanal',
        scheduleText: 'cada viernes a las 5',
        taskPrompt: 'prepárame el resumen semanal',
      });
      expect(mockAgentJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          schedule: '0 17 * * 5',
          timezone: 'Europe/Madrid',
        }),
      });
      expect(mockScheduler.register).toHaveBeenCalled();
      expect(created).toMatchObject({ name: 'Resumen semanal' });
    });

    it('rejects an unintelligible schedule with examples', async () => {
      await expect(
        service.create('user-1', {
          name: 'X',
          scheduleText: 'maybe someday',
          taskPrompt: 'do things',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockAgentJob.create).not.toHaveBeenCalled();
    });
  });

  describe('ownership', () => {
    it('get throws 404 for foreign jobs', async () => {
      mockAgentJob.findFirst.mockResolvedValueOnce(null);
      await expect(service.get('user-2', 'job-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('pause/resume/remove', () => {
    it('pause unregisters the cron', async () => {
      await service.update('user-1', 'job-1', { isActive: false });
      expect(mockScheduler.unregister).toHaveBeenCalledWith('job-1');
    });

    it('resume re-registers the cron', async () => {
      await service.update('user-1', 'job-1', { isActive: true });
      expect(mockScheduler.register).toHaveBeenCalled();
    });

    it('remove unregisters and deletes', async () => {
      await service.remove('user-1', 'job-1');
      expect(mockScheduler.unregister).toHaveBeenCalledWith('job-1');
      expect(mockAgentJob.delete).toHaveBeenCalledWith({
        where: { id: 'job-1' },
      });
    });
  });

  describe('executeJob routing', () => {
    it('routes weekly prompts to generateWeeklyReport + notifies', async () => {
      const result = await service.executeJob('job-1');
      expect(mockAi.generateWeeklyReport).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ ok: true, summary: 'weekly!' });
      expect(mockAgentJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: expect.objectContaining({ lastStatus: 'ok' }),
      });
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'SYSTEM',
          metadata: { jobId: 'job-1' },
        }),
      );
    });

    it('routes daily prompts to generateDailyReport', async () => {
      mockAgentJob.findUnique.mockResolvedValueOnce({
        ...job,
        taskPrompt: 'dame el resumen diario',
      });
      await service.executeJob('job-1');
      expect(mockAi.generateDailyReport).toHaveBeenCalledWith(
        'user-1',
        expect.stringMatching(/AM|PM/),
      );
    });

    it('routes free prompts to chat', async () => {
      mockAgentJob.findUnique.mockResolvedValueOnce({
        ...job,
        taskPrompt: 'cuéntame un chiste',
      });
      const result = await service.executeJob('job-1');
      expect(mockAi.chat).toHaveBeenCalledWith('user-1', 'cuéntame un chiste');
      expect(result).toEqual({ ok: true, summary: 'chat!' });
    });

    it('records errors without rethrowing', async () => {
      mockAi.generateWeeklyReport.mockRejectedValueOnce(new Error('boom'));
      const result = await service.executeJob('job-1');
      expect(result).toEqual({ ok: false, error: 'boom' });
      expect(mockAgentJob.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: expect.objectContaining({ lastStatus: 'error: boom' }),
      });
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringContaining('Falló') }),
      );
    });
  });
});
