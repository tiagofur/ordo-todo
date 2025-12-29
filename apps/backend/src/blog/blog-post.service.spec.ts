import { Test, TestingModule } from '@nestjs/testing';
import { BlogPostService } from './blog-post.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
    blogPost: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    blogComment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
    },
};

describe('BlogPostService', () => {
    let service: BlogPostService;
    let prisma: typeof mockPrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BlogPostService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<BlogPostService>(BlogPostService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a blog post', async () => {
            const dto = {
                slug: 'test-post',
                title: 'Test Post',
                content: 'Content',
                published: true,
            };

            const expectedResult = { id: '1', ...dto, publishedAt: expect.any(Date) };
            prisma.blogPost.create.mockResolvedValue(expectedResult);

            const result = await service.create(dto);
            expect(result).toEqual(expectedResult);
            expect(prisma.blogPost.create).toHaveBeenCalledWith({
                data: {
                    ...dto,
                    publishedAt: expect.any(Date),
                },
            });
        });
    });

    describe('findOne', () => {
        it('should return a blog post if found', async () => {
            const post = { id: '1', slug: 'test-post', title: 'Test' };
            prisma.blogPost.findUnique.mockResolvedValue(post);

            const result = await service.findOne('test-post');
            expect(result).toEqual(post);
        });

        it('should throw NotFoundException if not found', async () => {
            prisma.blogPost.findUnique.mockResolvedValue(null);

            await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
        });
    });
});
