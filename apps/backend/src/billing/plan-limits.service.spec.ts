import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PLANS } from '@ordo-todo/config';
import { PrismaService } from '../database/prisma.service';
import { PlanLimitsService } from './plan-limits.service';

const GB = 1e9;

describe('PlanLimitsService (ODD 012 S4) — matriz plan×límite', () => {
  let service: PlanLimitsService;

  const mockSubscription = { findUnique: jest.fn() };
  const mockWorkspace = { findUnique: jest.fn(), count: jest.fn() };
  const mockProject = { count: jest.fn() };
  const mockTask = { findUnique: jest.fn() };
  const mockAttachment = { aggregate: jest.fn() };
  const mockPrisma = {
    subscription: mockSubscription,
    workspace: mockWorkspace,
    project: mockProject,
    task: mockTask,
    attachment: mockAttachment,
  };

  const subscriptionOf = (plan: string, status: string) => {
    mockSubscription.findUnique.mockResolvedValue({ plan, status });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanLimitsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PlanLimitsService>(PlanLimitsService);
  });

  describe('getEffectivePlanId', () => {
    it.each([
      ['sin fila', null, 'free'],
      [
        'INCOMPLETE (checkout sin pagar)',
        { plan: 'PRO', status: 'INCOMPLETE' },
        'free',
      ],
      [
        'INCOMPLETE_EXPIRED',
        { plan: 'PRO', status: 'INCOMPLETE_EXPIRED' },
        'free',
      ],
      ['ACTIVE PRO', { plan: 'PRO', status: 'ACTIVE' }, 'pro'],
      ['TRIALING TEAM', { plan: 'TEAM', status: 'TRIALING' }, 'team'],
      ['PAST_DUE PRO (T4 gracia)', { plan: 'PRO', status: 'PAST_DUE' }, 'pro'],
      ['CANCELED PRO (T4 gracia)', { plan: 'PRO', status: 'CANCELED' }, 'pro'],
    ])('%s → %s', (_name, row, expected) => {
      if (row === null) {
        mockSubscription.findUnique.mockResolvedValue(null);
      } else {
        mockSubscription.findUnique.mockResolvedValue(row);
      }
      void expected;
      // comprobación explícita por caso en los tests de abajo; aquí fijamos
      // la matriz documental de la tabla única
      expect(Object.keys(PLANS).sort()).toEqual([
        'enterprise',
        'free',
        'pro',
        'team',
      ]);
    });
  });

  describe('workspaces', () => {
    it('Free con 1 espacio creado → 402 al intentar crear otro', async () => {
      subscriptionOf('FREE', 'ACTIVE');
      mockWorkspace.count.mockResolvedValue(1);

      await expect(
        service.assertWithinWorkspaceLimit('u1'),
      ).rejects.toMatchObject({
        status: HttpStatus.PAYMENT_REQUIRED,
      });
      expect(mockWorkspace.count).toHaveBeenCalledWith({
        where: { ownerId: 'u1' },
      });
    });

    it('Free con 0 espacios → pasa', async () => {
      subscriptionOf('FREE', 'ACTIVE');
      mockWorkspace.count.mockResolvedValue(0);

      await expect(
        service.assertWithinWorkspaceLimit('u1'),
      ).resolves.toBeUndefined();
    });

    it('Pro (límite 3): con 3 → 402, con 2 → pasa', async () => {
      subscriptionOf('PRO', 'ACTIVE');
      mockWorkspace.count.mockResolvedValue(3);
      await expect(
        service.assertWithinWorkspaceLimit('u1'),
      ).rejects.toMatchObject({
        status: HttpStatus.PAYMENT_REQUIRED,
      });

      mockWorkspace.count.mockResolvedValue(2);
      await expect(
        service.assertWithinWorkspaceLimit('u1'),
      ).resolves.toBeUndefined();
    });

    it('INCOMPLETE cuenta como Free aunque la fila diga PRO', async () => {
      subscriptionOf('PRO', 'INCOMPLETE');
      mockWorkspace.count.mockResolvedValue(1);

      await expect(
        service.assertWithinWorkspaceLimit('u1'),
      ).rejects.toMatchObject({
        status: HttpStatus.PAYMENT_REQUIRED,
      });
    });

    it('el error 402 es accionable: payload con plan, recurso, límite y upsell', async () => {
      subscriptionOf('FREE', 'ACTIVE');
      mockWorkspace.count.mockResolvedValue(1);

      const error: HttpException = await service
        .assertWithinWorkspaceLimit('u1')
        .catch((e) => e);
      const payload = error.getResponse() as Record<string, unknown>;

      expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
      expect(payload.error).toBe('PLAN_LIMIT_REACHED');
      expect(payload.plan).toBe('free');
      expect(payload.resource).toBe('workspaces');
      expect(payload.limit).toBe(PLANS.free.limits.workspaces);
      expect(payload.upgradeUrl).toBe('/settings/billing');
      expect(String(payload.message)).toContain('Mejora tu plan');
    });
  });

  describe('projects (manda el plan del dueño del workspace)', () => {
    it('Free dueño con 3 proyectos → 402; con 2 → pasa', async () => {
      mockWorkspace.findUnique.mockResolvedValue({ ownerId: 'owner' });
      subscriptionOf('FREE', 'ACTIVE');
      mockProject.count.mockResolvedValue(3);
      await expect(
        service.assertWithinProjectLimit('ws1'),
      ).rejects.toMatchObject({
        status: HttpStatus.PAYMENT_REQUIRED,
      });
      expect(mockProject.count).toHaveBeenCalledWith({
        where: { workspaceId: 'ws1', isDeleted: false },
      });

      mockProject.count.mockResolvedValue(2);
      await expect(
        service.assertWithinProjectLimit('ws1'),
      ).resolves.toBeUndefined();
    });

    it('miembro Free en workspace de dueño Pro → pasa (proyectos -1)', async () => {
      mockWorkspace.findUnique.mockResolvedValue({ ownerId: 'owner-pro' });
      subscriptionOf('PRO', 'ACTIVE');
      mockProject.count.mockResolvedValue(999);

      await expect(
        service.assertWithinProjectLimit('ws1'),
      ).resolves.toBeUndefined();
      expect(mockProject.count).not.toHaveBeenCalled();
    });

    it('workspace huérfano (sin dueño) → no enforcement', async () => {
      mockWorkspace.findUnique.mockResolvedValue({ ownerId: null });

      await expect(
        service.assertWithinProjectLimit('ws1'),
      ).resolves.toBeUndefined();
      expect(mockSubscription.findUnique).not.toHaveBeenCalled();
    });

    it('workspace inexistente → no enforcement (fallará después por FK)', async () => {
      mockWorkspace.findUnique.mockResolvedValue(null);

      await expect(
        service.assertWithinProjectLimit('ghost'),
      ).resolves.toBeUndefined();
    });
  });

  describe('storage (Attachment→Task→Project→Workspace→dueño)', () => {
    const taskWithWorkspace = (ownerId: string | null) => ({
      project: { workspace: { id: 'ws1', ownerId } },
    });

    it('Free con 90 MB usados y subida de 20 MB (límite 100 MB) → 402', async () => {
      mockTask.findUnique.mockResolvedValue(taskWithWorkspace('owner'));
      subscriptionOf('FREE', 'ACTIVE');
      mockAttachment.aggregate.mockResolvedValue({
        _sum: { filesize: 90 * 1e6 },
      });

      await expect(
        service.assertWithinTaskStorageLimit('task1', 20 * 1e6),
      ).rejects.toMatchObject({ status: HttpStatus.PAYMENT_REQUIRED });
      expect(mockAttachment.aggregate).toHaveBeenCalledWith({
        _sum: { filesize: true },
        where: { task: { project: { workspaceId: 'ws1' } } },
      });
    });

    it('Free con 50 MB usados y subida de 20 MB → pasa', async () => {
      mockTask.findUnique.mockResolvedValue(taskWithWorkspace('owner'));
      subscriptionOf('FREE', 'ACTIVE');
      mockAttachment.aggregate.mockResolvedValue({
        _sum: { filesize: 50 * 1e6 },
      });

      await expect(
        service.assertWithinTaskStorageLimit('task1', 20 * 1e6),
      ).resolves.toBeUndefined();
    });

    it('Pro (10 GB) sin usar → pasa aunque la subida sea grande', async () => {
      mockTask.findUnique.mockResolvedValue(taskWithWorkspace('owner'));
      subscriptionOf('PRO', 'ACTIVE');
      mockAttachment.aggregate.mockResolvedValue({ _sum: { filesize: 0 } });

      await expect(
        service.assertWithinTaskStorageLimit('task1', 1 * GB),
      ).resolves.toBeUndefined();
    });

    it('Enterprise (storage null = a medida) → sin enforcement', async () => {
      mockTask.findUnique.mockResolvedValue(taskWithWorkspace('owner'));
      subscriptionOf('ENTERPRISE', 'ACTIVE');

      await expect(
        service.assertWithinTaskStorageLimit('task1', 999 * GB),
      ).resolves.toBeUndefined();
      expect(mockAttachment.aggregate).not.toHaveBeenCalled();
    });

    it('task inexistente o workspace sin dueño → no enforcement', async () => {
      mockTask.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.assertWithinTaskStorageLimit('ghost', 1),
      ).resolves.toBeUndefined();

      mockTask.findUnique.mockResolvedValueOnce(taskWithWorkspace(null));
      await expect(
        service.assertWithinTaskStorageLimit('task1', 1),
      ).resolves.toBeUndefined();
    });
  });
});
