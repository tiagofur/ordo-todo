import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('RoadmapController', () => {
  let controller: RoadmapController;
  let service: jest.Mocked<RoadmapService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      updateStatus: jest.fn(),
      vote: jest.fn(),
      removeVote: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapController],
      providers: [{ provide: RoadmapService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoadmapController>(RoadmapController);
    service = module.get<RoadmapService>(
      RoadmapService,
    ) as jest.Mocked<RoadmapService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should page items with take/skip from the shared DTO', async () => {
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
