import { Test, TestingModule } from '@nestjs/testing';
import { ChangelogController } from './changelog.controller';
import { ChangelogService } from './changelog.service';
import { AdminGuard } from '../admin/admin.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('ChangelogController', () => {
  let controller: ChangelogController;
  let service: jest.Mocked<ChangelogService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getLatestRelease: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangelogController],
      providers: [{ provide: ChangelogService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChangelogController>(ChangelogController);
    service = module.get<ChangelogService>(
      ChangelogService,
    ) as jest.Mocked<ChangelogService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should page entries with take/skip from the shared DTO', async () => {
      service.findAll.mockResolvedValue([{ id: '1' }] as any);
      const pagination = Object.assign(new PaginationDto(), {
        limit: 10,
        page: 2,
      });

      const result = await controller.findAll(pagination);

      expect(service.findAll).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        orderBy: 'publishedAt',
      });
      expect(result).toHaveLength(1);
    });
  });
});
