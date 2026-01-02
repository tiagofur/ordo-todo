import { Test, TestingModule } from '@nestjs/testing';
import { ObjectivesService } from './objectives.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ObjectivesService', () => {
  let service: ObjectivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectivesService],
    }).compile();

    service = module.get<ObjectivesService>(ObjectivesService);
  });

  describe('create', () => {
    it('should create an objective', async () => {
      const createDto = {
        title: 'Test Objective',
        description: 'Test Description',
        startDate: new Date(),
        period: 'QUARTERLY',
        workspaceId: 'workspace-123',
        userId: 'user-123',
      };

      const mockObjective = {
        id: 'objective-123',
        title: createDto.title,
        description: createDto.description,
      };

      jest
        .spyOn(service.prisma.client.objective, 'create')
        .mockResolvedValue(mockObjective as any);

      const result = await service.create(createDto, 'user-123');

      expect(service.prisma.client.objective.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: createDto.description,
          startDate: new Date(createDto.startDate),
          period: createDto.period,
          color: createDto.color,
          icon: createDto.icon,
          workspaceId: createDto.workspaceId,
          userId: 'user-123',
        },
        include: {
          keyResults: true,
        },
      });

      expect(result).toEqual(mockObjective);
    });

    it('should throw BadRequestException when user is not provided', async () => {
      const createDto = {
        title: 'Test Objective',
        description: 'Test Description',
        startDate: new Date(),
        period: 'QUARTERLY',
        workspaceId: 'workspace-123',
      } as any;

      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all objectives for a user', async () => {
      const userId = 'user-123';
      const mockObjectives = [
        { id: 'obj-1', title: 'Objective 1', status: 'ACTIVE' },
        { id: 'obj-2', title: 'Objective 2', status: 'COMPLETED' },
      ];

      jest
        .spyOn(service.prisma.client.objective, 'findMany')
        .mockResolvedValue(mockObjectives as any);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockObjectives);
    });
  });

  describe('findOne', () => {
    it('should return an objective by ID', async () => {
      const objectiveId = 'obj-123';
      const mockObjective = {
        id: objectiveId,
        title: 'Test Objective',
        status: 'ACTIVE',
      };

      jest
        .spyOn(service.prisma.client.objective, 'findUnique')
        .mockResolvedValue(mockObjective as any);

      const result = await service.findOne(objectiveId, 'user-123');

      expect(service.prisma.client.objective.findUnique).toHaveBeenCalledWith({
        where: { id: objectiveId, userId: 'user-123' },
      });

      expect(result).toEqual(mockObjective);
    });

    it('should throw NotFoundException when objective not found', async () => {
      jest
        .spyOn(service.prisma.client.objective, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an objective', async () => {
      const objectiveId = 'obj-123';
      const updateDto = {
        title: 'Updated Objective',
        status: 'ACTIVE',
      };

      const mockUpdated = {
        id: objectiveId,
        title: updateDto.title,
        status: updateDto.status,
      };

      jest
        .spyOn(service.prisma.client.objective, 'update')
        .mockResolvedValue(mockUpdated as any);

      const result = await service.update(objectiveId, updateDto, 'user-123');

      expect(service.prisma.client.objective.update).toHaveBeenCalledWith(
        { where: { id: objectiveId } },
        { data: updateDto },
      );

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('should delete an objective', async () => {
      const objectiveId = 'obj-123';

      const mockDeleted = { success: true };

      jest
        .spyOn(service.prisma.client.objective, 'delete')
        .mockResolvedValue(undefined);

      const result = await service.remove(objectiveId, 'user-123');

      expect(service.prisma.client.objective.delete).toHaveBeenCalledWith({
        where: { id: objectiveId },
      });

      expect(result).toEqual(mockDeleted);
    });

    it('should throw NotFoundException when objective not found', async () => {
      jest
        .spyOn(service.prisma.client.objective, 'delete')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service.prisma.client.objective, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.remove('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
