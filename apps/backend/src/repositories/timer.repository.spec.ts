import { Test, TestingModule } from '@nestjs/testing';
import { PrismaTimerRepository } from './timer.repository';
import { PrismaService } from '../database/prisma.service';
import { TimeSession } from '@ordo-todo/core';

describe('PrismaTimerRepository', () => {
  let repository: PrismaTimerRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTimerRepository,
        {
          provide: PrismaService,
          useValue: {
            timeSession: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaTimerRepository>(PrismaTimerRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should handle CONTINUOUS session type', async () => {
    const session = TimeSession.create({
      taskId: 'task-1',
      userId: 'user-1',
      startedAt: new Date(),
      type: 'CONTINUOUS',
    });

    // Mock the return value from Prisma
    const prismaSession = {
      id: 'session-1',
      taskId: 'task-1',
      userId: 'user-1',
      startedAt: new Date(),
      type: 'CONTINUOUS', // This is the key part we are testing
      wasCompleted: false,
      wasInterrupted: false,
      pauseCount: 0,
      totalPauseTime: 0,
      pauseData: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      endedAt: null,
      duration: null,
      parentSessionId: null,
      splitReason: null,
    };

    (prismaService.timeSession.create as jest.Mock).mockResolvedValue(
      prismaSession,
    );

    const result = await repository.create(session);

    expect(result.props.type).toBe('CONTINUOUS');
    expect(prismaService.timeSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'CONTINUOUS',
        }),
      }),
    );
  });
});
