import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProjectGuard } from '../common/guards/project.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CacheInterceptor,
  CacheInvalidateInterceptor,
} from '../common/decorators/cache';

import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../database/prisma.service';
import { PlanLimitsService } from '../billing/plan-limits.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        { provide: 'ProjectRepository', useValue: {} },
        { provide: 'RedisService', useValue: {} },
        { provide: WorkspacesService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: PlanLimitsService,
          useValue: {
            assertWithinWorkspaceLimit: jest.fn(),
            assertWithinProjectLimit: jest.fn(),
            assertWithinTaskStorageLimit: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ProjectGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(CacheInvalidateInterceptor)
      .useValue({ intercept: (_ctx: any, next: any) => next.handle() })
      .overrideInterceptor(CacheInterceptor)
      .useValue({ intercept: (_ctx: any, next: any) => next.handle() })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('GET /projects', () => {
    it('should return all projects for a workspace', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'Project 1', status: 'ACTIVE' },
        { id: 'proj-2', name: 'Project 2', status: 'ACTIVE' },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockProjects as any);

      const result = await controller.findAll('ws-123');

      expect(service.findAll).toHaveBeenCalledWith('ws-123');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a project by ID', async () => {
      const mockProject = {
        id: 'proj-123',
        name: 'Test Project',
        status: 'ACTIVE',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProject as any);

      const result = await controller.findOne('proj-123');

      expect(service.findOne).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when project not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      await expect(controller.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('POST /projects', () => {
    it('should create a new project', async () => {
      const createDto = {
        name: 'New Project',
        description: 'Test Description',
        workspaceId: 'ws-123',
        workflowId: 'wf-123',
      };

      const mockProject = {
        id: 'proj-123',
        name: createDto.name,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProject as any);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProject);
    });

    it('should throw BadRequestException when project name is empty', async () => {
      const createDto = {
        name: '',
        description: 'Test',
        workspaceId: 'ws-123',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException('Project name is required'));

      await expect(controller.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update a project', async () => {
      const updateDto = {
        name: 'Updated Project',
        status: 'ON_HOLD',
      };

      const mockProject = {
        id: 'proj-123',
        name: updateDto.name,
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockProject as any);

      const result = await controller.update('proj-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('proj-123', updateDto);
      expect(result).toEqual(mockProject);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete a project', async () => {
      const mockDeleted = { success: true };

      jest.spyOn(service, 'remove').mockResolvedValue(mockDeleted as any);

      const result = await controller.remove('proj-123');

      expect(service.remove).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockDeleted);
    });

    it('should throw NotFoundException when project not found', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new NotFoundException('Project not found'));

      await expect(controller.remove('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
