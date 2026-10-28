import { Reflector } from '@nestjs/core';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { TaskGuard } from './task.guard';
import { PrismaService } from '../../database/prisma.service';

describe('TaskGuard', () => {
  let guard: TaskGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: {
    task: { findUnique: jest.Mock };
    project: { findUnique: jest.Mock };
    workspaceMember: { findUnique: jest.Mock };
  };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';

  const createContext = (request: {
    params?: Record<string, string>;
    query?: Record<string, string>;
    url?: string;
    route?: { path?: string };
    user?: { id: string } | null;
  }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: request.user === undefined ? { id: userId } : request.user,
          params: request.params ?? {},
          query: request.query ?? {},
          url: request.url ?? '/tasks',
          route: request.route ?? { path: '/tasks/:id' },
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
      task: { findUnique: jest.fn() },
      project: { findUnique: jest.fn() },
      workspaceMember: { findUnique: jest.fn() },
    };

    guard = new TaskGuard(reflector, prisma as unknown as PrismaService);
  });

  describe('task with project (flujo actual, sin cambios)', () => {
    it('authorizes a workspace member through the project workspace', async () => {
      prisma.task.findUnique.mockResolvedValue({
        project: { workspaceId },
      });
      prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        guard.canActivate(createContext({ params: { id: 'task-1' } })),
      ).resolves.toBe(true);

      expect(prisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-1' } }),
      );
      expect(prisma.workspaceMember.findUnique).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId, userId } },
      });
    });

    it('throws NotFound when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        guard.canActivate(createContext({ params: { id: 'missing' } })),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('tarea express sin proyecto (ODD 021)', () => {
    it('authorizes the owner of an express task', async () => {
      prisma.task.findUnique
        .mockResolvedValueOnce({ project: null }) // getWorkspaceId
        .mockResolvedValueOnce({
          ownerId: userId,
          assigneeId: null,
        }); // authorizeWithoutWorkspace

      await expect(
        guard.canActivate(createContext({ params: { id: 'task-1' } })),
      ).resolves.toBe(true);

      expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
    });

    it('authorizes the assignee of an express task', async () => {
      prisma.task.findUnique
        .mockResolvedValueOnce({ project: null })
        .mockResolvedValueOnce({
          ownerId: 'owner-9',
          assigneeId: userId,
        });

      await expect(
        guard.canActivate(createContext({ params: { id: 'task-1' } })),
      ).resolves.toBe(true);
    });

    it('denies a user who is neither owner nor assignee of an express task', async () => {
      prisma.task.findUnique
        .mockResolvedValueOnce({ project: null })
        .mockResolvedValueOnce({
          ownerId: 'owner-9',
          assigneeId: 'assignee-9',
        });

      await expect(
        guard.canActivate(createContext({ params: { id: 'task-1' } })),
      ).resolves.toBe(false);
    });

    it('authorizes /deleted without projectId (service scopes by user)', async () => {
      await expect(
        guard.canActivate(
          createContext({
            params: {},
            query: {},
            url: '/tasks/deleted',
            route: { path: '/tasks/deleted' },
          }),
        ),
      ).resolves.toBe(true);

      expect(prisma.task.findUnique).not.toHaveBeenCalled();
      expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
    });

    it('resolves the workspace for /deleted with projectId (flujo actual)', async () => {
      prisma.project.findUnique.mockResolvedValue({ workspaceId });
      prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        guard.canActivate(
          createContext({
            params: {},
            query: { projectId: 'proj-1' },
            url: '/tasks/deleted?projectId=proj-1',
            route: { path: '/tasks/deleted' },
          }),
        ),
      ).resolves.toBe(true);

      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'proj-1' } }),
      );
    });
  });
});
