import { Injectable } from '@nestjs/common';
import {
  NewsletterSubscriber,
  NewsletterSubscriberProps,
} from '@ordo-todo/core';
import type { INewsletterRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { NewsletterSubscriber as PrismaNewsletterSubscriber } from '@prisma/client';

/**
 * Prisma implementation of the INewsletterRepository interface.
 */
@Injectable()
export class PrismaNewsletterRepository implements INewsletterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    return subscriber ? this.toDomain(subscriber) : null;
  }

  async findByUserId(userId: string): Promise<NewsletterSubscriber | null> {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { userId },
    });

    return subscriber ? this.toDomain(subscriber) : null;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    activeOnly?: boolean;
  }): Promise<NewsletterSubscriber[]> {
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      skip: params?.skip,
      take: params?.take,
      where: params?.activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return subscribers.map((s) => this.toDomain(s));
  }

  async create(
    subscriber: NewsletterSubscriber,
  ): Promise<NewsletterSubscriber> {
    const created = await this.prisma.newsletterSubscriber.create({
      data: {
        id: subscriber.id as string,
        email: subscriber.props.email,
        active: subscriber.props.active,
        userId: subscriber.props.userId ?? null,
      },
    });

    return this.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<NewsletterSubscriberProps>,
  ): Promise<NewsletterSubscriber> {
    const updateData: Record<string, unknown> = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.userId !== undefined) updateData.userId = data.userId;

    const updated = await this.prisma.newsletterSubscriber.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  private toDomain(
    prismaSubscriber: PrismaNewsletterSubscriber,
  ): NewsletterSubscriber {
    return new NewsletterSubscriber({
      id: prismaSubscriber.id,
      email: prismaSubscriber.email,
      active: prismaSubscriber.active,
      userId: prismaSubscriber.userId ?? undefined,
      createdAt: prismaSubscriber.createdAt,
    });
  }
}
