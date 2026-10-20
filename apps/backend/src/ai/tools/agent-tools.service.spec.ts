import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AgentToolsService } from './agent-tools.service';
import { planRequiresConfirmation } from './agent-tool.types';
import { PrismaService } from '../../database/prisma.service';
import { AuthAuditService } from '../../auth/auth-audit.service';
import { AuthEventType } from '../../auth/types/auth-event.types';
import { TasksService } from '../../tasks/tasks.service';
import { ProjectsService } from '../../projects/projects.service';

/**
 * Unit tests for AgentToolsService (ODD 004 S3).
 *
 * The service resolves TasksService/ProjectsService lazily via ModuleRef
 * (Slack precedent: slack-actions.service.ts) and audits successful steps
 * via AuthAuditService (MCP precedent: mcp-catalog.service.ts guarded()).
 */
describe('AgentToolsService', () => {
  let service: AgentToolsService;
  let prisma: Record<string, any>;
  let audit: { logEvent: jest.Mock };
  let tasks: {
    create: jest.Mock;
    update: jest.Mock;
    complete: jest.Mock;
  };
  let projects: { create: jest.Mock };

  const USER = 'user-1';

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      project: { findFirst: jest.fn() },
      task: { findFirst: jest.fn() },
      workspaceMember: { findUnique: jest.fn() },
      workspace: { findFirst: jest.fn() },
    };
    audit = { logEvent: jest.fn().mockResolvedValue(undefined) };
    tasks = {
      create: jest.fn(),
      update: jest.fn(),
      complete: jest.fn(),
    };
    projects = { create: jest.fn() };

    const moduleRef = {
      get: jest.fn((token: unknown) => {
        if (token === TasksService) return tasks;
        if (token === ProjectsService) return projects;
        throw new Error(`unexpected token ${String(token)}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentToolsService,
        { provide: ModuleRef, useValue: moduleRef },
        { provide: PrismaService, useValue: prisma },
        { provide: AuthAuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AgentToolsService>(AgentToolsService);
  });

  describe('planRequiresConfirmation (pure)', () => {
    it('single low-risk step does not require confirmation', () => {
      expect(
        planRequiresConfirmation([{ tool: 'complete_task', args: {} }]),
      ).toBe(false);
    });

    it('more than 3 steps requires confirmation', () => {
      const calls = Array.from({ length: 4 }, () => ({
        tool: 'complete_task' as const,
        args: {},
      }));
      expect(planRequiresConfirmation(calls)).toBe(true);
    });

    it('exactly 3 steps does not require confirmation', () => {
      const calls = Array.from({ length: 3 }, () => ({
        tool: 'complete_task' as const,
        args: {},
      }));
      expect(planRequiresConfirmation(calls)).toBe(false);
    });

    it('update_task to CANCELLED is destructive and requires confirmation', () => {
      expect(
        planRequiresConfirmation([
          { tool: 'update_task', args: { status: 'CANCELLED' } },
        ]),
      ).toBe(true);
    });

    it('update_task to other statuses is not destructive', () => {
      expect(
        planRequiresConfirmation([
          { tool: 'update_task', args: { status: 'COMPLETED' } },
        ]),
      ).toBe(false);
    });
  });

  describe('propose', () => {
    it('builds a plan with human descriptions and no confirmation for 1 step', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: 'p1' });

      const plan = await service.propose(USER, [
        {
          tool: 'create_task',
          args: { title: 'Buy milk', projectId: 'p1' },
        },
      ]);

      expect(plan.planId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(plan.steps).toHaveLength(1);
      expect(plan.steps[0].description).toContain('Buy milk');
      expect(plan.requiresConfirmation).toBe(false);
      expect(plan.reason).toContain('bajo riesgo');
    });

    it('requires confirmation for 4 steps with a reason mentioning the limit', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      const calls = ['t1', 't2', 't3', 't4'].map((taskId) => ({
        tool: 'complete_task' as const,
        args: { taskId },
      }));

      const plan = await service.propose(USER, calls);

      expect(plan.requiresConfirmation).toBe(true);
      expect(plan.reason).toMatch(/4.*3|límite/);
    });

    it('requires confirmation when a step cancels a task', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });

      const plan = await service.propose(USER, [
        {
          tool: 'update_task',
          args: { taskId: 't1', status: 'CANCELLED' },
        },
      ]);

      expect(plan.requiresConfirmation).toBe(true);
      expect(plan.reason).toMatch(/cancel/i);
    });

    it('rejects unknown tools', async () => {
      await expect(
        service.propose(USER, [
          { tool: 'delete_workspace' as never, args: {} },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects create_task without title', async () => {
      await expect(
        service.propose(USER, [
          { tool: 'create_task', args: { projectId: 'p1' } },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects create_task in a project the user cannot access', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.propose(USER, [
          {
            tool: 'create_task',
            args: { title: 'X', projectId: 'nope' },
          },
        ]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects update_task on an invisible task', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.propose(USER, [
          { tool: 'update_task', args: { taskId: 'nope', title: 'X' } },
        ]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects schedule_block with malformed date/time', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });

      await expect(
        service.propose(USER, [
          {
            tool: 'schedule_block',
            args: { taskId: 't1', date: 'tomorrow', startTime: '9am' },
          },
        ]),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects create_project outside user workspaces', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.propose(USER, [
          {
            tool: 'create_project',
            args: { name: 'P', workspaceId: 'nope' },
          },
        ]),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('execute', () => {
    it('refuses to run an unconfirmed plan that requires confirmation', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      const plan = await service.propose(
        USER,
        ['t1', 't2', 't3', 't4'].map((taskId) => ({
          tool: 'complete_task' as const,
          args: { taskId },
        })),
      );
      expect(plan.requiresConfirmation).toBe(true);

      await expect(service.execute(USER, plan, false)).rejects.toThrow(
        ForbiddenException,
      );
      expect(tasks.complete).not.toHaveBeenCalled();
      expect(audit.logEvent).not.toHaveBeenCalled();
    });

    it('executes and audits each successful step in order', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      tasks.complete.mockResolvedValue({ id: 't1', status: 'COMPLETED' });

      const plan = await service.propose(USER, [
        { tool: 'complete_task', args: { taskId: 't1' } },
      ]);
      const result = await service.execute(USER, plan, false);

      expect(result.planId).toBe(plan.planId);
      expect(result.executed).toHaveLength(1);
      expect(result.executed[0]).toMatchObject({
        step: 0,
        tool: 'complete_task',
        ok: true,
      });
      expect(audit.logEvent).toHaveBeenCalledTimes(1);
      expect(audit.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: AuthEventType.AGENT_TOOL_CALL,
          userId: USER,
          metadata: expect.objectContaining({
            tool: 'complete_task',
            planId: plan.planId,
            step: 0,
          }),
        }),
      );
    });

    it('continues after a failed step and does not audit failures', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      tasks.complete
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce({ id: 't2', status: 'COMPLETED' });

      const plan = await service.propose(USER, [
        { tool: 'complete_task', args: { taskId: 't1' } },
        { tool: 'complete_task', args: { taskId: 't2' } },
      ]);
      const result = await service.execute(USER, plan, false);

      expect(result.executed).toHaveLength(2);
      expect(result.executed[0]).toMatchObject({
        step: 0,
        ok: false,
        error: 'boom',
      });
      expect(result.executed[1]).toMatchObject({ step: 1, ok: true });
      expect(tasks.complete).toHaveBeenCalledTimes(2);
      // Only the successful step is audited (MCP_TOOL_CALL precedent).
      expect(audit.logEvent).toHaveBeenCalledTimes(1);
      expect(audit.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ step: 1 }),
        }),
      );
    });

    it('ignores the confirmed flag when the plan needs no confirmation', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      tasks.complete.mockResolvedValue({ id: 't1' });

      const plan = await service.propose(USER, [
        { tool: 'complete_task', args: { taskId: 't1' } },
      ]);
      expect(plan.requiresConfirmation).toBe(false);

      const result = await service.execute(USER, plan, true);
      expect(result.executed[0].ok).toBe(true);
    });
  });

  describe('tool executors', () => {
    it('create_task delegates to TasksService.create with Date coercion', async () => {
      prisma.project.findFirst.mockResolvedValue({ id: 'p1' });
      tasks.create.mockResolvedValue({ id: 'nt', title: 'T' });

      const plan = await service.propose(USER, [
        {
          tool: 'create_task',
          args: {
            title: 'T',
            projectId: 'p1',
            dueDate: '2026-10-25T00:00:00.000Z',
            priority: 'HIGH',
          },
        },
      ]);
      await service.execute(USER, plan, false);

      expect(tasks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'T',
          projectId: 'p1',
          dueDate: new Date('2026-10-25T00:00:00.000Z'),
          priority: 'HIGH',
        }),
        USER,
      );
    });

    it('schedule_block maps to the UpdateTaskDto time-blocking fields', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 't1' });
      tasks.update.mockResolvedValue({ id: 't1' });

      const plan = await service.propose(USER, [
        {
          tool: 'schedule_block',
          args: {
            taskId: 't1',
            date: '2026-10-21',
            startTime: '09:00',
            endTime: '10:30',
          },
        },
      ]);
      await service.execute(USER, plan, false);

      expect(tasks.update).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({
          scheduledDate: new Date('2026-10-21'),
          scheduledTime: '09:00',
          scheduledEndTime: '10:30',
          isTimeBlocked: true,
        }),
        USER,
      );
    });

    it('create_project delegates to ProjectsService.create', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 'w1',
        userId: USER,
      });
      prisma.workspace.findFirst.mockResolvedValue({ name: 'Acme' });
      projects.create.mockResolvedValue({ id: 'np', name: 'N' });

      const plan = await service.propose(USER, [
        {
          tool: 'create_project',
          args: { name: 'N', workspaceId: 'w1' },
        },
      ]);

      expect(plan.steps[0].description).toContain('Acme');
      await service.execute(USER, plan, false);
      expect(projects.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'N', workspaceId: 'w1' }),
      );
    });
  });
});
