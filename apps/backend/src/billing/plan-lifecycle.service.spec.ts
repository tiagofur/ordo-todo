import { Test, TestingModule } from '@nestjs/testing';
import { GRACE_PERIOD_DAYS, TRIAL } from '@ordo-todo/config';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { PlanLifecycleService } from './plan-lifecycle.service';

const DAY = 24 * 60 * 60 * 1000;
// Reloj simulado, todo en UTC (specs herméticas de zona horaria).
const T0 = new Date('2026-10-27T10:00:00.000Z');

describe('PlanLifecycleService (ODD 012 S5/T4) — timeline trial→cobro→gracia', () => {
  let service: PlanLifecycleService;

  const mockSubscription = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };
  const mockPrisma = { subscription: mockSubscription };
  const mockSendEmail = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanLifecycleService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: { sendEmail: mockSendEmail } },
      ],
    }).compile();
    service = module.get<PlanLifecycleService>(PlanLifecycleService);
  });

  describe('startTrialForNewUser', () => {
    it('crea TRIALING PRO con trialEndsAt a TRIAL.days (14) exactos', async () => {
      mockSubscription.findUnique.mockResolvedValue(null);
      mockSubscription.create.mockResolvedValue({});

      await service.startTrialForNewUser('u1', T0);

      expect(mockSubscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          plan: 'PRO',
          status: 'TRIALING',
          trialEndsAt: new Date(T0.getTime() + TRIAL.days * DAY),
          seats: 1,
        },
      });
      expect(TRIAL.days).toBe(14);
    });

    it('es idempotente: no toca una fila existente (ni siquiera INCOMPLETE de un checkout)', async () => {
      mockSubscription.findUnique.mockResolvedValue({ id: 'row1' });

      await service.startTrialForNewUser('u1', T0);

      expect(mockSubscription.create).not.toHaveBeenCalled();
    });
  });

  describe('sendTrialEndingReminders (recordatorio a 3 días, una vez)', () => {
    const sub = (trialEndsAt: Date, sentAt: Date | null = null) => ({
      id: 'row1',
      trialEndsAt,
      trialReminderSentAt: sentAt,
      user: { email: 'u1@test.dev', name: 'Usuaria' },
    });

    it('a 2 días del fin → envía email y marca trialReminderSentAt', async () => {
      mockSubscription.findMany.mockResolvedValue([
        sub(new Date(T0.getTime() + 2 * DAY)),
      ]);
      mockSubscription.update.mockResolvedValue({});

      const sent = await service.sendTrialEndingReminders(T0);

      expect(sent).toBe(1);
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'u1@test.dev',
          subject: expect.stringContaining('2 días'),
        }),
      );
      expect(mockSubscription.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: { trialReminderSentAt: T0 },
      });
    });

    it('la ventana de la consulta es [ahora, ahora+3d] (los 5 días quedan fuera en SQL)', async () => {
      // El filtro de ventana vive en el where de Prisma (mockeado): se
      // verifica la cláusula, no el comportamiento.
      mockSubscription.findMany.mockResolvedValue([]);

      await service.sendTrialEndingReminders(T0);

      expect(mockSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'TRIALING',
            trialEndsAt: {
              lte: new Date(T0.getTime() + 3 * DAY),
              gt: T0,
            },
            trialReminderSentAt: null,
          },
        }),
      );
    });

    it('email fallido → no marca (el siguiente barrido reintenta)', async () => {
      mockSubscription.findMany.mockResolvedValue([
        sub(new Date(T0.getTime() + 2 * DAY)),
      ]);
      mockSendEmail.mockRejectedValueOnce(new Error('smtp down'));

      const sent = await service.sendTrialEndingReminders(T0);

      expect(sent).toBe(0);
      expect(mockSubscription.update).not.toHaveBeenCalled();
    });
  });

  describe('expireEndedTrials', () => {
    it('trial vencido → plan FREE + CANCELED; el barrido solo toca TRIALING vencidos', async () => {
      mockSubscription.findMany.mockResolvedValue([
        { id: 'row1', userId: 'u1' },
      ]);
      mockSubscription.update.mockResolvedValue({});

      const count = await service.expireEndedTrials(T0);

      expect(count).toBe(1);
      expect(mockSubscription.findMany).toHaveBeenCalledWith({
        where: { status: 'TRIALING', trialEndsAt: { lt: T0 } },
        select: { id: true, userId: true },
      });
      expect(mockSubscription.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: { plan: 'FREE', status: 'CANCELED' },
      });
    });
  });

  describe('endExpiredGracePeriods (gracia de 14 días tras cancelar)', () => {
    it('la gracia dura GRACE_PERIOD_DAYS (14)', () => {
      expect(GRACE_PERIOD_DAYS).toBe(14);
    });

    it('CANCELED PRO con gracia vencida → plan FREE y graceEndsAt a null', async () => {
      mockSubscription.findMany.mockResolvedValue([{ id: 'row1' }]);
      mockSubscription.update.mockResolvedValue({});

      const count = await service.endExpiredGracePeriods(T0);

      expect(count).toBe(1);
      expect(mockSubscription.findMany).toHaveBeenCalledWith({
        where: {
          status: 'CANCELED',
          graceEndsAt: { lt: T0 },
          plan: { not: 'FREE' },
        },
        select: { id: true },
      });
      expect(mockSubscription.update).toHaveBeenCalledWith({
        where: { id: 'row1' },
        data: { plan: 'FREE', graceEndsAt: null },
      });
    });

    it('gracia aún vigente o plan ya FREE → no toca nada', async () => {
      mockSubscription.findMany.mockResolvedValue([]);

      const count = await service.endExpiredGracePeriods(T0);

      expect(count).toBe(0);
      expect(mockSubscription.update).not.toHaveBeenCalled();
    });
  });

  describe('timeline completo con reloj simulado (S5)', () => {
    it('registro → recordatorio a 11 días → expira a 14 → gracia → FREE', async () => {
      // 1) Registro en T0: fila TRIALING PRO hasta T0+14
      mockSubscription.findUnique.mockResolvedValue(null);
      mockSubscription.create.mockResolvedValue({});
      await service.startTrialForNewUser('u1', T0);
      const trialEndsAt = new Date(T0.getTime() + 14 * DAY);

      // 2) T0+11: dentro de la ventana de recordatorio → email y marca
      const t11 = new Date(T0.getTime() + 11 * DAY);
      mockSubscription.findMany.mockResolvedValue([subRow(trialEndsAt)]);
      mockSubscription.update.mockResolvedValue({});
      mockSendEmail.mockResolvedValue({});
      expect(await service.sendTrialEndingReminders(t11)).toBe(1);

      // 3) T0+14h+1h: el barrido expira el trial → FREE/CANCELED
      const tExpired = new Date(trialEndsAt.getTime() + 60 * 60 * 1000);
      mockSubscription.findMany.mockResolvedValue([
        { id: 'row1', userId: 'u1' },
      ]);
      expect(await service.expireEndedTrials(tExpired)).toBe(1);
      expect(mockSubscription.update).toHaveBeenLastCalledWith({
        where: { id: 'row1' },
        data: { plan: 'FREE', status: 'CANCELED' },
      });

      // 4) El usuario se suscribe de verdad y cancela: el webhook deja
      //    CANCELED PRO con graceEndsAt = cancelación + 14 (probado en su
      //    spec). Aquí simulamos la cancelación en T0+20 y la gracia:
      const cancelledAt = new Date(T0.getTime() + 20 * DAY);
      const graceEndsAt = new Date(
        cancelledAt.getTime() + GRACE_PERIOD_DAYS * DAY,
      );

      // 5) T0+33 (gracia vencida): barrido → FREE
      const tAfterGrace = new Date(graceEndsAt.getTime() + DAY);
      mockSubscription.findMany.mockResolvedValue([{ id: 'row1' }]);
      expect(await service.endExpiredGracePeriods(tAfterGrace)).toBe(1);
      expect(mockSubscription.update).toHaveBeenLastCalledWith({
        where: { id: 'row1' },
        data: { plan: 'FREE', graceEndsAt: null },
      });

      // y durante la gracia (T0+25) el barrido NO la toca:
      mockSubscription.findMany.mockResolvedValue([]);
      expect(
        await service.endExpiredGracePeriods(new Date(T0.getTime() + 25 * DAY)),
      ).toBe(0);
    });
  });
});

function subRow(trialEndsAt: Date) {
  return {
    id: 'row1',
    trialEndsAt,
    trialReminderSentAt: null,
    user: { email: 'u1@test.dev', name: 'Usuaria' },
  };
}
