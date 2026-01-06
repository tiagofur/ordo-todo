import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiAIService } from '../ai/gemini-ai.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogPostService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiAIService,
  ) {}

  async create(data: CreatePostDto) {
    return this.prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.BlogPostWhereInput;
    orderBy?: Prisma.BlogPostOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.blogPost.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findOne(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        comments: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Blog post with slug '${slug}' not found`);
    }

    return post;
  }

  async update(id: string, data: UpdatePostDto) {
    try {
      return await this.prisma.blogPost.update({
        where: { id },
        data,
      });
    } catch (error) {
      // P2025 is Prisma's "Record to update not found"
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Blog post with ID '${id}' not found`);
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.blogPost.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Blog post with ID '${id}' not found`);
      }
      throw error;
    }
  }

  async getCategories() {
    const posts = await this.prisma.blogPost.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ['category'],
    });
    return posts.map((p) => p.category).filter(Boolean);
  }

  async addComment(slug: string, userId: string, content: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');

    return this.prisma.blogComment.create({
      data: {
        content,
        userId,
        postId: post.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only allow deletion if user owns the comment
    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }

    return this.prisma.blogComment.delete({
      where: { id: commentId },
    });
  }

  async generatePost(topic: string) {
    return this.geminiService.generateBlogPost(topic);
  }
}
