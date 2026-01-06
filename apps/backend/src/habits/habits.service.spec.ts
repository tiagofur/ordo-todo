import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { Habit } from '@ordo-todo/core';
import type { IHabitRepository } from '@ordo-todo/core';

describe('HabitsService', () => {
  let service: HabitsService;
  let habitRepository: jest.Mocked<IHabitRepository>;
  let prismaService: jest.Mocked<PrismaService>;
  let gamificationService: jest.Mocked<GamificationService>;

  const mockHabit = new Habit({
    id: 'habit-123',
    name: 'Morning Exercise',
    description: 'Exercise for 30 minutes',
    color: '#10B981',
    userId: 'user-123',
    frequency: 'DAILY',
    targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    targetCount: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    isActive: true,
    isPaused: false,
  });

  beforeEach(async () => {
    habitRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      findTodayHabits: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createCompletion: jest.fn(),
      deleteCompletion: jest.fn(),
      getCompletions: jest.fn(),
      getCompletionForDate: jest.fn(),
      getStats: jest.fn(),
    };

    prismaService = {
      client: {
        habit: {
          count: jest.fn(),
          findMany: jest.fn(),
          findFirst: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        habitCompletion: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
        },
        $transaction: jest.fn((arr) => Promise.all(arr)),
      },
    } as unknown as jest.Mocked<PrismaService>;

    gamificationService = {
      addXp: jest.fn(),
    } as unknown as jest.Mocked<GamificationService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: 'HabitRepository', useValue: habitRepository },
        { provide: PrismaService, useValue: prismaService },
        { provide: GamificationService, useValue: gamificationService },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a habit', async () => {
      const createDto = {
        name: 'Morning Exercise',
        description: 'Exercise for 30 minutes',
        frequency: 'DAILY' as const,
        workspaceId: 'ws-123',
      };

      prismaService.client.habit.create.mockResolvedValue({
        id: 'habit-123',
        name: createDto.name,
        description: createDto.description,
        frequency: createDto.frequency,
        color: '#10B981',
        userId: 'user-123',
        icon: null,
        workspaceId: createDto.workspaceId,
        targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 1,
        preferredTime: null,
        timeOfDay: null,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        isActive: true,
        isPaused: false,
        pausedAt: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completions: [],
      });

      prismaService.client.habit.count.mockResolvedValue(1);

      const result = await service.create(createDto, 'user-123');

      expect(prismaService.client.habit.create).toHaveBeenCalled();
      expect(result.name).toBe(createDto.name);
    });
  });

  describe('findAll', () => {
    it('should return all habits for a user', async () => {
      const userId = 'user-123';
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Habit 1',
          frequency: 'DAILY',
          color: '#10B981',
          userId,
          description: null,
          icon: null,
          workspaceId: null,
          targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          targetCount: 1,
          preferredTime: null,
          timeOfDay: null,
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          isActive: true,
          isPaused: false,
          pausedAt: null,
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          completions: [],
        },
      ];

      prismaService.client.habit.findMany.mockResolvedValue(mockHabits);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockHabits);
    });
  });

  describe('findOne', () => {
    it('should return a habit by ID', async () => {
      const habitId = 'habit-123';
      const mockHabitData = {
        id: habitId,
        name: 'Test Habit',
        frequency: 'DAILY',
        color: '#10B981',
        userId: 'user-123',
        description: null,
        icon: null,
        workspaceId: null,
        targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 1,
        preferredTime: null,
        timeOfDay: null,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        isActive: true,
        isPaused: false,
        pausedAt: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completions: [],
      };

      prismaService.client.habit.findFirst.mockResolvedValue(mockHabitData);

      const result = await service.findOne(habitId, 'user-123');

      expect(result.id).toBe(habitId);
    });

    it('should throw NotFoundException when habit not found', async () => {
      prismaService.client.habit.findFirst.mockResolvedValue(null);

      await expect(service.findOne('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a habit', async () => {
      const habitId = 'habit-123';

      prismaService.client.habit.findFirst.mockResolvedValue({
        id: habitId,
        name: 'Test Habit',
        frequency: 'DAILY',
        color: '#10B981',
        userId: 'user-123',
        description: null,
        icon: null,
        workspaceId: null,
        targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        targetCount: 1,
        preferredTime: null,
        timeOfDay: null,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        isActive: true,
        isPaused: false,
        pausedAt: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completions: [],
      });

      prismaService.client.habit.delete.mockResolvedValue(undefined as never);

      const result = await service.remove(habitId, 'user-123');

      expect(prismaService.client.habit.delete).toHaveBeenCalledWith({
        where: { id: habitId },
      });

      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException when habit not found', async () => {
      prismaService.client.habit.findFirst.mockResolvedValue(null);

      await expect(service.remove('not-found', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
