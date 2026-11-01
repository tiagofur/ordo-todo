import { Test, TestingModule } from '@nestjs/testing';
import { SmartNotificationsService } from './smart-notifications.service';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';

describe('SmartNotificationsService crons (ODD 027 T7)', () => {
  let service: SmartNotificationsService;
  let prisma: {
    user: { findMany: jest.Mock };
    task: { count: jest.Mock };
    notification: { findFirst: jest.Mock; create: jest.Mock };
  };
  let notificationsService: { create: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn((args?: { cursor?: { id: string } }) =>
          Promise.resolve(args?.cursor ? [] : [{ id: 'user-1' }]),
        ),
      },
      task: { count: jest.fn().mockResolvedValue(0) },
      notification: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };
    notificationsService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartNotificationsService,
        { provide: NotificationsService, useValue: notificationsService },
        { provide: PrismaService, useValue: prisma },
        { provide: 'TimerRepository', useValue: {} },
      ],
    }).compile();

    service = module.get<SmartNotificationsService>(
      SmartNotificationsService,
    );
  });

  it('sendDailyPlanningReminder scans users in batches and notifies once', async () => {
    await service.sendDailyPlanningReminder();

    // Single short page: exactly one paginated query (see cron-batch.spec
    // for the multi-page walk).
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: expect.any(Number),
        orderBy: { id: 'asc' },
      }),
    );
    expect(notificationsService.create).toHaveBeenCalledTimes(1);
    expect(notificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
  });

  it('sendDailyPlanningReminder skips users who already created tasks', async () => {
    prisma.task.count.mockResolvedValue(3);

    await service.sendDailyPlanningReminder();

    expect(notificationsService.create).not.toHaveBeenCalled();
  });
});
