import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { CreateKBCategoryDto } from './dto/create-category.dto';
import { CreateKBArticleDto } from './dto/create-article.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('KnowledgeBaseController', () => {
  let controller: KnowledgeBaseController;
  let service: jest.Mocked<KnowledgeBaseService>;

  beforeEach(async () => {
    const mockService = {
      createCategory: jest.fn(),
      findAllCategories: jest.fn(),
      findCategory: jest.fn(),
      updateCategory: jest.fn(),
      removeCategory: jest.fn(),
      createArticle: jest.fn(),
      findAllArticles: jest.fn(),
      findArticle: jest.fn(),
      updateArticle: jest.fn(),
      removeArticle: jest.fn(),
      search: jest.fn(),
      voteArticle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeBaseController],
      providers: [{ provide: KnowledgeBaseService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<KnowledgeBaseController>(KnowledgeBaseController);
    service = module.get<KnowledgeBaseService>(
      KnowledgeBaseService,
    ) as jest.Mocked<KnowledgeBaseService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Categories', () => {
    it('should create a category', async () => {
      const dto: CreateKBCategoryDto = { name: 'Cat1', slug: 'cat1' };
      service.createCategory.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await controller.createCategory(dto);

      expect(service.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', '1');
    });

    it('should return categories', async () => {
      service.findAllCategories.mockResolvedValue([{ id: '1' }] as any);
      const result = await controller.findAllCategories();
      expect(result).toHaveLength(1);
    });
  });

  describe('Articles', () => {
    it('should create an article', async () => {
      const dto: CreateKBArticleDto = {
        title: 'Art1',
        slug: 'art1',
        content: 'Content',
        categoryId: '1',
      };
      service.createArticle.mockResolvedValue({ id: '1', ...dto } as any);

      const result = await controller.createArticle(dto);

      expect(service.createArticle).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id', '1');
    });

    it('should search articles', async () => {
      service.search.mockResolvedValue([{ id: '1' }] as any);
      const result = await controller.search('test');
      expect(service.search).toHaveBeenCalledWith('test');
      expect(result).toHaveLength(1);
    });

    it('should page articles with take/skip', async () => {
      service.findAllArticles.mockResolvedValue([{ id: '1' }] as any);
      const pagination = Object.assign(new PaginationDto(), {
        limit: 10,
        page: 2,
      });

      const result = await controller.findAllArticles(
        pagination,
        undefined,
        'true',
      );

      expect(service.findAllArticles).toHaveBeenCalledWith({
        categoryId: undefined,
        publishedOnly: true,
        take: 10,
        skip: 20,
      });
      expect(result).toHaveLength(1);
    });
  });
});
