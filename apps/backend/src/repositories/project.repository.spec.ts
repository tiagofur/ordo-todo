import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProjectRepository } from './project.repository';
import { PrismaService } from '../database/prisma.service';

describe('PrismaProjectRepository pagination order', () => {
  let repository: PrismaProjectRepository;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
    },
  };

  // Deterministic order: pagination over an unordered query returns
  // unstable pages (rows overlap or go missing between requests).
  const expectedOrderBy = [
    { position: 'asc' },
    { createdAt: 'asc' },
    { id: 'asc' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProjectRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaProjectRepository>(PrismaProjectRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findByWorkspaceId orders deterministically with take/skip', async () => {
    mockPrismaService.project.findMany.mockResolvedValue([]);

    await repository.findByWorkspaceId('ws-1', { take: 2, skip: 2 });

    expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 2,
        orderBy: expectedOrderBy,
      }),
    );
  });

  it('findAllByUserId orders deterministically with take/skip', async () => {
    mockPrismaService.project.findMany.mockResolvedValue([]);

    await repository.findAllByUserId('user-1', { take: 2, skip: 0 });

    expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 0,
        orderBy: expectedOrderBy,
      }),
    );
  });
});
