import { Test, TestingModule } from '@nestjs/testing';
import { SlackFocusSyncService } from './slack-focus-sync.service';
import { SLACK_CLIENT_FACTORY } from './slack-notifier.service';
import { PrismaService } from '../database/prisma.service';

describe('SlackFocusSyncService', () => {
  let service: SlackFocusSyncService;

  const mockWebClient = {
    users: {
      profile: { set: jest.fn() },
    },
    dnd: {
      setSnooze: jest.fn(),
      endSnooze: jest.fn(),
    },
  };
  const mockClientFactory = jest.fn().mockReturnValue(mockWebClient);
  const mockPrisma = {
    userIntegration: { findMany: jest.fn() },
    slackWorkspaceMap: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackFocusSyncService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SLACK_CLIENT_FACTORY, useValue: mockClientFactory },
      ],
    }).compile();

    service = module.get<SlackFocusSyncService>(SlackFocusSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockOptedIn(dnd = false) {
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
        slackUserId: 'U1',
        focusSync: true,
        focusDnd: dnd,
      },
    ]);
    mockWebClient.users.profile.set.mockResolvedValue({ ok: true });
    mockWebClient.dnd.setSnooze.mockResolvedValue({ ok: true });
    mockWebClient.dnd.endSnooze.mockResolvedValue({ ok: true });
  }

  it('should set focus status with end time on focus start', async () => {
    mockOptedIn();
    const endsAt = new Date('2026-10-19T15:30:00Z');

    await service.onFocusStart('user-1', endsAt, 25);

    expect(mockWebClient.users.profile.set).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          status_text: expect.stringContaining('foco hasta'),
          status_emoji: ':tomato:',
        }),
      }),
    );
    expect(mockWebClient.dnd.setSnooze).not.toHaveBeenCalled();
  });

  it('should enable DND when the user opted in', async () => {
    mockOptedIn(true);

    await service.onFocusStart('user-1', new Date(), 25);

    expect(mockWebClient.dnd.setSnooze).toHaveBeenCalledWith(
      expect.objectContaining({ num_minutes: 25 }),
    );
  });

  it('should clear status and end snooze on focus end', async () => {
    mockOptedIn(true);

    await service.onFocusEnd('user-1');

    expect(mockWebClient.users.profile.set).toHaveBeenCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          status_text: '',
          status_emoji: '',
        }),
      }),
    );
    expect(mockWebClient.dnd.endSnooze).toHaveBeenCalled();
  });

  it('should do nothing when the user did not opt in', async () => {
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
      { userId: 'user-1', teamId: 'T1', slackUserId: 'U1', focusSync: false },
    ]);

    await service.onFocusStart('user-1', new Date(), 25);
    await service.onFocusEnd('user-1');

    expect(mockWebClient.users.profile.set).not.toHaveBeenCalled();
    expect(mockWebClient.dnd.setSnooze).not.toHaveBeenCalled();
    expect(mockWebClient.dnd.endSnooze).not.toHaveBeenCalled();
  });
});
