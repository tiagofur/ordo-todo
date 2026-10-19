import { Test, TestingModule } from '@nestjs/testing';
import { V1ProjectsController } from './v1-projects.controller';
import { V1ProjectsService } from './v1-projects.service';
import { PublicApiGuard } from './public-api.guard';
import { TokenRateLimitGuard } from './token-rate-limit.guard';

describe('V1ProjectsController', () => {
  let controller: V1ProjectsController;
  let service: jest.Mocked<V1ProjectsService>;

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
      controllers: [V1ProjectsController],
      providers: [{ provide: V1ProjectsService, useValue: mockService }],
    })
      .overrideGuard(PublicApiGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TokenRateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<V1ProjectsController>(V1ProjectsController);
    service = module.get<V1ProjectsService>(
      V1ProjectsService,
    ) as jest.Mocked<V1ProjectsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass the token owner to every operation', async () => {
    mockService.list.mockResolvedValue([]);
    mockService.get.mockResolvedValue({ id: 'proj-1' });
    mockService.create.mockResolvedValue({ id: 'proj-9' });
    mockService.update.mockResolvedValue({ id: 'proj-1' });
    mockService.remove.mockResolvedValue({ id: 'proj-1' });

    await controller.list(user);
    await controller.get(user, 'proj-1');
    await controller.create(user, { name: 'x' } as never);
    await controller.update(user, 'proj-1', { name: 'y' } as never);
    await controller.remove(user, 'proj-1');

    expect(service.list).toHaveBeenCalledWith('user-123');
    expect(service.get).toHaveBeenCalledWith('user-123', 'proj-1');
    expect(service.create).toHaveBeenCalledWith('user-123', { name: 'x' });
    expect(service.update).toHaveBeenCalledWith('user-123', 'proj-1', {
      name: 'y',
    });
    expect(service.remove).toHaveBeenCalledWith('user-123', 'proj-1');
  });
});
