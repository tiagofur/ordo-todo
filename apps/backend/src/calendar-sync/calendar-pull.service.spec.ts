import { Test, TestingModule } from '@nestjs/testing';
import { CalendarPullService } from './calendar-pull.service';
import { PrismaService } from '../database/prisma.service';
import { CalendarConnectionsService } from './calendar-connections.service';
import { V1TasksService } from '../v1/v1-tasks.service';
import { CALENDAR_FETCH } from './calendar.constants';

describe('CalendarPullService', () => {
  let service: CalendarPullService;
  const mockFetch = jest.fn();

  const mockPrisma = {
    userIntegration: { findMany: jest.fn(), findUnique: jest.fn() },
    calendarEventMapping: { findMany: jest.fn() },
    externalCalendarBlock: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const mockConnections = {
    getAccessToken: jest.fn().mockResolvedValue('access-123'),
  };
  const mockV1Tasks = { create: jest.fn() };

  const integration = {
    id: 'int-1',
    userId: 'user-1',
    provider: 'GOOGLE_CALENDAR',
    isActive: true,
    settings: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarPullService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CalendarConnectionsService, useValue: mockConnections },
        { provide: V1TasksService, useValue: mockV1Tasks },
        { provide: CALENDAR_FETCH, useValue: mockFetch },
      ],
    }).compile();

    service = module.get<CalendarPullService>(CalendarPullService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockGoogleEvents(items: unknown[]) {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items, nextSyncToken: 'sync-abc' }),
      text: async () => '',
    });
  }

  function mockSetup(settings: Record<string, unknown> = {}) {
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      { ...integration, settings },
    ]);
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([]);
    mockPrisma.externalCalendarBlock.upsert.mockImplementation(
      async ({ create }: any) => ({ id: 'block-1', ...create }),
    );
  }

  it('should import Google events as busy blocks, never as tasks', async () => {
    mockSetup();
    mockGoogleEvents([
      {
        id: 'evt-ext-1',
        summary: 'Team standup',
        start: { dateTime: '2026-10-26T09:00:00Z' },
        end: { dateTime: '2026-10-26T09:30:00Z' },
      },
    ]);

    const result = await service.pullUser('user-1');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    );
    expect(mockPrisma.externalCalendarBlock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          integrationId_calendarId_eventId: {
            integrationId: 'int-1',
            calendarId: 'primary',
            eventId: 'evt-ext-1',
          },
        }),
      }),
    );
    expect(mockV1Tasks.create).not.toHaveBeenCalled();
    expect(result.blocks).toBe(1);
    expect(result.tasks).toBe(0);
  });

  it('should skip events created by Ordo itself (echo prevention)', async () => {
    mockSetup();
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([
      { eventId: 'evt-ordo-1' },
    ]);
    mockGoogleEvents([
      {
        id: 'evt-ordo-1',
        summary: 'Write report',
        start: { dateTime: '2026-10-26T15:00:00Z' },
        end: { dateTime: '2026-10-26T15:00:00Z' },
        extendedProperties: { private: { ordoTaskId: 'task-1' } },
      },
      {
        id: 'evt-ext-2',
        summary: 'Lunch',
        start: { dateTime: '2026-10-26T12:00:00Z' },
        end: { dateTime: '2026-10-26T13:00:00Z' },
      },
    ]);

    const result = await service.pullUser('user-1');

    expect(mockPrisma.externalCalendarBlock.upsert).toHaveBeenCalledTimes(1);
    expect(result.blocks).toBe(1);
  });

  it('should skip cancelled events and all-day events without times', async () => {
    mockSetup();
    mockGoogleEvents([
      { id: 'evt-cancelled', status: 'cancelled' },
      { id: 'evt-allday', summary: 'Holiday', start: { date: '2026-12-25' } },
    ]);

    const result = await service.pullUser('user-1');

    expect(mockPrisma.externalCalendarBlock.upsert).not.toHaveBeenCalled();
    expect(result.blocks).toBe(0);
  });

  it('should create tasks only with explicit opt-in + target project', async () => {
    mockSetup({ importAsTasks: true, importProjectId: 'proj-inbox' });
    mockV1Tasks.create.mockResolvedValue({ id: 'task-new' });
    mockGoogleEvents([
      {
        id: 'evt-ext-3',
        summary: 'Prepare slides',
        start: { dateTime: '2026-10-27T10:00:00Z' },
        end: { dateTime: '2026-10-27T11:00:00Z' },
      },
    ]);

    const result = await service.pullUser('user-1');

    expect(mockV1Tasks.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        title: 'Prepare slides',
        projectId: 'proj-inbox',
      }),
    );
    expect(result.tasks).toBe(1);
  });

  it('should NOT create tasks when opt-in lacks a target project', async () => {
    mockSetup({ importAsTasks: true });
    mockGoogleEvents([
      {
        id: 'evt-ext-4',
        summary: 'Something',
        start: { dateTime: '2026-10-27T10:00:00Z' },
        end: { dateTime: '2026-10-27T11:00:00Z' },
      },
    ]);

    const result = await service.pullUser('user-1');

    expect(mockV1Tasks.create).not.toHaveBeenCalled();
    expect(result.tasks).toBe(0);
    // Block still imported — opt-in failure never loses the busy info.
    expect(result.blocks).toBe(1);
  });

  it('should list busy blocks in a date range for scheduling', async () => {
    mockPrisma.externalCalendarBlock.findMany.mockResolvedValue([
      { id: 'block-1', title: 'Standup' },
    ]);

    const blocks = await service.listBlocks(
      'user-1',
      new Date('2026-10-26T00:00:00Z'),
      new Date('2026-10-27T00:00:00Z'),
    );

    expect(mockPrisma.externalCalendarBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
    expect(blocks).toHaveLength(1);
  });
});
