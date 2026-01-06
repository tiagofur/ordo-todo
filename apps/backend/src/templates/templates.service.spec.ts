import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { NotFoundException } from '@nestjs/common';
import { TaskTemplate } from '@ordo-todo/core';
import type { ITaskTemplateRepository } from '@ordo-todo/core';

describe('TemplatesService', () => {
    let service: TemplatesService;
    let templateRepository: jest.Mocked<ITaskTemplateRepository>;

    const mockWorkspaceId = 'ws-123';
    const mockTemplateId = 'tmpl-456';

    const mockTemplate = new TaskTemplate({
        id: mockTemplateId,
        name: 'Test Template',
        workspaceId: mockWorkspaceId,
        defaultPriority: 'MEDIUM',
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    beforeEach(async () => {
        const mockRepository = {
            findById: jest.fn(),
            findByWorkspaceId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TemplatesService,
                { provide: 'TaskTemplateRepository', useValue: mockRepository },
            ],
        }).compile();

        service = module.get<TemplatesService>(TemplatesService);
        templateRepository = module.get('TaskTemplateRepository');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new template', async () => {
            const dto = {
                name: 'New Template',
                workspaceId: mockWorkspaceId,
                defaultPriority: 'HIGH' as any,
            };
            templateRepository.create.mockResolvedValue({ ...mockTemplate, name: dto.name } as any);

            const result = await service.create(dto as any);

            expect(templateRepository.create).toHaveBeenCalled();
            expect(result.name).toBe(dto.name);
        });
    });

    describe('findAll', () => {
        it('should return all templates for a workspace', async () => {
            templateRepository.findByWorkspaceId.mockResolvedValue([mockTemplate]);

            const result = await service.findAll(mockWorkspaceId);

            expect(templateRepository.findByWorkspaceId).toHaveBeenCalledWith(mockWorkspaceId);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(mockTemplateId);
        });
    });

    describe('findOne', () => {
        it('should return template by id', async () => {
            templateRepository.findById.mockResolvedValue(mockTemplate);

            const result = await service.findOne(mockTemplateId);

            expect(templateRepository.findById).toHaveBeenCalledWith(mockTemplateId);
            expect(result.id).toBe(mockTemplateId);
        });

        it('should throw NotFoundException when template not found', async () => {
            templateRepository.findById.mockResolvedValue(null);

            await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update an existing template', async () => {
            templateRepository.findById.mockResolvedValue(mockTemplate);
            templateRepository.update.mockResolvedValue({ ...mockTemplate, name: 'Updated' } as any);

            const result = await service.update(mockTemplateId, { name: 'Updated' } as any);

            expect(templateRepository.update).toHaveBeenCalled();
            expect(result.name).toBe('Updated');
        });
    });

    describe('remove', () => {
        it('should delete a template', async () => {
            templateRepository.findById.mockResolvedValue(mockTemplate);
            templateRepository.delete.mockResolvedValue(undefined);

            await service.remove(mockTemplateId);

            expect(templateRepository.delete).toHaveBeenCalledWith(mockTemplateId);
        });
    });
});
