import { Test, TestingModule } from '@nestjs/testing';
import { CalendarPushService } from './calendar-push.service';
import { CALENDAR_FETCH } from './calendar.constants';
import { PrismaService } from '../database/prisma.service';
import { CalendarConnectionsService } from './calendar-connections.service';

describe('CalendarPushService', () => {
  let service: CalendarPushService;
  const mockFetch = jest.fn();

  const mockPrisma = {
    task: { findUnique: jest.fn() },
    project: { findUnique: jest.fn() },
    calendarEventMapping: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    userIntegration: { findMany: jest.fn() },
  };
  const mockConnections = {
    getAccessToken: jest.fn().mockResolvedValue('access-123'),
  };

  const task = {
    id: 'task-1',
    ownerId: 'user-1',
    projectId: 'proj-1',
    title: 'Write report',
    description: 'Q3 numbers',
    status: 'TODO',
    dueDate: new Date('2026-10-25T15:00:00Z'),
    project: { id: 'proj-1', settings: {} },
  };
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
        CalendarPushService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CalendarConnectionsService, useValue: mockConnections },
        { provide: CALENDAR_FETCH, useValue: mockFetch },
      ],
    }).compile();

    service = module.get<CalendarPushService>(CalendarPushService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockTaskWithIntegration(settings: Record<string, unknown> = {}) {
    mockPrisma.task.findUnique.mockResolvedValue({
      ...task,
      project: { id: 'proj-1', settings },
    });
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      { ...integration, settings },
    ]);
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([]);
    mockPrisma.calendarEventMapping.upsert.mockImplementation(
      async ({ create }: any) => ({ id: 'map-1', ...create }),
    );
  }

  it('should create a Google event for a dated task with no mapping', async () => {
    mockTaskWithIntegration();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'evt-google-1' }),
      text: async () => '',
    });

    await service.pushTask('user-1', 'task-1');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    );
    expect(init.method).toBe('POST');
    expect(init.headers.authorization).toBe('Bearer access-123');
    const body = JSON.parse(init.body);
    expect(body.summary).toBe('Write report');
    expect(body.description).toBe('Q3 numbers');
    expect(body.start.dateTime).toBe('2026-10-25T15:00:00.000Z');
    expect(body.extendedProperties.private.ordoTaskId).toBe('task-1');
    expect(mockPrisma.calendarEventMapping.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          taskId_provider_calendarId: {
            taskId: 'task-1',
            provider: 'GOOGLE_CALENDAR',
            calendarId: 'primary',
          },
        }),
      }),
    );
  });

  it('should PATCH the existing event when a mapping exists', async () => {
    mockTaskWithIntegration();
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([
      {
        id: 'map-1',
        taskId: 'task-1',
        provider: 'GOOGLE_CALENDAR',
        integrationId: 'int-1',
        calendarId: 'primary',
        eventId: 'evt-google-1',
      },
    ]);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'evt-google-1' }),
      text: async () => '',
    });

    await service.pushTask('user-1', 'task-1');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events/evt-google-1',
    );
    expect(init.method).toBe('PATCH');
  });

  it('should respect the project target calendar', async () => {
    mockTaskWithIntegration({ calendarId: 'work@group.calendar.google.com' });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'evt-2' }),
      text: async () => '',
    });

    await service.pushTask('user-1', 'task-1');

    expect(mockFetch.mock.calls[0][0]).toContain(
      '/calendars/work%40group.calendar.google.com/events',
    );
  });

  it('should mark completed tasks per the completedFormat setting', async () => {
    mockTaskWithIntegration({ completedFormat: 'prefix' });
    mockPrisma.task.findUnique.mockResolvedValue({
      ...task,
      status: 'COMPLETED',
      project: { id: 'proj-1', settings: { completedFormat: 'prefix' } },
    });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'evt-3' }),
      text: async () => '',
    });

    await service.pushTask('user-1', 'task-1');

    expect(JSON.parse(mockFetch.mock.calls[0][1].body).summary).toBe(
      '✅ Write report',
    );
  });

  it('should skip tasks without dates and inactive integrations', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      ...task,
      dueDate: null,
      project: { id: 'proj-1', settings: {} },
    });
    mockPrisma.userIntegration.findMany.mockResolvedValue([integration]);

    await service.pushTask('user-1', 'task-1');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockPrisma.calendarEventMapping.upsert).not.toHaveBeenCalled();
  });

  it('should delete or keep the event on task removal per settings', async () => {
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([
      {
        id: 'map-1',
        userId: 'user-1',
        taskId: 'task-1',
        provider: 'GOOGLE_CALENDAR',
        integrationId: 'int-1',
        calendarId: 'primary',
        eventId: 'evt-google-1',
      },
    ]);
    mockPrisma.userIntegration.findMany.mockResolvedValue([integration]);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
      text: async () => '',
    });

    await service.removeTask('user-1', 'task-1', { onDelete: 'delete' });

    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    expect(mockPrisma.calendarEventMapping.deleteMany).toHaveBeenCalled();

    jest.clearAllMocks();
    mockPrisma.calendarEventMapping.findMany.mockResolvedValue([
      {
        id: 'map-1',
        userId: 'user-1',
        taskId: 'task-1',
        provider: 'GOOGLE_CALENDAR',
        integrationId: 'int-1',
        calendarId: 'primary',
        eventId: 'evt-google-1',
      },
    ]);

    await service.removeTask('user-1', 'task-1', { onDelete: 'keep' });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockPrisma.calendarEventMapping.deleteMany).toHaveBeenCalled();
  });
});
