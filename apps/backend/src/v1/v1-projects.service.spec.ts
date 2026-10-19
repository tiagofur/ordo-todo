import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { V1ProjectsService } from './v1-projects.service';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../database/prisma.service';

describe('V1ProjectsService', () => {
  let service: V1ProjectsService;

  const mockProjectsService = {
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        V1ProjectsService,
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<V1ProjectsService>(V1ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list via findAllByUser scoped to the token owner', async () => {
    mockProjectsService.findAllByUser.mockResolvedValue([{ id: 'proj-1' }]);

    const result = await service.list('user-123');

    expect(mockProjectsService.findAllByUser).toHaveBeenCalledWith('user-123');
    expect(result).toEqual([{ id: 'proj-1' }]);
  });

  it('should get after verifying access', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue({ id: 'proj-1' });
    mockProjectsService.findOne.mockResolvedValue({ id: 'proj-1' });

    await expect(service.get('user-123', 'proj-1')).resolves.toEqual({
      id: 'proj-1',
    });

    mockPrismaService.project.findUnique.mockResolvedValue(null);
    await expect(service.get('user-123', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should enforce ownership on update and remove', async () => {
    mockPrismaService.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      ownerId: 'other-user',
    });

    await expect(
      service.update('user-123', 'proj-1', { name: 'x' } as never),
    ).rejects.toThrow(ForbiddenException);
    await expect(service.remove('user-123', 'proj-1')).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockProjectsService.update).not.toHaveBeenCalled();
    expect(mockProjectsService.remove).not.toHaveBeenCalled();
  });
});
