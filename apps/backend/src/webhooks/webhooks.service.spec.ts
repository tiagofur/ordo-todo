import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookCryptoService } from './webhook-crypto.service';
import { PrismaService } from '../database/prisma.service';

describe('WebhooksService', () => {
  let service: WebhooksService;

  const mockPrismaService = {
    webhookSubscription: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    webhookDelivery: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCryptoService = {
    encryptSecret: jest
      .fn()
      .mockReturnValue({ ciphertext: 'encrypted', fingerprint: 'fp' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WebhookCryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an https-only subscription with a generated secret', async () => {
      mockPrismaService.webhookSubscription.create.mockImplementation(
        async ({ data }: any) => ({
          id: 'sub-1',
          userId: 'user-123',
          url: data.url,
          events: data.events,
          secretCiphertext: data.secretCiphertext,
          secretFingerprint: data.secretFingerprint,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create('user-123', {
        url: 'https://receiver.test/hooks/ordo',
        events: ['task.created', 'task.completed'],
      } as never);

      expect(result.secret).toMatch(/^ordo_whsec_/);
      expect(result.url).toBe('https://receiver.test/hooks/ordo');
      const stored =
        mockPrismaService.webhookSubscription.create.mock.calls[0][0].data;
      expect(stored.secretCiphertext).toBe('encrypted');
      expect(stored.secretCiphertext).not.toContain('ordo_whsec_');
      expect(stored.userId).toBe('user-123');
    });

    it('should reject non-https URLs and unknown events', async () => {
      await expect(
        service.create('user-123', {
          url: 'http://receiver.test/hooks',
          events: ['task.created'],
        } as never),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create('user-123', {
          url: 'https://receiver.test/hooks',
          events: ['task.exploded'],
        } as never),
      ).rejects.toThrow(BadRequestException);

      expect(
        mockPrismaService.webhookSubscription.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('list and remove', () => {
    it('should list user subscriptions without secrets', async () => {
      mockPrismaService.webhookSubscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          url: 'https://receiver.test/hooks/ordo',
          events: ['task.created'],
          isActive: true,
          createdAt: new Date(),
        },
      ]);

      const result = await service.list('user-123');

      expect(
        mockPrismaService.webhookSubscription.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-123' } }),
      );
      expect(result[0]).not.toHaveProperty('secretCiphertext');
      expect(result[0]).not.toHaveProperty('secret');
    });

    it('should delete only owned subscriptions', async () => {
      mockPrismaService.webhookSubscription.deleteMany.mockResolvedValue({
        count: 1,
      });

      await service.remove('user-123', 'sub-1');

      expect(
        mockPrismaService.webhookSubscription.deleteMany,
      ).toHaveBeenCalledWith({ where: { id: 'sub-1', userId: 'user-123' } });

      mockPrismaService.webhookSubscription.deleteMany.mockResolvedValue({
        count: 0,
      });
      await expect(service.remove('user-123', 'sub-9')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deliveries', () => {
    it('should list deliveries of an owned subscription', async () => {
      mockPrismaService.webhookSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        userId: 'user-123',
      });
      mockPrismaService.webhookDelivery.findMany.mockResolvedValue([
        { id: 'del-1', event: 'task.created', status: 'delivered' },
      ]);

      const result = await service.listDeliveries('user-123', 'sub-1');

      expect(result).toEqual([
        { id: 'del-1', event: 'task.created', status: 'delivered' },
      ]);
    });

    it('should reject deliveries of foreign subscriptions', async () => {
      mockPrismaService.webhookSubscription.findFirst.mockResolvedValue(null);

      await expect(service.listDeliveries('user-123', 'sub-9')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.webhookDelivery.findMany).not.toHaveBeenCalled();
    });
  });
});
