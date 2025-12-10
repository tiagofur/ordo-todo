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

interface UserPresence {
  userId: string;
  userName: string;
  workspaceId: string;
  taskId?: string;
  lastSeen: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
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

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      client.data.userName = payload.name || payload.email;

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
      this.activeUsers.delete(client.id);
      this.broadcastPresence();
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @SubscribeMessage('join-workspace')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
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
    this.activeUsers.delete(client.id);
    this.broadcastPresence(data.workspaceId);
  }

  @SubscribeMessage('join-task')
  handleJoinTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; workspaceId: string },
  ) {
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

    const presence = this.activeUsers.get(client.id);
    if (presence) {
      presence.taskId = undefined;
      this.activeUsers.set(client.id, presence);
    }

    this.broadcastTaskPresence(data.taskId);
  }

  @SubscribeMessage('task-update')
  handleTaskUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string; changes: any; workspaceId: string },
  ) {
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

  // Broadcast presence to workspace
  private broadcastPresence(workspaceId?: string) {
    const users = Array.from(this.activeUsers.values()).filter(
      (u) => !workspaceId || u.workspaceId === workspaceId,
    );

    const room = workspaceId ? `workspace:${workspaceId}` : undefined;

    if (room) {
      this.server.to(room).emit('presence-update', users);
    } else {
      this.server.emit('presence-update', users);
    }
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
