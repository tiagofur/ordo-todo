import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  newsletterSubscriber: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('NewsletterService', () => {
  let service: NewsletterService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should create new subscription if not exists', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      prisma.newsletterSubscriber.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        active: true,
      });

      await service.subscribe({ email: 'test@test.com' });
      expect(prisma.newsletterSubscriber.create).toHaveBeenCalledWith({
        data: { email: 'test@test.com', userId: null, active: true },
      });
    });

    it('should throw BadRequest if already subscribed', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        active: true,
      });

      await expect(
        service.subscribe({ email: 'test@test.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reactivate if inactive', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        active: false,
      });
      prisma.newsletterSubscriber.update.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        active: true,
      });

      await service.subscribe({ email: 'test@test.com' });
      expect(prisma.newsletterSubscriber.update).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe existing user', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        active: true,
      });

      await service.unsubscribe({ email: 'test@test.com' });
      expect(prisma.newsletterSubscriber.update).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        data: { active: false },
      });
    });

    it('should throw NotFound if email not found', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue(null);
      await expect(
        service.unsubscribe({ email: 'nope@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
