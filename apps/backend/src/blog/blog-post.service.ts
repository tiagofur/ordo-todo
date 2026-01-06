import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BlogPost, BlogComment } from '@ordo-todo/core';
import type { IBlogRepository } from '@ordo-todo/core';
import { GeminiAIService } from '../ai/gemini-ai.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BlogPostService {
  constructor(
    @Inject('BlogRepository')
    private readonly blogRepository: IBlogRepository,
    private readonly geminiService: GeminiAIService,
    private readonly prisma: PrismaService, // Still needed for user lookup in comments for now
  ) { }

  async create(data: CreatePostDto) {
    const post = BlogPost.create({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      author: data.author,
      category: data.category,
      tags: data.tags || [],
    });

    if (data.published) {
      return this.blogRepository.createPost(post.publish());
    }

    return this.blogRepository.createPost(post);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    publishedOnly?: boolean;
    category?: string;
    tag?: string;
  }) {
    return this.blogRepository.findAllPosts({
      skip: params.skip,
      take: params.take,
      publishedOnly: params.publishedOnly,
      category: params.category,
      tag: params.tag,
    });
  }

  async findOne(slug: string) {
    const post = await this.blogRepository.findPostBySlug(slug);
    if (!post) {
      throw new NotFoundException(`Blog post with slug '${slug}' not found`);
    }

    // Standard DDD: Service orchestrates fetching related data if not in aggregate
    const comments = await this.blogRepository.findCommentsByPostId(post.id as string);

    // We need to fetch user info for comments as well
    // For now, let's keep it simple. If the UI needs user info, we might need a more complex query.
    // The current controller expects the prisma response. Let's see if we can maintain compatibility.

    // To maintain compatibility with existing controller/frontend, we might need to return a plain object
    // with comments included and populated.

    const commentsWithUser = await Promise.all(
      comments.map(async (c) => {
        const user = await this.prisma.client.user.findUnique({
          where: { id: c.userId },
          select: { id: true, name: true, image: true },
        });
        return {
          ...c.props,
          user,
        };
      })
    );

    return {
      ...post.props,
      comments: commentsWithUser,
    };
  }

  async update(id: string, data: UpdatePostDto) {
    const post = await this.blogRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }

    return this.blogRepository.updatePost(id, {
      ...data,
      publishedAt: data.published && !post.published ? new Date() : post.props.publishedAt,
    });
  }

  async delete(id: string) {
    const post = await this.blogRepository.findPostById(id);
    if (!post) {
      throw new NotFoundException(`Blog post with ID '${id}' not found`);
    }

    await this.blogRepository.deletePost(id);
    return { success: true };
  }

  async getCategories() {
    return this.blogRepository.getCategories();
  }

  async addComment(slug: string, userId: string, content: string) {
    const post = await this.blogRepository.findPostBySlug(slug);
    if (!post) throw new NotFoundException('Blog post not found');

    const comment = BlogComment.create({
      content,
      userId,
      postId: post.id as string,
    });

    const created = await this.blogRepository.createComment(comment);

    // Populate user for return
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, image: true },
    });

    return {
      ...created.props,
      user,
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.blogRepository.findCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    await this.blogRepository.deleteComment(commentId);
    return { success: true };
  }

  async generatePost(topic: string) {
    return this.geminiService.generateBlogPost(topic);
  }
}
