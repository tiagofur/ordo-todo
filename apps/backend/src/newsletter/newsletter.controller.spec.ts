import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: jest.Mocked<NewsletterService>;

  beforeEach(async () => {
    const mockService = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      findAll: jest.fn(),
      checkStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [{ provide: NewsletterService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NewsletterController>(NewsletterController);
    service = module.get<NewsletterService>(
      NewsletterService,
    ) as jest.Mocked<NewsletterService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should page subscribers with take/skip from the shared DTO', async () => {
      service.findAll.mockResolvedValue([{ id: '1' }] as any);
      const pagination = Object.assign(new PaginationDto(), {
        limit: 10,
        page: 2,
      });

      const result = await controller.findAll(pagination);

      expect(service.findAll).toHaveBeenCalledWith({ skip: 20, take: 10 });
      expect(result).toHaveLength(1);
    });
  });
});
