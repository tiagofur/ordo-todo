import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const origins = process.env.CORS_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map((o) => o.trim());
};

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message?: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: any;
  createdAt: Date;
}

export interface InsightPayload {
  type: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  actionable: boolean;
  action?: { type: string; data: any };
}

export interface TimerAlertPayload {
  type: 'SESSION_COMPLETE' | 'BREAK_REMINDER' | 'LONG_SESSION';
  message: string;
  taskId?: string;
  sessionId?: string;
}

export interface TaskReminderPayload {
  taskId: string;
  taskTitle: string;
  dueDate: Date;
  priority: string;
  minutesUntilDue: number;
}

@Injectable()
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = getAllowedOrigins();
      if (
        !origin ||
        allowedOrigins.some((allowed) => origin.startsWith(allowed))
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private jwtService: JwtService) {}

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Connection rejected: No auth token');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      client.data.userId = userId;

      // Track user's sockets (supports multiple tabs/devices)
      const userSockets = this.userSockets.get(userId) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(userId, userSockets);

      // Join user's personal room
      client.join(`user:${userId}`);

      this.logger.log(
        `User ${userId} connected to notifications (socket: ${client.id})`,
      );

      // Send welcome message with connection info
      client.emit('connected', {
        message: 'Connected to notifications',
        userId,
        connectedAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(`Connection rejected: Invalid token - ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);
          this.logger.log(`User ${userId} fully disconnected`);
        } else {
          this.logger.debug(
            `User ${userId} disconnected one socket, ${userSockets.size} remaining`,
          );
        }
      }
    }
  }

  // ============ SEND METHODS (called by services) ============

  /**
   * Send a new notification to a user
   * Called by NotificationsService when creating a notification
   */
  sendNotification(userId: string, notification: NotificationPayload): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.debug(
      `Notification sent to user ${userId}: ${notification.type}`,
    );
  }

  /**
   * Send a task reminder to a user
   * Called by SmartNotificationsService for upcoming task reminders
   */
  sendTaskReminder(userId: string, reminder: TaskReminderPayload): void {
    this.server.to(`user:${userId}`).emit('task:reminder', reminder);
    this.logger.debug(
      `Task reminder sent to user ${userId}: ${reminder.taskTitle}`,
    );
  }

  /**
   * Send a timer alert to a user
   * Called by TimersService for session completions, break reminders
   */
  sendTimerAlert(userId: string, alert: TimerAlertPayload): void {
    this.server.to(`user:${userId}`).emit('timer:alert', alert);
    this.logger.debug(`Timer alert sent to user ${userId}: ${alert.type}`);
  }

  /**
   * Send a proactive AI insight to a user
   * Called by ProductivityCoachService for smart suggestions
   */
  sendInsight(userId: string, insight: InsightPayload): void {
    this.server.to(`user:${userId}`).emit('ai:insight', insight);
    this.logger.debug(`AI insight sent to user ${userId}: ${insight.type}`);
  }

  /**
   * Broadcast notification count update to a user
   * Called when notifications are created or marked as read
   */
  sendUnreadCount(userId: string, count: number): void {
    this.server.to(`user:${userId}`).emit('notification:count', { count });
  }

  // ============ CLIENT EVENTS ============

  /**
   * Handle client marking a notification as read
   */
  @SubscribeMessage('notification:read')
  handleMarkAsRead(client: Socket, data: { notificationId: string }): void {
    // This is handled by the REST API, but we acknowledge the event
    this.logger.debug(
      `User ${client.data.userId} marked notification ${data.notificationId} as read`,
    );
  }

  /**
   * Handle client requesting connection status
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket): { event: string; data: { pong: boolean } } {
    return { event: 'pong', data: { pong: true } };
  }

  // ============ UTILITY METHODS ============

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }

  /**
   * Get count of connected users
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get all connected socket IDs for a user
   */
  getUserSocketIds(userId: string): string[] {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets) : [];
  }
}
