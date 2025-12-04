import { CreateTaskUseCase } from './create-task.usecase';
import { TaskRepository } from '../provider/task.repository';
import { Task } from '../model/task.entity';

describe('CreateTaskUseCase', () => {
    let useCase: CreateTaskUseCase;
    let repository: jest.Mocked<TaskRepository>;

    beforeEach(() => {
        repository = {
            save: jest.fn(),
            findById: jest.fn(),
            findByCreatorId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        useCase = new CreateTaskUseCase(repository);
    });

    it('should create a task successfully', async () => {
        const input = {
            title: 'Test Task',
            projectId: 'project-1',
            creatorId: 'user-1',
        };

        const task = await useCase.execute(input);

        expect(task).toBeInstanceOf(Task);
        expect(task.props.title).toBe(input.title);
        expect(repository.save).toHaveBeenCalledWith(task);
    });

    it('should throw error if title is missing', async () => {
        const input = {
            title: '',
            projectId: 'project-1',
            creatorId: 'user-1',
        };

        await expect(useCase.execute(input)).rejects.toThrow('Title is required');
    });
});
