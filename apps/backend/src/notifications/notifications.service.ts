import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationType, ResourceType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private gateway?: NotificationsGateway,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    resourceId?: string;
    resourceType?: ResourceType;
    metadata?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });

    // Push real-time notification via WebSocket
    if (this.gateway) {
      this.gateway.sendNotification(data.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message ?? undefined,
        resourceId: notification.resourceId ?? undefined,
        resourceType: notification.resourceType ?? undefined,
        metadata: notification.metadata,
        createdAt: notification.createdAt,
      });

      // Also send updated unread count
      const unreadCount = await this.getUnreadCount(data.userId);
      this.gateway.sendUnreadCount(data.userId, unreadCount);
    }

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    // Verify ownership implicitly by where clause
    const result = await this.prisma.notification.updateMany({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Send updated unread count via WebSocket
    if (this.gateway && result.count > 0) {
      const unreadCount = await this.getUnreadCount(userId);
      this.gateway.sendUnreadCount(userId, unreadCount);
    }

    return result;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Send updated unread count (0) via WebSocket
    if (this.gateway && result.count > 0) {
      this.gateway.sendUnreadCount(userId, 0);
    }

    return result;
  }
}
