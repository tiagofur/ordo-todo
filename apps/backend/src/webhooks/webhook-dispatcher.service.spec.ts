import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'crypto';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { WebhookCryptoService } from './webhook-crypto.service';
import { PrismaService } from '../database/prisma.service';
import { WEBHOOK_FETCH } from './webhook.constants';

describe('WebhookDispatcherService', () => {
  let service: WebhookDispatcherService;
  const mockFetch = jest.fn();
  const rawSecret = 'ordo_whsec_testsecret00000000000001';

  const subscription = {
    id: 'sub-1',
    userId: 'user-123',
    url: 'https://receiver.test/hooks/ordo',
    events: ['task.created'],
    secretCiphertext: 'encrypted',
    secretFingerprint: 'fingerprint',
    isActive: true,
  };

  const mockPrismaService = {
    webhookSubscription: {
      findMany: jest.fn(),
    },
    webhookDelivery: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCryptoService = {
    decryptSecret: jest.fn().mockReturnValue(rawSecret),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookDispatcherService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WebhookCryptoService, useValue: mockCryptoService },
        { provide: WEBHOOK_FETCH, useValue: mockFetch },
      ],
    }).compile();

    service = module.get<WebhookDispatcherService>(WebhookDispatcherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function mockDeliveryFlow(deliveryId: string) {
    mockPrismaService.webhookDelivery.create.mockImplementation(
      async ({ data }: any) => ({ id: deliveryId, ...data }),
    );
    mockPrismaService.webhookDelivery.findFirst.mockImplementation(
      async ({ where }: any) => ({
        id: deliveryId,
        subscriptionId: 'sub-1',
        event: 'task.created',
        payload: { id: 'task-1' },
        status: 'pending',
        attempts: 0,
        subscription,
        ...where,
      }),
    );
    mockPrismaService.webhookDelivery.update.mockResolvedValue({});
  }

  it('should POST a signed payload and record a delivered delivery', async () => {
    mockPrismaService.webhookSubscription.findMany.mockResolvedValue([
      subscription,
    ]);
    mockDeliveryFlow('del-1');
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await service.dispatch('task.created', { id: 'task-1' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://receiver.test/hooks/ordo');
    expect(init.method).toBe('POST');
    const timestamp = init.headers['ordo-timestamp'] as string;
    const signature = init.headers['ordo-signature'] as string;
    const expected = createHmac('sha256', rawSecret)
      .update(`${timestamp}.${init.body}`)
      .digest('hex');
    expect(signature).toBe(expected);
    expect(JSON.parse(init.body)).toEqual(
      expect.objectContaining({ event: 'task.created' }),
    );
    expect(mockPrismaService.webhookDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'delivered' }),
      }),
    );
  });

  it('should record a failed delivery with backoff when the receiver errors', async () => {
    mockPrismaService.webhookSubscription.findMany.mockResolvedValue([
      subscription,
    ]);
    mockDeliveryFlow('del-2');
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await service.dispatch('task.created', { id: 'task-2' });

    expect(mockPrismaService.webhookDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'failed',
          attempts: 1,
          nextRetryAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should retry due deliveries on schedule', async () => {
    mockPrismaService.webhookDelivery.findMany.mockResolvedValue([
      {
        id: 'del-3',
        subscriptionId: 'sub-1',
        status: 'failed',
        subscription,
      },
    ]);
    mockPrismaService.webhookDelivery.findFirst.mockResolvedValue({
      id: 'del-3',
      subscriptionId: 'sub-1',
      event: 'task.created',
      payload: { id: 'task-3' },
      status: 'failed',
      attempts: 1,
      subscription,
    });
    mockPrismaService.webhookDelivery.update.mockResolvedValue({});
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await service.retryDueDeliveries();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.webhookDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'delivered' }),
      }),
    );
  });

  it('should redeliver only owned deliveries', async () => {
    mockPrismaService.webhookDelivery.findFirst.mockResolvedValue({
      id: 'del-4',
      subscriptionId: 'sub-1',
      event: 'task.created',
      payload: { id: 'task-4' },
      status: 'failed',
      attempts: 2,
      subscription,
    });
    mockPrismaService.webhookDelivery.update.mockResolvedValue({});
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await service.redeliver('user-123', 'del-4');

    expect(mockFetch).toHaveBeenCalledTimes(1);

    mockPrismaService.webhookDelivery.findFirst.mockResolvedValue({
      id: 'del-5',
      subscription: { ...subscription, userId: 'other-user' },
    });
    await expect(service.redeliver('user-123', 'del-5')).rejects.toThrow(
      'Webhook delivery not found',
    );
  });
});
