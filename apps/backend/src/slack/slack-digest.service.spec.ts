import { Test, TestingModule } from '@nestjs/testing';
import { SlackDigestService } from './slack-digest.service';
import { SLACK_CLIENT_FACTORY } from './slack-notifier.service';
import { PrismaService } from '../database/prisma.service';
import { V1TasksService } from '../v1/v1-tasks.service';

describe('SlackDigestService', () => {
  let service: SlackDigestService;

  const mockWebClient = { chat: { postMessage: jest.fn() } };
  const mockClientFactory = jest.fn().mockReturnValue(mockWebClient);
  const mockPrisma = {
    userIntegration: { findMany: jest.fn() },
    slackWorkspaceMap: { findMany: jest.fn() },
  };
  const mockV1Tasks = { list: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackDigestService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: V1TasksService, useValue: mockV1Tasks },
        { provide: SLACK_CLIENT_FACTORY, useValue: mockClientFactory },
      ],
    }).compile();

    service = module.get<SlackDigestService>(SlackDigestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockSubscribed() {
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      {
        id: 'int-1',
        userId: 'user-1',
        provider: 'SLACK',
        accessToken: 'xoxb-bot',
        isActive: true,
        settings: { teamId: 'T1' },
      },
    ]);
    mockPrisma.slackWorkspaceMap.findMany.mockResolvedValue([
      {
        userId: 'user-1',
        teamId: 'T1',
        channelId: 'C1',
        dailySummary: true,
        summaryHour: 8,
      },
    ]);
    mockV1Tasks.list.mockResolvedValue([
      { id: 'task-1', title: 'Write report', status: 'TODO' },
      { id: 'task-2', title: 'Ship it', status: 'COMPLETED' },
    ]);
    mockWebClient.chat.postMessage.mockResolvedValue({ ok: true, ts: '1.1' });
  }

  it('should post the daily briefing to subscribed channels at their hour', async () => {
    mockSubscribed();

    await service.runHourly(new Date('2026-10-19T08:05:00Z'));

    expect(mockWebClient.chat.postMessage).toHaveBeenCalledTimes(1);
    const payload = mockWebClient.chat.postMessage.mock.calls[0][0];
    expect(payload.channel).toBe('C1');
    expect(payload.text).toContain('Write report');
  });

  it('should skip channels whose hour does not match', async () => {
    mockSubscribed();

    await service.runHourly(new Date('2026-10-19T14:00:00Z'));

    expect(mockWebClient.chat.postMessage).not.toHaveBeenCalled();
  });

  it('should skip unsubscribed and tokenless integrations', async () => {
    mockPrisma.userIntegration.findMany.mockResolvedValue([
      {
        id: 'int-1',
        userId: 'user-1',
        provider: 'SLACK',
        accessToken: null,
        isActive: true,
        settings: { teamId: 'T1' },
      },
    ]);
    mockPrisma.slackWorkspaceMap.findMany.mockResolvedValue([
      { userId: 'user-1', teamId: 'T1', channelId: 'C1', dailySummary: false },
    ]);

    await service.runHourly(new Date('2026-10-19T08:00:00Z'));

    expect(mockWebClient.chat.postMessage).not.toHaveBeenCalled();
    expect(mockV1Tasks.list).not.toHaveBeenCalled();
  });
});
