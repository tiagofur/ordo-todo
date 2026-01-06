import { Injectable } from '@nestjs/common';
import {
    BlogPost,
    BlogPostProps,
    BlogComment,
} from '@ordo-todo/core';
import type { IBlogRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
    BlogPost as PrismaBlogPost,
    BlogComment as PrismaBlogComment,
} from '@prisma/client';

/**
 * Prisma implementation of the IBlogRepository interface.
 */
@Injectable()
export class PrismaBlogRepository implements IBlogRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ============ BlogPost Operations ============

    async findPostById(id: string): Promise<BlogPost | null> {
        const post = await this.prisma.blogPost.findUnique({
            where: { id },
        });

        return post ? this.postToDomain(post) : null;
    }

    async findPostBySlug(slug: string): Promise<BlogPost | null> {
        const post = await this.prisma.blogPost.findUnique({
            where: { slug },
        });

        return post ? this.postToDomain(post) : null;
    }

    async findAllPosts(params?: {
        skip?: number;
        take?: number;
        publishedOnly?: boolean;
        category?: string;
        tag?: string;
    }): Promise<BlogPost[]> {
        const posts = await this.prisma.blogPost.findMany({
            skip: params?.skip,
            take: params?.take,
            where: {
                published: params?.publishedOnly ? true : undefined,
                category: params?.category,
                tags: params?.tag ? { has: params.tag } : undefined,
            },
            orderBy: { createdAt: 'desc' },
        });

        return posts.map((post) => this.postToDomain(post));
    }

    async createPost(post: BlogPost): Promise<BlogPost> {
        const created = await this.prisma.blogPost.create({
            data: {
                id: post.id as string,
                slug: post.props.slug,
                title: post.props.title,
                excerpt: post.props.excerpt ?? null,
                content: post.props.content,
                coverImage: post.props.coverImage ?? null,
                published: post.props.published,
                publishedAt: post.props.publishedAt ?? null,
                metaTitle: post.props.metaTitle ?? null,
                metaDescription: post.props.metaDescription ?? null,
                author: post.props.author ?? null,
                category: post.props.category ?? null,
                tags: post.props.tags,
                readTime: post.props.readTime ?? null,
            },
        });

        return this.postToDomain(created);
    }

    async updatePost(
        id: string,
        data: Partial<BlogPostProps>,
    ): Promise<BlogPost> {
        const updateData: Record<string, unknown> = {};

        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.title !== undefined) updateData.title = data.title;
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
        if (data.published !== undefined) updateData.published = data.published;
        if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
        if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
        if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
        if (data.author !== undefined) updateData.author = data.author;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.tags !== undefined) updateData.tags = data.tags;
        if (data.readTime !== undefined) updateData.readTime = data.readTime;

        const updated = await this.prisma.blogPost.update({
            where: { id },
            data: updateData,
        });

        return this.postToDomain(updated);
    }

    async deletePost(id: string): Promise<void> {
        await this.prisma.blogPost.delete({ where: { id } });
    }

    async getCategories(): Promise<string[]> {
        const posts = await this.prisma.blogPost.findMany({
            where: { published: true },
            select: { category: true },
            distinct: ['category'],
        });
        return posts.map((p) => p.category).filter((c): c is string => !!c);
    }

    // ============ BlogComment Operations ============

    async findCommentsByPostId(postId: string): Promise<BlogComment[]> {
        const comments = await this.prisma.blogComment.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' },
        });

        return comments.map((comment) => this.commentToDomain(comment));
    }

    async findCommentById(id: string): Promise<BlogComment | null> {
        const comment = await this.prisma.blogComment.findUnique({
            where: { id },
        });

        return comment ? this.commentToDomain(comment) : null;
    }

    async createComment(comment: BlogComment): Promise<BlogComment> {
        const created = await this.prisma.blogComment.create({
            data: {
                id: comment.id as string,
                content: comment.props.content,
                userId: comment.props.userId,
                postId: comment.props.postId,
            },
        });

        return this.commentToDomain(created);
    }

    async deleteComment(id: string): Promise<void> {
        await this.prisma.blogComment.delete({ where: { id } });
    }

    // ============ Domain Mappers ============

    private postToDomain(prismaPost: PrismaBlogPost): BlogPost {
        return new BlogPost({
            id: prismaPost.id,
            slug: prismaPost.slug,
            title: prismaPost.title,
            excerpt: prismaPost.excerpt ?? undefined,
            content: prismaPost.content,
            coverImage: prismaPost.coverImage ?? undefined,
            published: prismaPost.published,
            publishedAt: prismaPost.publishedAt ?? undefined,
            metaTitle: prismaPost.metaTitle ?? undefined,
            metaDescription: prismaPost.metaDescription ?? undefined,
            author: prismaPost.author ?? undefined,
            category: prismaPost.category ?? undefined,
            tags: prismaPost.tags,
            readTime: prismaPost.readTime ?? undefined,
            createdAt: prismaPost.createdAt,
            updatedAt: prismaPost.updatedAt,
        });
    }

    private commentToDomain(prismaComment: PrismaBlogComment): BlogComment {
        return new BlogComment({
            id: prismaComment.id,
            content: prismaComment.content,
            userId: prismaComment.userId,
            postId: prismaComment.postId,
            createdAt: prismaComment.createdAt,
        });
    }
}
