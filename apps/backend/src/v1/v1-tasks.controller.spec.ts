import { Test, TestingModule } from '@nestjs/testing';
import { V1TasksController } from './v1-tasks.controller';
import { V1TasksService } from './v1-tasks.service';
import { PublicApiGuard } from './public-api.guard';
import { TokenRateLimitGuard } from './token-rate-limit.guard';

describe('V1TasksController', () => {
  let controller: V1TasksController;
  let service: jest.Mocked<V1TasksService>;

  const mockService = {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user = { id: 'user-123' } as never;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [V1TasksController],
      providers: [{ provide: V1TasksService, useValue: mockService }],
    })
      .overrideGuard(PublicApiGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TokenRateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<V1TasksController>(V1TasksController);
    service = module.get<V1TasksService>(
      V1TasksService,
    ) as jest.Mocked<V1TasksService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass the token owner to every operation', async () => {
    mockService.list.mockResolvedValue([]);
    mockService.get.mockResolvedValue({ id: 'task-1' });
    mockService.create.mockResolvedValue({ id: 'task-9' });
    mockService.update.mockResolvedValue({ id: 'task-1' });
    mockService.remove.mockResolvedValue({ id: 'task-1' });

    await controller.list(user, {});
    await controller.get(user, 'task-1');
    await controller.create(user, { title: 'x' } as never);
    await controller.update(user, 'task-1', { title: 'y' } as never);
    await controller.remove(user, 'task-1');

    expect(service.list).toHaveBeenCalledWith('user-123', {});
    expect(service.get).toHaveBeenCalledWith('user-123', 'task-1');
    expect(service.create).toHaveBeenCalledWith('user-123', { title: 'x' });
    expect(service.update).toHaveBeenCalledWith('user-123', 'task-1', {
      title: 'y',
    });
    expect(service.remove).toHaveBeenCalledWith('user-123', 'task-1');
  });
});
