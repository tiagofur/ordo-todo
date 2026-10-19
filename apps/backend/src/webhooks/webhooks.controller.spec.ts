import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { PublicApiGuard } from '../v1/public-api.guard';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: jest.Mocked<WebhooksService>;
  let dispatcher: jest.Mocked<WebhookDispatcherService>;

  const mockService = {
    create: jest.fn(),
    list: jest.fn(),
    remove: jest.fn(),
    listDeliveries: jest.fn(),
  };
  const mockDispatcher = {
    redeliver: jest.fn(),
  };

  const user = { id: 'user-123' } as never;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: WebhooksService, useValue: mockService },
        { provide: WebhookDispatcherService, useValue: mockDispatcher },
      ],
    })
      .overrideGuard(PublicApiGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WebhooksController>(WebhooksController);
    service = module.get<WebhooksService>(
      WebhooksService,
    ) as jest.Mocked<WebhooksService>;
    dispatcher = module.get<WebhookDispatcherService>(
      WebhookDispatcherService,
    ) as jest.Mocked<WebhookDispatcherService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should scope every operation to the token owner', async () => {
    mockService.create.mockResolvedValue({ id: 'sub-1' });
    mockService.list.mockResolvedValue([]);
    mockService.remove.mockResolvedValue(undefined);
    mockService.listDeliveries.mockResolvedValue([]);
    mockDispatcher.redeliver.mockResolvedValue({ id: 'del-1' });

    await controller.create(user, {
      url: 'https://x.test/h',
      events: [],
    } as never);
    await controller.list(user);
    await controller.remove(user, 'sub-1');
    await controller.listDeliveries(user, 'sub-1');
    await controller.redeliver(user, 'del-1');

    expect(service.create).toHaveBeenCalledWith('user-123', {
      url: 'https://x.test/h',
      events: [],
    });
    expect(service.list).toHaveBeenCalledWith('user-123');
    expect(service.remove).toHaveBeenCalledWith('user-123', 'sub-1');
    expect(service.listDeliveries).toHaveBeenCalledWith('user-123', 'sub-1');
    expect(dispatcher.redeliver).toHaveBeenCalledWith('user-123', 'del-1');
  });
});
