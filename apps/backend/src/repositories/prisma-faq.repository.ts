import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { FAQ as DomainFAQ } from '@ordo-todo/core';
import { IFAQRepository } from '@ordo-todo/core';
import { FAQ as PrismaFAQ } from '@prisma/client';

@Injectable()
export class PrismaFAQRepository implements IFAQRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DomainFAQ | null> {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
    });

    if (!faq) return null;
    return this.toDomain(faq);
  }

  async findAll(options?: {
    publishedOnly?: boolean;
    category?: string;
  }): Promise<DomainFAQ[]> {
    const where: any = {};
    if (options?.publishedOnly) {
      where.published = true;
    }
    if (options?.category) {
      where.category = options.category;
    }

    const faqs = await this.prisma.faq.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return faqs.map((f) => this.toDomain(f));
  }

  async create(faq: DomainFAQ): Promise<DomainFAQ> {
    const created = await this.prisma.faq.create({
      data: {
        id: faq.id as string,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        published: faq.published,
      },
    });

    return this.toDomain(created);
  }

  async update(faq: DomainFAQ): Promise<DomainFAQ> {
    const updated = await this.prisma.faq.update({
      where: { id: faq.id as string },
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        published: faq.published,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.faq.delete({
      where: { id },
    });
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.faq.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map((c) => c.category);
  }

  private toDomain(prismaFAQ: PrismaFAQ): DomainFAQ {
    return new DomainFAQ({
      id: prismaFAQ.id,
      question: prismaFAQ.question,
      answer: prismaFAQ.answer,
      category: prismaFAQ.category,
      order: prismaFAQ.order,
      published: prismaFAQ.published,
      createdAt: prismaFAQ.createdAt,
      updatedAt: prismaFAQ.updatedAt,
    });
  }
}
