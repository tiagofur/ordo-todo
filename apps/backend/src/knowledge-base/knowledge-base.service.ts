import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { KBCategory, KBArticle } from '@ordo-todo/core';
import type { IKBRepository } from '@ordo-todo/core';
import { CreateKBCategoryDto } from './dto/create-category.dto';
import { UpdateKBCategoryDto } from './dto/update-category.dto';
import { CreateKBArticleDto } from './dto/create-article.dto';
import { UpdateKBArticleDto } from './dto/update-article.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @Inject('KBRepository')
    private readonly kbRepository: IKBRepository,
  ) {}

  // Categories
  async createCategory(dto: CreateKBCategoryDto): Promise<KBCategory> {
    const category = KBCategory.create({
      name: dto.name,
      slug: dto.slug,
      icon: dto.icon,
      order: dto.order ?? 0,
    });
    return this.kbRepository.createCategory(category);
  }

  async findAllCategories(): Promise<KBCategory[]> {
    return this.kbRepository.findAllCategories();
  }

  async findCategory(idOrSlug: string): Promise<KBCategory> {
    let category = await this.kbRepository.findCategoryById(idOrSlug);
    if (!category) {
      category = await this.kbRepository.findCategoryBySlug(idOrSlug);
    }
    if (!category) {
      throw new NotFoundException(
        `Knowledge Base Category ${idOrSlug} not found`,
      );
    }
    return category;
  }

  async updateCategory(
    id: string,
    dto: UpdateKBCategoryDto,
  ): Promise<KBCategory> {
    const category = await this.findCategory(id);
    const updated = category.update(dto);
    return this.kbRepository.updateCategory(updated);
  }

  async removeCategory(id: string): Promise<{ success: boolean }> {
    await this.findCategory(id);
    await this.kbRepository.deleteCategory(id);
    return { success: true };
  }

  // Articles
  async createArticle(dto: CreateKBArticleDto): Promise<KBArticle> {
    const article = KBArticle.create({
      slug: dto.slug,
      title: dto.title,
      content: dto.content,
      excerpt: dto.excerpt,
      categoryId: dto.categoryId,
      published: dto.published ?? false,
    });
    return this.kbRepository.createArticle(article);
  }

  async findAllArticles(options?: {
    publishedOnly?: boolean;
    categoryId?: string;
  }): Promise<KBArticle[]> {
    return this.kbRepository.findAllArticles(options);
  }

  async findArticlesByCategory(
    categoryId: string,
    options?: { publishedOnly?: boolean },
  ): Promise<KBArticle[]> {
    return this.kbRepository.findArticlesByCategory(categoryId, options);
  }

  async findArticle(idOrSlug: string): Promise<KBArticle> {
    let article = await this.kbRepository.findArticleById(idOrSlug);
    if (!article) {
      article = await this.kbRepository.findArticleBySlug(idOrSlug);
    }
    if (!article) {
      throw new NotFoundException(
        `Knowledge Base Article ${idOrSlug} not found`,
      );
    }
    return article;
  }

  async updateArticle(id: string, dto: UpdateKBArticleDto): Promise<KBArticle> {
    const article = await this.findArticle(id);
    const updated = article.update(dto);
    return this.kbRepository.updateArticle(updated);
  }

  async removeArticle(id: string): Promise<{ success: boolean }> {
    await this.findArticle(id);
    await this.kbRepository.deleteArticle(id);
    return { success: true };
  }

  async voteArticle(id: string, helpful: boolean): Promise<KBArticle> {
    const article = await this.findArticle(id);
    const updated = article.voteHelpful(helpful);
    return this.kbRepository.updateArticle(updated);
  }

  async search(query: string): Promise<KBArticle[]> {
    return this.kbRepository.searchArticles(query);
  }
}
