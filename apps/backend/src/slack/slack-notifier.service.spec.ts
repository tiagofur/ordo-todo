import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import {
  SlackNotifierService,
  SLACK_CLIENT_FACTORY,
} from './slack-notifier.service';
import { PrismaService } from '../database/prisma.service';

describe('SlackNotifierService', () => {
  let service: SlackNotifierService;

  const mockWebClient = { chat: { postMessage: jest.fn() } };
  const mockClientFactory = jest.fn().mockReturnValue(mockWebClient);
  const mockConfigService = {
    get: jest.fn((key: string) =>
      key === 'SLACK_SIGNING_SECRET'
        ? 'test-signing-secret-0123456789abcdef'
        : undefined,
    ),
  };
  const mockPrisma = {
    userIntegration: { findMany: jest.fn(), findUnique: jest.fn() },
    slackWorkspaceMap: { findMany: jest.fn() },
    task: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackNotifierService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SLACK_CLIENT_FACTORY, useValue: mockClientFactory },
      ],
    }).compile();

    service = module.get<SlackNotifierService>(SlackNotifierService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const integration = {
    id: 'int-1',
    userId: 'user-1',
    provider: 'SLACK',
    accessToken: 'xoxb-bot',
    isActive: true,
    settings: { teamId: 'T1' },
  };

  function mockDeliverySetup() {
    mockPrisma.userIntegration.findMany.mockResolvedValue([integration]);
    mockPrisma.slackWorkspaceMap.findMany.mockResolvedValue([
      { userId: 'user-1', teamId: 'T1', slackUserId: 'U1', channelId: 'C1' },
    ]);
    mockWebClient.chat.postMessage.mockResolvedValue({
      ok: true,
      ts: '123.456',
    });
  }

  it('should post task notifications with 3 signed action buttons', async () => {
    mockDeliverySetup();

    await service.notify({
      userId: 'user-1',
      type: 'TASK_DUE',
      title: 'Write report',
      message: 'Due today at 15:00',
      resourceId: 'task-1',
      resourceType: 'TASK',
    });

    expect(mockWebClient.chat.postMessage).toHaveBeenCalledTimes(1);
    const payload = mockWebClient.chat.postMessage.mock.calls[0][0];
    expect(payload.channel).toBe('C1');
    expect(payload.text).toContain('Write report');
    const actions = payload.blocks.find((b: any) => b.type === 'actions');
    expect(actions.elements.map((e: any) => e.action_id)).toEqual([
      'ordo_task_complete',
      'ordo_task_postpone',
      'ordo_task_view',
    ]);
    for (const element of actions.elements) {
      expect(element.value).toMatch(/^task-1\.\d+\.[0-9a-f]{64}$/);
    }
  });

  it('should skip users without Slack integrations', async () => {
    mockPrisma.userIntegration.findMany.mockResolvedValue([]);

    await service.notify({
      userId: 'user-9',
      type: 'TASK_DUE',
      title: 'x',
    });

    expect(mockWebClient.chat.postMessage).not.toHaveBeenCalled();
  });

  it('should skip non-task notifications without resource', async () => {
    mockDeliverySetup();

    await service.notify({
      userId: 'user-1',
      type: 'WELCOME',
      title: 'Welcome!',
    });

    expect(mockWebClient.chat.postMessage).not.toHaveBeenCalled();
  });

  it('should verify signed action values and reject tampered/expired ones', async () => {
    const value = (service as any).signAction('task-1', 'complete');
    expect(await service.verifyAction(value, 60_000)).toEqual(
      expect.objectContaining({ taskId: 'task-1' }),
    );

    const [taskId, ts, sig] = value.split('.');
    const tampered = `task-9.${ts}.${sig}`;
    await expect(service.verifyAction(tampered, 60_000)).rejects.toThrow(
      'Invalid action signature',
    );

    const oldTs = (Date.now() - 120_000).toString();
    const oldSig = createHmac('sha256', 'test-signing-secret-0123456789abcdef')
      .update(`task-1.${oldTs}`)
      .digest('hex');
    await expect(
      service.verifyAction(`task-1.${oldTs}.${oldSig}`, 60_000),
    ).rejects.toThrow('expired');
  });
});
