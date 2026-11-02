import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SemanticSearchService } from './semantic-search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<SemanticSearchService>;

  const mockUser = { id: 'user-1' } as any;

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
      getSuggestions: jest.fn(),
      ask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SemanticSearchService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SemanticSearchService>(
      SemanticSearchService,
    ) as jest.Mocked<SemanticSearchService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should cap limit at 100', async () => {
      service.search.mockResolvedValue({
        results: [],
        interpretation: {} as any,
        totalCount: 0,
      });

      await controller.search(
        'docs',
        undefined,
        undefined,
        'false',
        '5000',
        mockUser,
      );

      expect(service.search).toHaveBeenCalledWith(
        'user-1',
        'docs',
        expect.objectContaining({ limit: 100 }),
      );
    });

    it('should default limit to 20 and clamp to minimum 1', async () => {
      service.search.mockResolvedValue({
        results: [],
        interpretation: {} as any,
        totalCount: 0,
      });

      await controller.search(
        'docs',
        undefined,
        undefined,
        'false',
        undefined,
        mockUser,
      );
      expect(service.search).toHaveBeenCalledWith(
        'user-1',
        'docs',
        expect.objectContaining({ limit: 20 }),
      );

      await controller.search(
        'docs',
        undefined,
        undefined,
        'false',
        '-5',
        mockUser,
      );
      expect(service.search).toHaveBeenCalledWith(
        'user-1',
        'docs',
        expect.objectContaining({ limit: 1 }),
      );
    });
  });
});
