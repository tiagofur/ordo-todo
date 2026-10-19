import { Test, TestingModule } from '@nestjs/testing';
import { V1CommentsService } from './v1-comments.service';
import { CommentsService } from '../comments/comments.service';

describe('V1CommentsService', () => {
  let service: V1CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
    findByTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        V1CommentsService,
        { provide: CommentsService, useValue: mockCommentsService },
      ],
    }).compile();

    service = module.get<V1CommentsService>(V1CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create with the token owner as author', async () => {
    mockCommentsService.create.mockResolvedValue({ id: 'comment-1' });

    const result = await service.create('user-123', {
      taskId: 'task-1',
      content: 'API comment',
    } as never);

    expect(mockCommentsService.create).toHaveBeenCalledWith(
      { taskId: 'task-1', content: 'API comment' },
      'user-123',
    );
    expect(result).toEqual({ id: 'comment-1' });
  });

  it('should list comments of a task', async () => {
    mockCommentsService.findByTask.mockResolvedValue([{ id: 'comment-1' }]);

    const result = await service.listByTask('task-1');

    expect(mockCommentsService.findByTask).toHaveBeenCalledWith('task-1');
    expect(result).toEqual([{ id: 'comment-1' }]);
  });
});
