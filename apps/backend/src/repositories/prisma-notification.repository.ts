import { Injectable } from '@nestjs/common';
import {
  Notification,
  NotificationRepository,
  NotificationType,
  ResourceType,
} from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  Notification as PrismaNotification,
  NotificationType as PrismaNotificationType,
  ResourceType as PrismaResourceType,
  Prisma,
} from '@prisma/client';

/**
 * Prisma implementation of the NotificationRepository interface.
 *
 * This repository bridges the domain layer (Notification entity from @ordo-todo/core)
 * with the data access layer (Notification from Prisma).
 */
@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: Notification): Promise<Notification> {
    const prismaNotification = await this.prisma.notification.create({
      data: {
        id: notification.id as string,
        userId: notification.userId,
        // Map enums explicitly to ensure compatibility
        type: notification.type as unknown as PrismaNotificationType,
        title: notification.title,
        message: notification.message ?? null,
        resourceId: notification.resourceId ?? null,
        resourceType:
          (notification.resourceType as unknown as PrismaResourceType) ?? null,
        metadata: (notification.metadata as Prisma.InputJsonValue) ?? {},
        isRead: notification.isRead,
        readAt: notification.readAt ?? null,
        createdAt: notification.createdAt,
      },
    });

    return this.toDomain(prismaNotification);
  }

  async update(notification: Notification): Promise<Notification> {
    const prismaNotification = await this.prisma.notification.update({
      where: { id: notification.id as string },
      data: {
        userId: notification.userId,
        type: notification.type as unknown as PrismaNotificationType,
        title: notification.title,
        message: notification.message ?? null,
        resourceId: notification.resourceId ?? null,
        resourceType:
          (notification.resourceType as unknown as PrismaResourceType) ?? null,
        metadata: (notification.metadata as Prisma.InputJsonValue) ?? {},
        isRead: notification.isRead,
        readAt: notification.readAt ?? null,
      },
    });

    return this.toDomain(prismaNotification);
  }

  async findById(id: string): Promise<Notification | null> {
    const prismaNotification = await this.prisma.notification.findUnique({
      where: { id },
    });

    return prismaNotification ? this.toDomain(prismaNotification) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const prismaNotifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotifications.map((n) => this.toDomain(n));
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const prismaNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotifications.map((n) => this.toDomain(n));
  }

  async findReadByUserId(userId: string): Promise<Notification[]> {
    const prismaNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotifications.map((n) => this.toDomain(n));
  }

  async findByType(
    userId: string,
    type: NotificationType,
  ): Promise<Notification[]> {
    const prismaNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type: type as unknown as PrismaNotificationType,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotifications.map((n) => this.toDomain(n));
  }

  async findByPriority(
    userId: string,
    priority: 'high' | 'low',
  ): Promise<Notification[]> {
    // High priority types: TASK_ASSIGNED, MENTIONED, DUE_DATE_APPROACHING
    const highPriorityTypes: PrismaNotificationType[] = [
      'TASK_ASSIGNED',
      'MENTIONED',
      'DUE_DATE_APPROACHING',
    ];

    const prismaNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type:
          priority === 'high'
            ? { in: highPriorityTypes }
            : { notIn: highPriorityTypes },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaNotifications.map((n) => this.toDomain(n));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async deleteExpired(): Promise<number> {
    // Notifications don't have expiration field yet, so return 0
    return 0;
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  private toDomain(prismaNotification: PrismaNotification): Notification {
    return new Notification({
      id: prismaNotification.id,
      userId: prismaNotification.userId,
      type: prismaNotification.type as unknown as NotificationType,
      title: prismaNotification.title,
      message: prismaNotification.message,
      resourceId: prismaNotification.resourceId,
      resourceType: prismaNotification.resourceType as unknown as ResourceType,
      metadata: (prismaNotification.metadata as Record<string, unknown>) ?? {},
      isRead: prismaNotification.isRead,
      readAt: prismaNotification.readAt ?? undefined,
      createdAt: prismaNotification.createdAt,
      updatedAt: prismaNotification.createdAt, // Fallback to createdAt as updatedAt is missing in DB
    });
  }
}
