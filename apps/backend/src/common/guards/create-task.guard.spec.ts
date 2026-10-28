import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { CreateTaskGuard } from './create-task.guard';
import { PrismaService } from '../../database/prisma.service';

describe('CreateTaskGuard', () => {
  let guard: CreateTaskGuard;
  let reflector: jest.Mocked<Reflector>;
  let prisma: {
    project: { findUnique: jest.Mock };
    workspaceMember: { findUnique: jest.Mock };
  };

  const userId = 'user-1';
  const workspaceId = 'workspace-1';

  const createContext = (body: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: {},
          body,
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
      workspaceMember: { findUnique: jest.fn() },
    };

    guard = new CreateTaskGuard(reflector, prisma as unknown as PrismaService);
  });

  it('permite crear tarea express sin projectId (ODD 021)', async () => {
    await expect(
      guard.canActivate(createContext({ title: 'Comprar pan' })),
    ).resolves.toBe(true);

    expect(prisma.project.findUnique).not.toHaveBeenCalled();
    expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
  });

  it('autoriza la creación en un proyecto existente con membresía', async () => {
    prisma.project.findUnique.mockResolvedValue({ workspaceId });
    prisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

    await expect(
      guard.canActivate(createContext({ title: 'T', projectId: 'proj-1' })),
    ).resolves.toBe(true);

    expect(prisma.workspaceMember.findUnique).toHaveBeenCalledWith({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  });

  it('deniega cuando el projectId no existe (proyecto fantasma)', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ title: 'T', projectId: 'missing' })),
    ).resolves.toBe(false);

    expect(prisma.workspaceMember.findUnique).not.toHaveBeenCalled();
  });

  it('deniega a un no-miembro del workspace del proyecto', async () => {
    prisma.project.findUnique.mockResolvedValue({ workspaceId });
    prisma.workspaceMember.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ title: 'T', projectId: 'proj-1' })),
    ).rejects.toThrow();
  });
});
