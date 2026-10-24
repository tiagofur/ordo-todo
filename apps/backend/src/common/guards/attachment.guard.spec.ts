import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AttachmentGuard } from './attachment.guard';
import { PrismaService } from '../../database/prisma.service';

describe('AttachmentGuard', () => {
  let guard: AttachmentGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: {
    attachment: { findUnique: jest.Mock };
    project: { findUnique: jest.Mock };
    task: { findUnique: jest.Mock };
    workspaceMember: { findUnique: jest.Mock };
  };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';

  const createContext = (request: {
    params?: Record<string, string>;
    body?: Record<string, unknown>;
    user?: { id: string } | null;
  }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: request.user === undefined ? { id: userId } : request.user,
          params: request.params ?? {},
          body: request.body ?? {},
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
      attachment: { findUnique: jest.fn() },
      project: { findUnique: jest.fn() },
      task: { findUnique: jest.fn() },
      workspaceMember: { findUnique: jest.fn() },
    };

    guard = new AttachmentGuard(reflector, prisma as unknown as PrismaService);
  });

  it('allows a workspace member to read an attachment by id', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      task: { project: { workspaceId } },
    });
    prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

    await expect(
      guard.canActivate(createContext({ params: { id: 'att-1' } })),
    ).resolves.toBe(true);

    expect(prisma.attachment.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'att-1' } }),
    );
    expect(prisma.workspaceMember.findUnique).toHaveBeenCalledWith({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  });

  it('resolves the workspace from the project route param', async () => {
    prisma.project.findUnique.mockResolvedValue({ workspaceId });
    prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

    await expect(
      guard.canActivate(createContext({ params: { projectId: 'proj-1' } })),
    ).resolves.toBe(true);

    expect(prisma.project.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'proj-1' } }),
    );
    expect(prisma.attachment.findUnique).not.toHaveBeenCalled();
  });

  it('resolves the workspace from the taskId in the body on create', async () => {
    prisma.task.findUnique.mockResolvedValue({ project: { workspaceId } });
    prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

    await expect(
      guard.canActivate(createContext({ body: { taskId: 'task-1' } })),
    ).resolves.toBe(true);

    expect(prisma.task.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'task-1' } }),
    );
  });

  it('denies access when the project from the route does not exist', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ params: { projectId: 'missing' } })),
    ).resolves.toBe(false);

    expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
  });

  it('denies a non-member whose id came from the task in the body', async () => {
    prisma.task.findUnique.mockResolvedValue({ project: { workspaceId } });
    prisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ body: { taskId: 'task-1' } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a user who is not a member of the workspace', async () => {
    prisma.attachment.findUnique.mockResolvedValue({
      task: { project: { workspaceId } },
    });
    prisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ params: { id: 'att-1' } })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies access when the attachment does not exist', async () => {
    prisma.attachment.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ params: { id: 'missing' } })),
    ).resolves.toBe(false);

    expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
  });

  it('denies access when no attachment, project or task id is present', async () => {
    await expect(guard.canActivate(createContext({}))).resolves.toBe(false);

    expect(prisma.attachment.findUnique).not.toHaveBeenCalled();
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
    expect(prisma.task.findUnique).not.toHaveBeenCalled();
  });

  it('denies unauthenticated requests before touching the database', async () => {
    await expect(
      guard.canActivate(createContext({ params: { id: 'att-1' }, user: null })),
    ).resolves.toBe(false);

    expect(prisma.attachment.findUnique).not.toHaveBeenCalled();
  });
});
