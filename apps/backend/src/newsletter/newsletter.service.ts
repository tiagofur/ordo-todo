import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { NewsletterSubscriber } from '@ordo-todo/core';
import type { INewsletterRepository } from '@ordo-todo/core';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @Inject('NewsletterRepository')
    private readonly newsletterRepository: INewsletterRepository,
  ) { }

  async subscribe(data: SubscribeDto) {
    const { email, userId } = data;

    // Check if subscription already exists by email
    const existingByEmail = await this.newsletterRepository.findByEmail(email);

    if (existingByEmail) {
      if (existingByEmail.active) {
        throw new BadRequestException('Email is already subscribed');
      }
      // Reactivate
      return this.newsletterRepository.update(existingByEmail.id as string, {
        active: true,
        userId: userId || existingByEmail.userId,
      });
    }

    // Check if subscription exists by userId if provided
    if (userId) {
      const existingByUser = await this.newsletterRepository.findByUserId(userId);
      if (existingByUser) {
        // User already has a subscription, update their email
        return this.newsletterRepository.update(existingByUser.id as string, {
          email,
          active: true,
        });
      }
    }

    // Create new
    const subscriber = NewsletterSubscriber.create({
      email,
      userId: userId || undefined,
    });

    return this.newsletterRepository.create(subscriber);
  }

  async unsubscribe(data: UnsubscribeDto) {
    const { email } = data;

    const subscriber = await this.newsletterRepository.findByEmail(email);

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    if (!subscriber.active) {
      // Already unsubscribed, mostly idempotent
      return subscriber;
    }

    return this.newsletterRepository.update(subscriber.id as string, {
      active: false,
    });
  }

  async checkStatus(email: string): Promise<boolean> {
    const subscriber = await this.newsletterRepository.findByEmail(email);
    return !!subscriber?.active;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    activeOnly?: boolean;
  }) {
    return this.newsletterRepository.findAll({
      skip: params.skip,
      take: params.take,
      activeOnly: params.activeOnly,
    });
  }
}
