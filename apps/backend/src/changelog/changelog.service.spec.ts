import { Test, TestingModule } from '@nestjs/testing';
import { ChangelogService } from './changelog.service';
import { NotFoundException } from '@nestjs/common';
import { ChangelogEntry } from '@ordo-todo/core';
import type { IChangelogRepository } from '@ordo-todo/core';

describe('ChangelogService', () => {
  let service: ChangelogService;
  let changelogRepository: jest.Mocked<IChangelogRepository>;

  const mockChangelogEntry = new ChangelogEntry({
    id: 'changelog-1',
    title: 'New Feature',
    content: 'Description of the feature',
    type: 'NEW',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    changelogRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findLatest: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangelogService,
        { provide: 'ChangelogRepository', useValue: changelogRepository },
      ],
    }).compile();

    service = module.get<ChangelogService>(ChangelogService);
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
        content: 'Description',
        type: 'NEW' as const,
      };

      changelogRepository.create.mockResolvedValue(mockChangelogEntry);

      const result = await service.create(dto);

      expect(changelogRepository.create).toHaveBeenCalled();
      expect(result.title).toBe(mockChangelogEntry.title);
    });
  });

  describe('findAll', () => {
    it('should return all entries', async () => {
      changelogRepository.findAll.mockResolvedValue([mockChangelogEntry]);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(changelogRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an entry if found', async () => {
      changelogRepository.findById.mockResolvedValue(mockChangelogEntry);

      const result = await service.findOne('changelog-1');

      expect(result.id).toBe('changelog-1');
    });

    it('should throw NotFoundException if not found', async () => {
      changelogRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an entry', async () => {
      changelogRepository.findById.mockResolvedValue(mockChangelogEntry);
      changelogRepository.delete.mockResolvedValue();

      const result = await service.delete('changelog-1');

      expect(changelogRepository.delete).toHaveBeenCalledWith('changelog-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getLatestRelease', () => {
    it('should return the latest entry', async () => {
      changelogRepository.findLatest.mockResolvedValue(mockChangelogEntry);

      const result = await service.getLatestRelease();

      expect(changelogRepository.findLatest).toHaveBeenCalled();
      expect(result?.title).toBe(mockChangelogEntry.title);
    });
  });
});
