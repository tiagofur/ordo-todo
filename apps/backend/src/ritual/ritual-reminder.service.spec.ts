import { Test, TestingModule } from '@nestjs/testing';
import { RitualReminderService } from './ritual-reminder.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

// ODD 006 S5 (T4): kind ritual reminders — configurable morning/evening
// times in the user TZ; total silence outside hours and when disabled.
describe('RitualReminderService (ODD 006 S5)', () => {
  let service: RitualReminderService;
  let prisma: {
    user: { findMany: jest.Mock };
    userPreferences: { findUnique: jest.Mock };
    ritualDay: { findUnique: jest.Mock };
    notification: { findFirst: jest.Mock };
  };
  let notifications: { create: jest.Mock };

  const prefs = (overrides = {}) => ({
    enableNotifications: true,
    ritualMorningReminder: true,
    ritualEveningReminder: true,
    ritualMorningTime: '08:00',
    ritualEveningTime: '21:00',
    ...overrides,
  });

  // Hermetic "now": pass explicit instants, never Date.now().
  const at = (iso: string) => new Date(iso);

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = {
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'user-1' }]) },
      userPreferences: { findUnique: jest.fn().mockResolvedValue(prefs()) },
      ritualDay: { findUnique: jest.fn().mockResolvedValue(null) },
      notification: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    notifications = { create: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualReminderService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();
    service = module.get<RitualReminderService>(RitualReminderService);
  });

  it('sends the morning reminder once inside the window (TZ-aware)', async () => {
    // 08:05 UTC; user in UTC with morning time 08:00 → inside window.
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);

    await service.checkReminders(at('2026-10-21T08:05:00Z'));

    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: 'RITUAL_MORNING',
      }),
    );
  });

  it('sends nothing outside work hours (total silence)', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);

    // 03:00 UTC: no ritual window open.
    await service.checkReminders(at('2026-10-21T03:00:00Z'));

    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('sends nothing when notifications are disabled', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);
    prisma.userPreferences.findUnique.mockResolvedValue(
      prefs({ enableNotifications: false }),
    );

    await service.checkReminders(at('2026-10-21T08:05:00Z'));

    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('skips the morning reminder when already DONE', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);
    prisma.ritualDay.findUnique.mockResolvedValue({
      morningStatus: 'DONE',
      eveningStatus: 'PENDING',
    });

    await service.checkReminders(at('2026-10-21T08:05:00Z'));

    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('dedups: no second reminder within 24h', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);
    prisma.notification.findFirst.mockResolvedValue({ id: 'n-1' });

    await service.checkReminders(at('2026-10-21T08:05:00Z'));

    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('honors the user timezone, not the server one', async () => {
    // 14:05 UTC = 08:05 in Mexico City (UTC-6, no DST in Oct).
    // Morning time 08:00 in user TZ → inside window.
    prisma.user.findMany.mockResolvedValue([
      { id: 'user-1', timezone: 'America/Mexico_City' },
    ]);

    await service.checkReminders(at('2026-10-21T14:05:00Z'));

    expect(notifications.create).toHaveBeenCalledTimes(1);
  });

  it('sends the evening reminder in its window', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);

    await service.checkReminders(at('2026-10-21T21:05:00Z'));

    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        type: 'RITUAL_EVENING',
      }),
    );
  });

  it('sends with schema defaults when the user has no prefs row (B2)', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]);
    prisma.userPreferences.findUnique.mockResolvedValue(null);

    await service.checkReminders(at('2026-10-21T08:05:00Z'));

    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', type: 'RITUAL_MORNING' }),
    );
  });
});

describe('RitualReminderService fallback without NotificationsService (N3)', () => {
  it('persists via Prisma directly with the required fields', async () => {
    const prisma = {
      user: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'user-1', timezone: 'UTC' }]),
      },
      userPreferences: {
        findUnique: jest.fn().mockResolvedValue({
          enableNotifications: true,
          ritualMorningReminder: true,
          ritualEveningReminder: true,
          ritualMorningTime: '08:00',
          ritualEveningTime: '21:00',
        }),
      },
      ritualDay: { findUnique: jest.fn().mockResolvedValue(null) },
      notification: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };
    // No NotificationsService provider: @Optional resolves undefined (prod path).
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualReminderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    const service = module.get<RitualReminderService>(RitualReminderService);

    await service.checkReminders(new Date('2026-10-21T08:05:00Z'));

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        type: 'RITUAL_MORNING',
        title: expect.any(String),
        message: expect.any(String),
        resourceType: 'TASK',
      }),
    });
  });
});
