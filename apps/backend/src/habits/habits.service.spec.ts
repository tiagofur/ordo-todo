import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('HabitsService', () => {
  let service: HabitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitsService],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
  });

  describe('create', () => {
    it('should create a habit', async () => {
      const createDto = {
        title: 'Morning Exercise',
        description: 'Exercise for 30 minutes',
        frequency: 'DAILY',
        workspaceId: 'ws-123',
      };

      const mockHabit = {
        id: 'habit-123',
        title: createDto.title,
        frequency: createDto.frequency,
      };

      jest
        .spyOn(service.prisma.client.habit, 'create')
        .mockResolvedValue(mockHabit as any);

      const result = await service.create(createDto, 'user-123');

      expect(service.prisma.client.habit.create).toHaveBeenCalled();
      expect(result).toEqual(mockHabit);
    });

    it('should throw BadRequestException when title is missing', async () => {
      const createDto = {
        description: 'Test',
        frequency: 'DAILY',
        workspaceId: 'ws-123',
      } as any;

      jest
        .spyOn(service.prisma.client.habit, 'create')
        .mockRejectedValue(new BadRequestException('Habit title is required'));

      await expect(
        service.create(createDto as any, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all habits for a user', async () => {
      const userId = 'user-123';
      const mockHabits = [
        { id: 'habit-1', title: 'Habit 1', frequency: 'DAILY' },
        { id: 'habit-2', title: 'Habit 2', frequency: 'WEEKLY' },
      ];

      jest
        .spyOn(service.prisma.client.habit, 'findMany')
        .mockResolvedValue(mockHabits as any);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockHabits);
    });
  });

  describe('findOne', () => {
    it('should return a habit by ID', async () => {
      const habitId = 'habit-123';
      const mockHabit = {
        id: habitId,
        title: 'Test Habit',
        frequency: 'DAILY',
      };

      jest
        .spyOn(service.prisma.client.habit, 'findUnique')
        .mockResolvedValue(mockHabit as any);

      const result = await service.findOne(habitId, 'user-123');

      expect(service.prisma.client.habit.findUnique).toHaveBeenCalledWith({
        where: { id: habitId, userId: 'user-123' },
      });

      expect(result).toEqual(mockHabit);
    });

    it('should throw NotFoundException when habit not found', async () => {
      jest
        .spyOn(service.prisma.client.habit, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a habit', async () => {
      const habitId = 'habit-123';
      const updateDto = {
        title: 'Updated Habit',
        frequency: 'WEEKLY',
      };

      const mockUpdated = {
        id: habitId,
        title: updateDto.title,
        frequency: updateDto.frequency,
      };

      jest
        .spyOn(service.prisma.client.habit, 'update')
        .mockResolvedValue(mockUpdated as any);

      const result = await service.update(habitId, updateDto, 'user-123');

      expect(service.prisma.client.habit.update).toHaveBeenCalledWith(
        { where: { id: habitId } },
        { data: updateDto },
      );

      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('should delete a habit', async () => {
      const habitId = 'habit-123';

      const mockDeleted = { success: true };

      jest
        .spyOn(service.prisma.client.habit, 'delete')
        .mockResolvedValue(undefined);

      const result = await service.remove(habitId, 'user-123');

      expect(service.prisma.client.habit.delete).toHaveBeenCalledWith({
        where: { id: habitId },
      });

      expect(result).toEqual(mockDeleted);
    });

    it('should throw NotFoundException when habit not found', async () => {
      jest
        .spyOn(service.prisma.client.habit, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.remove('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
