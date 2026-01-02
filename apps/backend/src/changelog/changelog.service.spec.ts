import { Test, TestingModule } from '@nestjs/testing';
import { ChangelogService } from './changelog.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ChangelogType } from '@prisma/client';

const mockPrismaService = {
  changelogEntry: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('ChangelogService', () => {
  let service: ChangelogService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangelogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChangelogService>(ChangelogService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a changelog entry', async () => {
      const dto = {
        title: 'New Feature',
        content: 'Desc',
        type: ChangelogType.NEW,
      };

      const expectedResult = { id: '1', ...dto, publishedAt: expect.any(Date) };
      prisma.changelogEntry.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return an entry if found', async () => {
      const entry = { id: '1', title: 'Test' };
      prisma.changelogEntry.findUnique.mockResolvedValue(entry);

      const result = await service.findOne('1');
      expect(result).toEqual(entry);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.changelogEntry.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
