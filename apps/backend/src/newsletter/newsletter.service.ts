import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsletterService {
    constructor(private prisma: PrismaService) { }

    async subscribe(data: SubscribeDto) {
        const { email, userId } = data;

        // Check if subscription already exists by email
        const existingByEmail = await this.prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existingByEmail) {
            if (existingByEmail.active) {
                throw new BadRequestException('Email is already subscribed');
            }
            // Reactivate
            return this.prisma.newsletterSubscriber.update({
                where: { email },
                data: { active: true, userId: userId || existingByEmail.userId },
            });
        }

        // Check if subscription exists by userId if provided
        if (userId) {
            const existingByUser = await this.prisma.newsletterSubscriber.findUnique({
                where: { userId },
            });
            if (existingByUser) {
                // User already has a subscription (maybe with different email?)
                // For simplicity, we'll update the email on their existing subscription or throw
                // Let's assume we update it.
                return this.prisma.newsletterSubscriber.update({
                    where: { id: existingByUser.id },
                    data: { email, active: true }
                });
            }
        }

        // Create new
        return this.prisma.newsletterSubscriber.create({
            data: {
                email,
                userId: userId || null,
                active: true,
            },
        });
    }

    async unsubscribe(data: UnsubscribeDto) {
        const { email } = data;

        const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (!subscriber) {
            throw new NotFoundException('Subscriber not found');
        }

        if (!subscriber.active) {
            // Already unsubscribed, mostly idempotent
            return subscriber;
        }

        return this.prisma.newsletterSubscriber.update({
            where: { email },
            data: { active: false },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.NewsletterSubscriberWhereInput;
        orderBy?: Prisma.NewsletterSubscriberOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.newsletterSubscriber.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }
}
