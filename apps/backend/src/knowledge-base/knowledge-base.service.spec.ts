import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KBCategory, KBArticle } from '@ordo-todo/core';
import type { IKBRepository } from '@ordo-todo/core';

describe('KnowledgeBaseService', () => {
    let service: KnowledgeBaseService;
    let repository: jest.Mocked<IKBRepository>;

    const mockCategory = new KBCategory({
        id: 'cat-1',
        name: 'General',
        slug: 'general',
        order: 0,
    });

    const mockArticle = new KBArticle({
        id: 'art-1',
        slug: 'get-started',
        title: 'Get Started',
        content: 'Welcome',
        categoryId: 'cat-1',
        helpfulYes: 0,
        helpfulNo: 0,
        published: true,
    });

    beforeEach(async () => {
        const mockRepo = {
            findCategoryById: jest.fn(),
            findCategoryBySlug: jest.fn(),
            findAllCategories: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            findArticleById: jest.fn(),
            findArticleBySlug: jest.fn(),
            findArticlesByCategory: jest.fn(),
            findAllArticles: jest.fn(),
            createArticle: jest.fn(),
            updateArticle: jest.fn(),
            deleteArticle: jest.fn(),
            searchArticles: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KnowledgeBaseService,
                { provide: 'KBRepository', useValue: mockRepo },
            ],
        }).compile();

        service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
        repository = module.get('KBRepository');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Categories', () => {
        it('should create a category', async () => {
            repository.createCategory.mockResolvedValue(mockCategory);
            const result = await service.createCategory({
                name: 'General',
                slug: 'general',
            });
            expect(result).toEqual(mockCategory);
        });
    });

    describe('Articles', () => {
        it('should create an article', async () => {
            repository.createArticle.mockResolvedValue(mockArticle);
            const result = await service.createArticle({
                slug: 'get-started',
                title: 'Get Started',
                content: 'Welcome',
                categoryId: 'cat-1',
            });
            expect(result).toEqual(mockArticle);
        });

        it('should vote on an article', async () => {
            repository.findArticleById.mockResolvedValue(mockArticle);
            repository.updateArticle.mockResolvedValue(mockArticle.voteHelpful(true));

            const result = await service.voteArticle('art-1', true);
            expect(result.helpfulYes).toBe(1);
            expect(repository.updateArticle).toHaveBeenCalled();
        });
    });
});
