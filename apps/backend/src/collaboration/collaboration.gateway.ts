import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsThrottleGuard } from '../common/guards/ws-throttle.guard';
import { PrismaService } from '../database/prisma.service';

interface UserPresence {
  userId: string;
  userName: string;
  workspaceId: string;
  taskId?: string;
  lastSeen: Date;
}

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const origins = process.env.CORS_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map((o) => o.trim());
};

@WebSocketGateway({
  namespace: 'collaboration',
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = getAllowedOrigins();
      // Same policy as the HTTP CORS in main.ts: exact allowlist match plus
      // local/Tauri origins (Tauri 2 mobile serves the WebView from
      // https://tauri.localhost). No prefix matching —
      // "http://localhost:3000.evil" must not pass.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^tauri:\/\//.test(origin) ||
        origin === 'http://tauri.localhost' ||
        origin === 'https://tauri.localhost'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private activeUsers: Map<string, UserPresence> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookieHeader = client.handshake?.headers?.cookie;
      let cookieToken: string | undefined;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce(
          (res, c) => {
            const [key, val] = c.trim().split('=');
            if (key && val) res[key] = decodeURIComponent(val);
            return res;
          },
          {} as Record<string, string>,
        );
        cookieToken = cookies['access_token'] || cookies['token'];
      }

      const token =
        client.handshake?.auth?.token ||
        client.handshake?.headers?.authorization?.split(' ')[1] ||
        cookieToken;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      client.data.userName = payload.name || payload.email || 'User';

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.data.userId})`,
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const workspaceId = client.data.currentWorkspaceId as string | undefined;
      this.activeUsers.delete(client.id);
      if (workspaceId) {
        this.broadcastPresence(workspaceId);
      }
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @SubscribeMessage('join-workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data?.workspaceId) {
      client.emit('error', { message: 'Unauthorized or missing workspaceId' });
      return;
    }

    // Verify user belongs to workspace
    const hasAccess = await this.prisma.workspace.findFirst({
      where: {
        id: data.workspaceId,
        isDeleted: false,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!hasAccess) {
      this.logger.warn(
        `User ${userId} attempted unauthorized join to workspace ${data.workspaceId}`,
      );
      client.emit('error', { message: 'Unauthorized access to workspace' });
      return;
    }

    // Leave previous workspace room if switching
    if (
      client.data.currentWorkspaceId &&
      client.data.currentWorkspaceId !== data.workspaceId
    ) {
      client.leave(`workspace:${client.data.currentWorkspaceId}`);
      this.broadcastPresence(client.data.currentWorkspaceId);
    }
    client.data.currentWorkspaceId = data.workspaceId;

    client.join(`workspace:${data.workspaceId}`);

    this.activeUsers.set(client.id, {
      userId: client.data.userId,
      userName: client.data.userName,
      workspaceId: data.workspaceId,
      lastSeen: new Date(),
    });

    this.broadcastPresence(data.workspaceId);
    this.logger.log(
      `User ${client.data.userId} joined workspace ${data.workspaceId}`,
    );
  }

  @SubscribeMessage('leave-workspace')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    client.leave(`workspace:${data.workspaceId}`);
    if (client.data.currentWorkspaceId === data.workspaceId) {
      client.data.currentWorkspaceId = undefined;
    }
    this.activeUsers.delete(client.id);
    this.broadcastPresence(data.workspaceId);
  }

  @SubscribeMessage('join-task')
  async handleJoinTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; workspaceId?: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data?.taskId) {
      client.emit('error', { message: 'Unauthorized or missing taskId' });
      return;
    }

    // Verify task belongs to a workspace accessible by the user
    const task = await this.prisma.task.findFirst({
      where: {
        id: data.taskId,
        project: {
          workspace: {
            isDeleted: false,
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
      },
      select: { id: true },
    });

    if (!task) {
      this.logger.warn(
        `User ${userId} attempted unauthorized join to task ${data.taskId}`,
      );
      client.emit('error', { message: 'Unauthorized access to task' });
      return;
    }

    // Leave previous task room if switching
    if (
      client.data.currentTaskId &&
      client.data.currentTaskId !== data.taskId
    ) {
      client.leave(`task:${client.data.currentTaskId}`);
      this.broadcastTaskPresence(client.data.currentTaskId);
    }
    client.data.currentTaskId = data.taskId;

    client.join(`task:${data.taskId}`);

    const presence = this.activeUsers.get(client.id);
    if (presence) {
      presence.taskId = data.taskId;
      presence.lastSeen = new Date();
      this.activeUsers.set(client.id, presence);
    }

    this.broadcastTaskPresence(data.taskId);
    this.logger.log(`User ${client.data.userId} viewing task ${data.taskId}`);
  }

  @SubscribeMessage('leave-task')
  handleLeaveTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    client.leave(`task:${data.taskId}`);
    if (client.data.currentTaskId === data.taskId) {
      client.data.currentTaskId = undefined;
    }

    const presence = this.activeUsers.get(client.id);
    if (presence) {
      presence.taskId = undefined;
      this.activeUsers.set(client.id, presence);
    }

    this.broadcastTaskPresence(data.taskId);
  }

  @UseGuards(WsThrottleGuard)
  @SubscribeMessage('task-update')
  handleTaskUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; changes: any; workspaceId: string },
  ) {
    // Only broadcast if client has joined this task room
    if (client.data.currentTaskId !== data.taskId) {
      client.emit('error', {
        message: 'Must join task before sending updates',
      });
      return;
    }

    // Broadcast to all users in the task room except sender
    client.to(`task:${data.taskId}`).emit('task-updated', {
      taskId: data.taskId,
      changes: data.changes,
      updatedBy: {
        userId: client.data.userId,
        userName: client.data.userName,
      },
      timestamp: new Date(),
    });

    this.logger.log(`Task ${data.taskId} updated by ${client.data.userId}`);
  }

  // Broadcast presence to a workspace room only; a server-wide emit would show
  // every online user (id, name, workspace) to every connected client.
  private broadcastPresence(workspaceId: string) {
    const users = Array.from(this.activeUsers.values()).filter(
      (u) => u.workspaceId === workspaceId,
    );

    this.server.to(`workspace:${workspaceId}`).emit('presence-update', users);
  }

  // Broadcast task-specific presence
  private broadcastTaskPresence(taskId: string) {
    const users = Array.from(this.activeUsers.values()).filter(
      (u) => u.taskId === taskId,
    );

    this.server.to(`task:${taskId}`).emit('task-presence', users);
  }

  // Public method to broadcast task changes from REST API
  broadcastTaskChange(taskId: string, changes: any, userId: string) {
    this.server.to(`task:${taskId}`).emit('task-updated', {
      taskId,
      changes,
      updatedBy: { userId },
      timestamp: new Date(),
    });
  }
}
