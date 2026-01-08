import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  Subscription,
  SubscriptionRepository,
  SubscriptionInput,
} from '@ordo-todo/core';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Prisma implementation of SubscriptionRepository
 * Manages user subscriptions and billing plans
 */
@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: SubscriptionInput): Promise<Subscription> {
    const data = await this.prisma.subscription.create({
      data: {
        userId: input.userId,
        plan: input.plan,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripePriceId: input.stripePriceId,
        stripeCurrentPeriodEnd: input.stripeCurrentPeriodEnd,
      },
    });

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { id },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { stripeCustomerId },
    });

    return data ? this.toDomain(data) : null;
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    return data ? this.toDomain(data) : null;
  }

  async update(
    id: string,
    input: Partial<SubscriptionInput>,
  ): Promise<Subscription> {
    const data = await this.prisma.subscription.update({
      where: { id },
      data: {
        plan: input.plan,
        status: input.status,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        stripePriceId: input.stripePriceId,
        stripeCurrentPeriodEnd: input.stripeCurrentPeriodEnd,
      },
    });

    return this.toDomain(data);
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    const data = await this.prisma.subscription.update({
      where: { id },
      data: { status },
    });

    return this.toDomain(data);
  }

  async findActive(): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    return subscriptions.map((s) => this.toDomain(s));
  }

  async findByPlan(plan: any): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { plan },
    });

    return subscriptions.map((s) => this.toDomain(s));
  }

  async findExpiringSoon(): Promise<Subscription[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        stripeCurrentPeriodEnd: {
          lte: sevenDaysFromNow,
        },
      },
    });

    return subscriptions.map((s) => this.toDomain(s));
  }

  async cancel(id: string): Promise<Subscription> {
    return await this.updateStatus(id, SubscriptionStatus.CANCELED);
  }

  /**
   * Convert Prisma model to domain entity
   */
  private toDomain(prismaSubscription: any): Subscription {
    return new Subscription({
      id: prismaSubscription.id,
      userId: prismaSubscription.userId,
      plan: prismaSubscription.plan,
      status: prismaSubscription.status,
      stripeCustomerId: prismaSubscription.stripeCustomerId,
      stripeSubscriptionId: prismaSubscription.stripeSubscriptionId,
      stripePriceId: prismaSubscription.stripePriceId,
      stripeCurrentPeriodEnd: prismaSubscription.stripeCurrentPeriodEnd,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
    });
  }
}
