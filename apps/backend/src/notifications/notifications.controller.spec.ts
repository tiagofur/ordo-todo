import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(
      NotificationsService,
    ) as jest.Mocked<NotificationsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('passes pagination through to the service', async () => {
      service.findAll.mockResolvedValue([]);
      const pagination = Object.assign(new PaginationDto(), {
        limit: 10,
        page: 2,
      });
      const req = { user: { id: 'user-1' } };

      await controller.findAll(req as any, pagination);

      expect(service.findAll).toHaveBeenCalledWith('user-1', {
        take: 10,
        skip: 20,
      });
    });
  });
});
