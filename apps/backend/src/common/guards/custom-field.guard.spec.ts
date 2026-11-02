import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CustomFieldGuard } from './custom-field.guard';
import { PrismaService } from '../../database/prisma.service';

describe('CustomFieldGuard', () => {
  let guard: CustomFieldGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: {
    project: { findUnique: jest.Mock };
    task: { findUnique: jest.Mock };
    customField: { findUnique: jest.Mock };
    workspaceMember: { findUnique: jest.Mock };
  };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';

  const createContext = (request: {
    params?: Record<string, string>;
    user?: { id: string } | null;
  }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: request.user === undefined ? { id: userId } : request.user,
          params: request.params ?? {},
          query: {},
          url: '/custom-fields',
          route: { path: '/custom-fields' },
        }),
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as jest.Mocked<Reflector>;

    prisma = {
      project: { findUnique: jest.fn() },
      task: { findUnique: jest.fn() },
      customField: { findUnique: jest.fn() },
      workspaceMember: { findUnique: jest.fn() },
    };

    guard = new CustomFieldGuard(reflector, prisma as unknown as PrismaService);
  });

  describe('project-scoped routes', () => {
    it('authorizes a workspace member through the project workspace', async () => {
      prisma.project.findUnique.mockResolvedValue({ workspaceId });
      prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        guard.canActivate(
          createContext({ params: { projectId: 'project-1' } }),
        ),
      ).resolves.toBe(true);

      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'project-1' } }),
      );
    });

    it('throws NotFound when the project does not exist', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        guard.canActivate(createContext({ params: { projectId: 'missing' } })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws Forbidden when the user is not a workspace member', async () => {
      prisma.project.findUnique.mockResolvedValue({ workspaceId });
      prisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        guard.canActivate(
          createContext({ params: { projectId: 'project-1' } }),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('field-scoped routes', () => {
    it('authorizes through the field project workspace', async () => {
      prisma.customField.findUnique.mockResolvedValue({
        project: { workspaceId },
      });
      prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        guard.canActivate(createContext({ params: { id: 'field-1' } })),
      ).resolves.toBe(true);
    });

    it('throws NotFound when the field does not exist', async () => {
      prisma.customField.findUnique.mockResolvedValue(null);

      await expect(
        guard.canActivate(createContext({ params: { id: 'missing' } })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('task-scoped routes', () => {
    it('authorizes a workspace member through the task project workspace', async () => {
      prisma.task.findUnique.mockResolvedValue({
        ownerId: 'other',
        assigneeId: null,
        project: { workspaceId },
      });
      prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        guard.canActivate(createContext({ params: { taskId: 'task-1' } })),
      ).resolves.toBe(true);
    });

    it('allows the express-task owner without workspace context', async () => {
      prisma.task.findUnique.mockResolvedValue({
        ownerId: userId,
        assigneeId: null,
        project: null,
      });

      await expect(
        guard.canActivate(createContext({ params: { taskId: 'task-1' } })),
      ).resolves.toBe(true);
      expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
    });

    it('denies an unrelated user on an express task', async () => {
      prisma.task.findUnique.mockResolvedValue({
        ownerId: 'other',
        assigneeId: null,
        project: null,
      });

      // BaseResourceGuard denies without workspace context by returning
      // false (Nest translates it to 403), it does not throw.
      await expect(
        guard.canActivate(createContext({ params: { taskId: 'task-1' } })),
      ).resolves.toBe(false);
    });
  });
});
