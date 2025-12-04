import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../database/prisma.service';

describe('TagsService', () => {
    let service: TagsService;
    let prismaService: PrismaService;

    const mockTagRepository = {
        findByTaskId: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        assignToTask: jest.fn(),
        removeFromTask: jest.fn(),
    };

    const mockPrismaService = {
        tag: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagsService,
                {
                    provide: 'TagRepository',
                    useValue: mockTagRepository,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<TagsService>(TagsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all tags for a workspace with task count', async () => {
            const workspaceId = 'workspace-123';
            const mockTags = [
                {
                    id: 'tag-1',
                    name: 'urgent',
                    color: '#FF0000',
                    workspaceId,
                    createdAt: new Date(),
                    _count: { tasks: 5 },
                },
                {
                    id: 'tag-2',
                    name: 'bug',
                    color: '#00FF00',
                    workspaceId,
                    createdAt: new Date(),
                    _count: { tasks: 3 },
                },
            ];

            mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

            const result = await service.findAll(workspaceId);

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: { workspaceId },
                include: {
                    _count: {
                        select: { tasks: true },
                    },
                },
            });
            expect(result).toHaveLength(2);
            expect(result[0].taskCount).toBe(5);
            expect(result[1].taskCount).toBe(3);
        });

        it('should return empty array when no tags found', async () => {
            const workspaceId = 'workspace-123';

            mockPrismaService.tag.findMany.mockResolvedValue([]);

            const result = await service.findAll(workspaceId);

            expect(result).toEqual([]);
        });
    });

    describe('findByTask', () => {
        it('should return all tags for a task', async () => {
            const taskId = 'task-123';
            const mockTags = [
                {
                    props: {
                        id: 'tag-1',
                        name: 'urgent',
                    },
                },
                {
                    props: {
                        id: 'tag-2',
                        name: 'bug',
                    },
                },
            ];

            mockTagRepository.findByTaskId.mockResolvedValue(mockTags);

            const result = await service.findByTask(taskId);

            expect(mockTagRepository.findByTaskId).toHaveBeenCalledWith(taskId);
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('tag-1');
            expect(result[1].id).toBe('tag-2');
        });
    });

    describe('assignToTask', () => {
        it('should assign a tag to a task', async () => {
            const tagId = 'tag-123';
            const taskId = 'task-123';

            mockTagRepository.findById.mockResolvedValue({ props: { id: tagId } });

            const result = await service.assignToTask(tagId, taskId);

            expect(result).toEqual({ success: true });
        });
    });

    describe('removeFromTask', () => {
        it('should remove a tag from a task', async () => {
            const tagId = 'tag-123';
            const taskId = 'task-123';

            mockTagRepository.findById.mockResolvedValue({ props: { id: tagId } });

            const result = await service.removeFromTask(tagId, taskId);

            expect(result).toEqual({ success: true });
        });
    });

    describe('remove', () => {
        it('should delete a tag', async () => {
            const tagId = 'tag-123';

            mockTagRepository.delete.mockResolvedValue(undefined);

            const result = await service.remove(tagId);

            expect(mockTagRepository.delete).toHaveBeenCalledWith(tagId);
            expect(result).toEqual({ success: true });
        });
    });
});
