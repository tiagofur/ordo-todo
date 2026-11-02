import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('ContactController', () => {
  let controller: ContactController;
  let service: jest.Mocked<ContactService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      markAsRead: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(
      ContactService,
    ) as jest.Mocked<ContactService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should page submissions with take/skip from the shared DTO', async () => {
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
