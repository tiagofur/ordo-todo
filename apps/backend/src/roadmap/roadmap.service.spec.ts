import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapService } from './roadmap.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoadmapStatus, SubscriptionPlan } from '@prisma/client';

const mockPrismaService = {
  roadmapItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  roadmapVote: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrismaService)),
};

describe('RoadmapService', () => {
  let service: RoadmapService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('vote', () => {
    it('should allow voting and calculate weight for FREE user', async () => {
      const itemId = 'item1';
      const userId = 'user1';

      prisma.roadmapItem.findUnique.mockResolvedValue({ id: itemId });
      prisma.roadmapVote.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        subscription: { plan: SubscriptionPlan.FREE, status: 'ACTIVE' },
      });
      prisma.roadmapVote.create.mockResolvedValue({ id: 'vote1', weight: 1 });
      prisma.roadmapItem.update.mockResolvedValue({
        id: itemId,
        totalVotes: 1,
      });

      await service.vote(itemId, userId);

      expect(prisma.roadmapVote.create).toHaveBeenCalledWith({
        data: { itemId, userId, weight: 1 },
      });
    });

    it('should calculate weight 3 for PRO user', async () => {
      const itemId = 'item1';
      const userId = 'user2';

      prisma.roadmapItem.findUnique.mockResolvedValue({ id: itemId });
      prisma.roadmapVote.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        subscription: { plan: SubscriptionPlan.PRO, status: 'ACTIVE' },
      });

      await service.vote(itemId, userId);

      expect(prisma.roadmapVote.create).toHaveBeenCalledWith({
        data: { itemId, userId, weight: 3 },
      });
    });

    it('should throw BadRequest if user already voted', async () => {
      prisma.roadmapItem.findUnique.mockResolvedValue({ id: 'item1' });
      prisma.roadmapVote.findUnique.mockResolvedValue({ id: 'vote1' });

      await expect(service.vote('item1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
