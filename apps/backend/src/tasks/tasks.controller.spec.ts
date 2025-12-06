import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TagsService } from '../tags/tags.service';
import { CommentsService } from '../comments/comments.service';
import { AttachmentsService } from '../attachments/attachments.service';

describe('TasksController', () => {
    let controller: TasksController;
    let tasksService: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                        complete: jest.fn(),
                    },
                },
                {
                    provide: TagsService,
                    useValue: {},
                },
                {
                    provide: CommentsService,
                    useValue: {},
                },
                {
                    provide: AttachmentsService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
        tasksService = module.get<TasksService>(TasksService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a task', async () => {
            const dto = { title: 'Test Task', projectId: 'p1' };
            const user = { id: 'u1', email: 'test@example.com' };
            const expectedResult = { id: 't1', ...dto };

            jest.spyOn(tasksService, 'create').mockResolvedValue(expectedResult as any);

            const result = await controller.create(dto as any, user as any);

            expect(result).toEqual(expectedResult);
            expect(tasksService.create).toHaveBeenCalledWith(dto, user.id);
        });
    });
});
