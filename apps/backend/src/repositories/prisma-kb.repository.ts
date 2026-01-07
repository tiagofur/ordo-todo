import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { KBCategory, KBArticle } from "@ordo-todo/core";
import { IKBRepository } from "@ordo-todo/core";
import { KBCategory as PrismaKBCategory, KBArticle as PrismaKBArticle } from "@prisma/client";

@Injectable()
export class PrismaKBRepository implements IKBRepository {
    constructor(private readonly prisma: PrismaService) { }

    // Categories
    async findCategoryById(id: string): Promise<KBCategory | null> {
        const category = await this.prisma.kBCategory.findUnique({
            where: { id },
            include: { articles: true },
        });
        if (!category) return null;
        return this.categoryToDomain(category, category.articles);
    }

    async findCategoryBySlug(slug: string): Promise<KBCategory | null> {
        const category = await this.prisma.kBCategory.findUnique({
            where: { slug },
            include: { articles: true },
        });
        if (!category) return null;
        return this.categoryToDomain(category, category.articles);
    }

    async findAllCategories(): Promise<KBCategory[]> {
        const categories = await this.prisma.kBCategory.findMany({
            include: { articles: true },
            orderBy: { order: "asc" },
        });
        return categories.map((c) => this.categoryToDomain(c, c.articles));
    }

    async createCategory(category: KBCategory): Promise<KBCategory> {
        const created = await this.prisma.kBCategory.create({
            data: {
                id: category.id as string,
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                order: category.order,
            },
        });
        return this.categoryToDomain(created);
    }

    async updateCategory(category: KBCategory): Promise<KBCategory> {
        const updated = await this.prisma.kBCategory.update({
            where: { id: category.id as string },
            data: {
                name: category.name,
                slug: category.slug,
                icon: category.icon,
                order: category.order,
            },
        });
        return this.categoryToDomain(updated);
    }

    async deleteCategory(id: string): Promise<void> {
        await this.prisma.kBCategory.delete({
            where: { id },
        });
    }

    // Articles
    async findArticleById(id: string): Promise<KBArticle | null> {
        const article = await this.prisma.kBArticle.findUnique({
            where: { id },
        });
        if (!article) return null;
        return this.articleToDomain(article);
    }

    async findArticleBySlug(slug: string): Promise<KBArticle | null> {
        const article = await this.prisma.kBArticle.findUnique({
            where: { slug },
        });
        if (!article) return null;
        return this.articleToDomain(article);
    }

    async findArticlesByCategory(categoryId: string, options?: { publishedOnly?: boolean }): Promise<KBArticle[]> {
        const where: any = { categoryId };
        if (options?.publishedOnly) {
            where.published = true;
        }
        const articles = await this.prisma.kBArticle.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return articles.map((a) => this.articleToDomain(a));
    }

    async findAllArticles(options?: { publishedOnly?: boolean; categoryId?: string }): Promise<KBArticle[]> {
        const where: any = {};
        if (options?.publishedOnly) {
            where.published = true;
        }
        if (options?.categoryId) {
            where.categoryId = options.categoryId;
        }
        const articles = await this.prisma.kBArticle.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return articles.map((a) => this.articleToDomain(a));
    }

    async createArticle(article: KBArticle): Promise<KBArticle> {
        const created = await this.prisma.kBArticle.create({
            data: {
                id: article.id as string,
                slug: article.slug,
                title: article.title,
                content: article.content,
                excerpt: article.props.excerpt,
                categoryId: article.categoryId,
                helpfulYes: article.helpfulYes,
                helpfulNo: article.helpfulNo,
                published: article.published,
            },
        });
        return this.articleToDomain(created);
    }

    async updateArticle(article: KBArticle): Promise<KBArticle> {
        const updated = await this.prisma.kBArticle.update({
            where: { id: article.id as string },
            data: {
                slug: article.slug,
                title: article.title,
                content: article.content,
                excerpt: article.props.excerpt,
                categoryId: article.categoryId,
                helpfulYes: article.helpfulYes,
                helpfulNo: article.helpfulNo,
                published: article.published,
            },
        });
        return this.articleToDomain(updated);
    }

    async deleteArticle(id: string): Promise<void> {
        await this.prisma.kBArticle.delete({
            where: { id },
        });
    }

    async searchArticles(query: string): Promise<KBArticle[]> {
        const articles = await this.prisma.kBArticle.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { content: { contains: query, mode: "insensitive" } },
                ],
                published: true,
            },
        });
        return articles.map((a) => this.articleToDomain(a));
    }

    // Mappers
    private categoryToDomain(prismaCategory: PrismaKBCategory, prismaArticles: PrismaKBArticle[] = []): KBCategory {
        return new KBCategory({
            id: prismaCategory.id,
            name: prismaCategory.name,
            slug: prismaCategory.slug,
            icon: prismaCategory.icon ?? undefined,
            order: prismaCategory.order,
            articles: prismaArticles.map((a) => this.articleToDomain(a)),
            createdAt: prismaCategory.createdAt,
            updatedAt: prismaCategory.updatedAt,
        });
    }

    private articleToDomain(prismaArticle: PrismaKBArticle): KBArticle {
        return new KBArticle({
            id: prismaArticle.id,
            slug: prismaArticle.slug,
            title: prismaArticle.title,
            content: prismaArticle.content,
            excerpt: prismaArticle.excerpt ?? undefined,
            categoryId: prismaArticle.categoryId,
            helpfulYes: prismaArticle.helpfulYes,
            helpfulNo: prismaArticle.helpfulNo,
            published: prismaArticle.published,
            createdAt: prismaArticle.createdAt,
            updatedAt: prismaArticle.updatedAt,
        });
    }
}
