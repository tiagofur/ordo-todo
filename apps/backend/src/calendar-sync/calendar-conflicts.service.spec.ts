import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import { CalendarConflictsService } from './calendar-conflicts.service';
import { PrismaService } from '../database/prisma.service';

function hashOf(title: string, due: string, status: string): string {
  return createHash('sha256')
    .update(JSON.stringify({ title, due, status }))
    .digest('hex');
}

describe('CalendarConflictsService', () => {
  let service: CalendarConflictsService;

  const mockPrisma = {
    task: { findUnique: jest.fn() },
    calendarEventMapping: { findMany: jest.fn(), update: jest.fn() },
    userIntegration: { findMany: jest.fn(), update: jest.fn() },
  };

  const mapping = {
    id: 'map-1',
    userId: 'user-1',
    taskId: 'task-1',
    provider: 'GOOGLE_CALENDAR',
    integrationId: 'int-1',
    calendarId: 'primary',
    eventId: 'evt-1',
    lastSyncedHash: hashOf('Write report', '2026-10-25T15:00:00.000Z', 'TODO'),
    lastSyncedAt: new Date('2026-10-19T10:00:00Z'),
  };
  const task = {
    id: 'task-1',
    title: 'Write report',
    status: 'TODO',
    dueDate: new Date('2026-10-25T15:00:00Z'),
    updatedAt: new Date('2026-10-19T10:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarConflictsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CalendarConflictsService>(CalendarConflictsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should report no conflict when neither side changed', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(task);

    const result = await service.detect('user-1', mapping as never, {
      title: 'Write report',
      dueDate: new Date('2026-10-25T15:00:00Z'),
      status: 'TODO',
      updatedAt: new Date('2026-10-19T10:00:00Z'),
    });

    expect(result.conflict).toBe(false);
    expect(result.localChanged).toBe(false);
    expect(result.remoteChanged).toBe(false);
  });

  it('should report local-only change when the task moved', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      ...task,
      title: 'Write report v2',
      updatedAt: new Date('2026-10-19T11:00:00Z'),
    });

    const result = await service.detect('user-1', mapping as never, {
      title: 'Write report',
      dueDate: new Date('2026-10-25T15:00:00Z'),
      status: 'TODO',
      updatedAt: new Date('2026-10-19T10:00:00Z'),
    });

    expect(result.conflict).toBe(false);
    expect(result.localChanged).toBe(true);
    expect(result.remoteChanged).toBe(false);
    expect(result.winner).toBe('local');
  });

  it('should report remote-only change when the event moved', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(task);

    const result = await service.detect('user-1', mapping as never, {
      title: 'Write report (moved)',
      dueDate: new Date('2026-10-25T15:00:00Z'),
      status: 'TODO',
      updatedAt: new Date('2026-10-19T11:30:00Z'),
    });

    expect(result.conflict).toBe(false);
    expect(result.localChanged).toBe(false);
    expect(result.remoteChanged).toBe(true);
    expect(result.winner).toBe('remote');
  });

  it('should flag a conflict when both sides changed, newest wins', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      ...task,
      title: 'Write report v2',
      updatedAt: new Date('2026-10-19T11:00:00Z'),
    });

    const result = await service.detect('user-1', mapping as never, {
      title: 'Write report (moved)',
      dueDate: new Date('2026-10-26T15:00:00Z'),
      status: 'TODO',
      updatedAt: new Date('2026-10-19T12:00:00Z'),
    });

    expect(result.conflict).toBe(true);
    expect(result.localChanged).toBe(true);
    expect(result.remoteChanged).toBe(true);
    expect(result.winner).toBe('remote');
    expect(result.details).toEqual(
      expect.objectContaining({ taskId: 'task-1', eventId: 'evt-1' }),
    );
  });

  it('should record conflicts in the integration settings log', async () => {
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      { id: 'int-1', settings: {} },
    ]);

    await service.recordConflict('user-1', 'int-1', {
      taskId: 'task-1',
      eventId: 'evt-1',
      winner: 'remote',
    } as never);

    expect(mockPrisma.userIntegration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'int-1' },
        data: expect.objectContaining({
          settings: expect.objectContaining({
            conflicts: expect.arrayContaining([
              expect.objectContaining({ taskId: 'task-1', winner: 'remote' }),
            ]),
          }),
        }),
      }),
    );
  });

  it('should report account sync status for the UI', async () => {
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      {
        id: 'int-1',
        provider: 'GOOGLE_CALENDAR',
        isActive: true,
        providerEmail: 'a@gmail.com',
        lastSyncAt: new Date(),
        settings: {},
      },
      {
        id: 'int-2',
        provider: 'MICROSOFT_CALENDAR',
        isActive: false,
        providerEmail: 'a@outlook.com',
        lastSyncAt: null,
        settings: { status: 're-auth-required' },
      },
    ]);

    const status = await service.accountStatus('user-1');

    expect(status).toEqual([
      expect.objectContaining({
        provider: 'GOOGLE_CALENDAR',
        status: 'ok',
        email: 'a@gmail.com',
      }),
      expect.objectContaining({
        provider: 'MICROSOFT_CALENDAR',
        status: 're-auth-required',
        email: 'a@outlook.com',
      }),
    ]);
  });
});
