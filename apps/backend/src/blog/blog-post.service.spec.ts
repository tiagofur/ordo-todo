import { Test, TestingModule } from '@nestjs/testing';
import { BlogPostService } from './blog-post.service';
import { PrismaService } from '../database/prisma.service';
import { GeminiAIService } from '../ai/gemini-ai.service';
import { NotFoundException } from '@nestjs/common';
import { BlogPost, BlogComment } from '@ordo-todo/core';
import type { IBlogRepository } from '@ordo-todo/core';

describe('BlogPostService', () => {
  let service: BlogPostService;
  let blogRepository: jest.Mocked<IBlogRepository>;
  let prisma: any;

  const mockPost = new BlogPost({
    id: 'post-1',
    slug: 'test-post',
    title: 'Test Post',
    content: 'Content',
    published: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPrisma = {
    client: {
      user: {
        findUnique: jest.fn(),
      },
      blogComment: {
        findUnique: jest.fn(),
      }
    },
  };

  const mockGeminiService = {
    generateBlogPost: jest.fn(),
  };

  beforeEach(async () => {
    blogRepository = {
      findPostById: jest.fn(),
      findPostBySlug: jest.fn(),
      findAllPosts: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      getCategories: jest.fn(),
      findCommentsByPostId: jest.fn(),
      findCommentById: jest.fn(),
      createComment: jest.fn(),
      deleteComment: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogPostService,
        { provide: 'BlogRepository', useValue: blogRepository },
        { provide: GeminiAIService, useValue: mockGeminiService },
        { provide: PrismaService, useValue: mockPrisma },
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

      blogRepository.createPost.mockResolvedValue(mockPost.publish());

      const result = await service.create(dto);

      expect(blogRepository.createPost).toHaveBeenCalled();
      expect(result.published).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a blog post with comments', async () => {
      blogRepository.findPostBySlug.mockResolvedValue(mockPost);
      blogRepository.findCommentsByPostId.mockResolvedValue([]);

      const result = await service.findOne('test-post');

      expect(result.slug).toBe('test-post');
      expect(result.comments).toEqual([]);
    });

    it('should throw NotFoundException if not found', async () => {
      blogRepository.findPostBySlug.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addComment', () => {
    it('should add a comment and return with user info', async () => {
      const slug = 'test-post';
      const userId = 'user-1';
      const content = 'Great post!';

      blogRepository.findPostBySlug.mockResolvedValue(mockPost);
      const mockComment = new BlogComment({
        id: 'comment-1',
        content,
        userId,
        postId: mockPost.id as string,
        createdAt: new Date(),
      });
      blogRepository.createComment.mockResolvedValue(mockComment);
      prisma.client.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'John Doe',
      });

      const result = await service.addComment(slug, userId, content);

      expect(blogRepository.createComment).toHaveBeenCalled();
      expect(result.user.name).toBe('John Doe');
    });
  });
});
