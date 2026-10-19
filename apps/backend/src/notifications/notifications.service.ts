import { Inject, Injectable, Optional } from '@nestjs/common';
import { NotificationType, ResourceType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import {
  CreateNotificationUseCase,
  CountUnreadNotificationsUseCase,
  MarkAsReadUseCase,
  MarkAllAsReadUseCase,
  NotificationType as CoreNotificationType,
  ResourceType as CoreResourceType,
} from '@ordo-todo/core';
import type { NotificationRepository } from '@ordo-todo/core';
import { SLACK_NOTIFIER } from '../slack/slack-notifier.port';
import type { SlackNotifier } from '../slack/slack-notifier.port';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,
    @Optional() private gateway?: NotificationsGateway,
    @Optional()
    @Inject(SLACK_NOTIFIER)
    private readonly slack?: SlackNotifier,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    resourceId?: string;
    resourceType?: ResourceType;
    metadata?: Record<string, unknown>;
  }) {
    const useCase = new CreateNotificationUseCase(this.notificationRepository);
    const notification = await useCase.execute({
      userId: data.userId,
      type: data.type as unknown as CoreNotificationType,
      title: data.title,
      message: data.message,
      resourceId: data.resourceId,
      resourceType: data.resourceType as unknown as CoreResourceType,
      metadata: data.metadata,
    });

    // Push real-time notification via WebSocket
    if (this.gateway) {
      this.gateway.sendNotification(data.userId, {
        id: notification.id as string,
        type: notification.type as unknown as NotificationType,
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

    // Route to Slack when available. Fire-and-forget: Slack failures
    // must never break in-app notifications (the notifier logs them).
    if (this.slack) {
      void this.slack
        .notify({
          userId: data.userId,
          type: String(data.type),
          title: data.title,
          message: data.message,
          resourceId: data.resourceId,
          resourceType: data.resourceType
            ? String(data.resourceType)
            : undefined,
        })
        .catch(() => undefined);
    }

    return notification;
  }

  async findAll(userId: string) {
    const notifications =
      await this.notificationRepository.findByUserId(userId);
    return notifications.map((n) => n.props);
  }

  async getUnreadCount(userId: string) {
    const useCase = new CountUnreadNotificationsUseCase(
      this.notificationRepository,
    );
    const result = await useCase.execute({ userId });
    return result.count;
  }

  async markAsRead(id: string, userId: string) {
    const useCase = new MarkAsReadUseCase(this.notificationRepository);
    const notification = await useCase.execute({ notificationId: id, userId });

    // Send updated unread count via WebSocket
    if (this.gateway && notification) {
      const unreadCount = await this.getUnreadCount(userId);
      this.gateway.sendUnreadCount(userId, unreadCount);
    }

    return notification ? notification.props : null;
  }

  async markAllAsRead(userId: string) {
    const useCase = new MarkAllAsReadUseCase(this.notificationRepository);
    await useCase.execute({ userId });

    // Send updated unread count (0) via WebSocket
    if (this.gateway) {
      this.gateway.sendUnreadCount(userId, 0);
    }

    return { count: 1 }; // Mimic updateMany result
  }
}
