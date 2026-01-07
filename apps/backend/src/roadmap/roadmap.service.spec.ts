import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapService } from './roadmap.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoadmapItem, RoadmapVote } from '@ordo-todo/core';
import type { IRoadmapRepository } from '@ordo-todo/core';
import { SubscriptionPlan } from '@prisma/client';

describe('RoadmapService', () => {
  let service: RoadmapService;
  let roadmapRepository: jest.Mocked<IRoadmapRepository>;
  let prisma: any;

  const mockItem = new RoadmapItem({
    id: 'item-1',
    title: 'New Feature',
    description: 'Description',
    status: 'CONSIDERING',
    totalVotes: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPrisma = {
    client: {
      user: {
        findUnique: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    roadmapRepository = {
      findItemById: jest.fn(),
      findAllItems: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      findVote: jest.fn(),
      createVote: jest.fn(),
      deleteVote: jest.fn(),
      hasUserVoted: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapService,
        { provide: 'RoadmapRepository', useValue: roadmapRepository },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RoadmapService>(RoadmapService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('vote', () => {
    it('should allow voting and calculate weight for FREE user', async () => {
      const itemId = 'item-1';
      const userId = 'user-1';

      roadmapRepository.findItemById.mockResolvedValue(mockItem);
      roadmapRepository.hasUserVoted.mockResolvedValue(false);

      prisma.client.user.findUnique.mockResolvedValue({
        id: userId,
        subscription: { plan: SubscriptionPlan.FREE, status: 'ACTIVE' },
      });

      const mockVote = new RoadmapVote({
        id: 'vote-1',
        itemId,
        userId,
        weight: 1,
        createdAt: new Date(),
      });

      roadmapRepository.createVote.mockResolvedValue({
        vote: mockVote,
        item: mockItem.incrementVotes(1),
      });

      await service.vote(itemId, userId);

      expect(roadmapRepository.createVote).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            itemId,
            userId,
            weight: 1,
          }),
        }),
      );
    });

    it('should calculate weight 3 for PRO user', async () => {
      const itemId = 'item-1';
      const userId = 'user-2';

      roadmapRepository.findItemById.mockResolvedValue(mockItem);
      roadmapRepository.hasUserVoted.mockResolvedValue(false);

      prisma.client.user.findUnique.mockResolvedValue({
        id: userId,
        subscription: { plan: SubscriptionPlan.PRO, status: 'ACTIVE' },
      });

      await service.vote(itemId, userId);

      expect(roadmapRepository.createVote).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({
            weight: 3,
          }),
        }),
      );
    });

    it('should throw BadRequest if user already voted', async () => {
      roadmapRepository.findItemById.mockResolvedValue(mockItem);
      roadmapRepository.hasUserVoted.mockResolvedValue(true);

      await expect(service.vote('item-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      roadmapRepository.findAllItems.mockResolvedValue([mockItem]);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(roadmapRepository.findAllItems).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update item status', async () => {
      roadmapRepository.findItemById.mockResolvedValue(mockItem);
      roadmapRepository.updateItem.mockResolvedValue(
        mockItem.updateStatus('PLANNED'),
      );

      await service.updateStatus('item-1', { status: 'PLANNED' as any });

      expect(roadmapRepository.updateItem).toHaveBeenCalledWith('item-1', {
        status: 'PLANNED',
      });
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      roadmapRepository.findItemById.mockResolvedValue(mockItem);
      roadmapRepository.deleteItem.mockResolvedValue();

      const result = await service.delete('item-1');

      expect(roadmapRepository.deleteItem).toHaveBeenCalledWith('item-1');
      expect(result).toEqual({ success: true });
    });
  });
});
