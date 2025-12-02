import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
    let service: ProjectsService;

    const mockProjectRepository = {
        findByWorkspaceId: jest.fn(),
        findAllByUserId: jest.fn(),
        findById: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                {
                    provide: 'ProjectRepository',
                    useValue: mockProjectRepository,
                },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all projects for a workspace', async () => {
            const workspaceId = 'workspace-123';
            const mockProjects = [
                {
                    props: {
                        id: 'project-1',
                        name: 'Project 1',
                        workspaceId,
                    },
                },
                {
                    props: {
                        id: 'project-2',
                        name: 'Project 2',
                        workspaceId,
                    },
                },
            ];

            mockProjectRepository.findByWorkspaceId.mockResolvedValue(mockProjects);

            const result = await service.findAll(workspaceId);

            expect(mockProjectRepository.findByWorkspaceId).toHaveBeenCalledWith(
                workspaceId
            );
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('project-1');
            expect(result[1].id).toBe('project-2');
        });

        it('should return empty array when no projects found', async () => {
            const workspaceId = 'workspace-123';

            mockProjectRepository.findByWorkspaceId.mockResolvedValue([]);

            const result = await service.findAll(workspaceId);

            expect(result).toEqual([]);
        });
    });

    describe('findAllByUser', () => {
        it('should return all projects for a user', async () => {
            const userId = 'user-123';
            const mockProjects = [
                {
                    props: {
                        id: 'project-1',
                        name: 'Project 1',
                    },
                },
            ];

            mockProjectRepository.findAllByUserId.mockResolvedValue(mockProjects);

            const result = await service.findAllByUser(userId);

            expect(mockProjectRepository.findAllByUserId).toHaveBeenCalledWith(userId);
            expect(result).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        it('should return a project by id', async () => {
            const projectId = 'project-123';
            const mockProject = {
                props: {
                    id: projectId,
                    name: 'Test Project',
                    description: 'Test description',
                },
            };

            mockProjectRepository.findById.mockResolvedValue(mockProject);

            const result = await service.findOne(projectId);

            expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(mockProject.props);
        });

        it('should return undefined when project not found', async () => {
            const projectId = 'non-existent';

            mockProjectRepository.findById.mockResolvedValue(null);

            const result = await service.findOne(projectId);

            expect(result).toBeUndefined();
        });
    });
});
