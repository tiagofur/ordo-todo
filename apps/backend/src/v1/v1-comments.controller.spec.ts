import { Test, TestingModule } from '@nestjs/testing';
import { V1CommentsController } from './v1-comments.controller';
import { V1CommentsService } from './v1-comments.service';
import { PublicApiGuard } from './public-api.guard';

describe('V1CommentsController', () => {
  let controller: V1CommentsController;
  let service: jest.Mocked<V1CommentsService>;

  const mockService = {
    create: jest.fn(),
    listByTask: jest.fn(),
  };

  const user = { id: 'user-123' } as never;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [V1CommentsController],
      providers: [{ provide: V1CommentsService, useValue: mockService }],
    })
      .overrideGuard(PublicApiGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<V1CommentsController>(V1CommentsController);
    service = module.get<V1CommentsService>(
      V1CommentsService,
    ) as jest.Mocked<V1CommentsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create with the token owner as author', async () => {
    mockService.create.mockResolvedValue({ id: 'comment-1' });

    await controller.create(user, {
      taskId: 'task-1',
      content: 'hi',
    } as never);

    expect(service.create).toHaveBeenCalledWith('user-123', {
      taskId: 'task-1',
      content: 'hi',
    });
  });
});
