import { Test, TestingModule } from '@nestjs/testing';
import { ObjectivesService } from './objectives.service';
import { NotFoundException } from '@nestjs/common';
import { Objective, KeyResult } from '@ordo-todo/core';
import type { IObjectiveRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

describe('ObjectivesService', () => {
  let service: ObjectivesService;
  let objectiveRepository: jest.Mocked<IObjectiveRepository>;
  let prismaService: jest.Mocked<PrismaService>;

  const userId = 'user-123';
  const objectiveId = 'obj-123';

  const mockObjective = new Objective({
    id: objectiveId,
    title: 'Test Objective',
    userId,
    startDate: new Date(),
    endDate: new Date(),
    period: 'QUARTERLY',
    status: 'ACTIVE',
    progress: 0,
    color: '#3B82F6',
    keyResults: [],
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByWorkspaceId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findKeyResultById: jest.fn(),
      createKeyResult: jest.fn(),
      updateKeyResult: jest.fn(),
      deleteKeyResult: jest.fn(),
      linkTask: jest.fn(),
      unlinkTask: jest.fn(),
    };

    const mockPrisma = {
      client: {
        task: {
          findFirst: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectivesService,
        { provide: 'ObjectiveRepository', useValue: mockRepository },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ObjectivesService>(ObjectivesService);
    objectiveRepository = module.get('ObjectiveRepository');
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an objective', async () => {
      const createDto = {
        title: 'New Objective',
        endDate: new Date().toISOString(),
      };
      objectiveRepository.create.mockResolvedValue(mockObjective);

      const result = await service.create(createDto as any, userId);

      expect(objectiveRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all objectives for a user', async () => {
      objectiveRepository.findByUserId.mockResolvedValue([mockObjective]);

      const result = await service.findAll(userId);

      expect(objectiveRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an objective by ID', async () => {
      objectiveRepository.findById.mockResolvedValue(mockObjective);

      const result = await service.findOne(objectiveId, userId);

      expect(objectiveRepository.findById).toHaveBeenCalledWith(objectiveId);
      expect(result.id).toBe(objectiveId);
    });

    it('should throw NotFoundException when objective not found', async () => {
      objectiveRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an objective', async () => {
      objectiveRepository.findById.mockResolvedValue(mockObjective);
      objectiveRepository.update.mockResolvedValue(mockObjective);

      const result = await service.update(
        objectiveId,
        { title: 'Updated' },
        userId,
      );

      expect(objectiveRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete an objective', async () => {
      objectiveRepository.findById.mockResolvedValue(mockObjective);
      objectiveRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(objectiveId, userId);

      expect(objectiveRepository.delete).toHaveBeenCalledWith(objectiveId);
      expect(result.success).toBe(true);
    });
  });

  describe('Key Results', () => {
    it('should add a key result', async () => {
      objectiveRepository.findById.mockResolvedValue(mockObjective);
      const kr = new KeyResult({
        id: 'kr-1',
        objectiveId: objectiveId,
        title: 'Test KR',
        metricType: 'PERCENTAGE',
        startValue: 0,
        targetValue: 100,
        currentValue: 0,
        progress: 0,
      });
      objectiveRepository.createKeyResult.mockResolvedValue(kr);
      objectiveRepository.update.mockResolvedValue(mockObjective);

      const result = await service.addKeyResult(
        objectiveId,
        { title: 'Test KR', targetValue: 100 } as any,
        userId,
      );

      expect(objectiveRepository.createKeyResult).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
