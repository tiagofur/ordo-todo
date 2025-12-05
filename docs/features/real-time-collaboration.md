# Real-Time Collaboration System

## Overview
The Real-Time Collaboration system enables multiple users to work together on tasks and projects simultaneously, with live presence indicators and instant updates using WebSocket technology.

## Architecture

### Backend Components

#### CollaborationGateway
Located at: `apps/backend/src/collaboration/collaboration.gateway.ts`

**Technology Stack:**
- `@nestjs/websockets`: NestJS WebSocket decorator support
- `@nestjs/platform-socket.io`: Socket.IO adapter for NestJS
- `socket.io`: Real-time bidirectional event-based communication

**Authentication:**
- JWT-based authentication on connection
- Token can be provided via:
  - `auth.token` in handshake
  - `Authorization` header (Bearer token)
- Unauthenticated connections are automatically rejected

### Features

#### 1. User Presence Tracking
**Purpose**: Show which users are currently active in a workspace or viewing a specific task.

**Events:**
- `join-workspace`: User enters a workspace
- `leave-workspace`: User leaves a workspace
- `presence-update`: Broadcast of active users

**Data Structure:**
```typescript
interface UserPresence {
  userId: string;
  userName: string;
  workspaceId: string;
  taskId?: string;
  lastSeen: Date;
}
```

#### 2. Task-Level Presence
**Purpose**: Track which users are currently viewing/editing a specific task.

**Events:**
- `join-task`: User opens a task
- `leave-task`: User closes a task
- `task-presence`: List of users viewing the task

**Use Cases:**
- Show "User X is viewing this task" indicator
- Prevent edit conflicts by showing who's editing
- Enable collaborative editing features

#### 3. Real-Time Task Updates
**Purpose**: Broadcast task changes to all connected users instantly.

**Events:**
- `task-update`: Client sends task changes
- `task-updated`: Server broadcasts changes to other users

**Payload:**
```typescript
{
  taskId: string;
  changes: any; // The actual changes made
  updatedBy: {
    userId: string;
    userName: string;
  };
  timestamp: Date;
}
```

**Flow:**
1. User A modifies a task
2. Client sends `task-update` event
3. Server broadcasts `task-updated` to all users in `task:${taskId}` room
4. Other clients receive update and refresh their UI

## Room Structure

### Workspace Rooms
- Format: `workspace:${workspaceId}`
- Purpose: Broadcast workspace-level events
- Members: All users currently in the workspace

### Task Rooms
- Format: `task:${taskId}`
- Purpose: Broadcast task-specific events
- Members: All users currently viewing the task

## Integration with REST API

The gateway exposes a public method for REST endpoints to broadcast changes:

```typescript
broadcastTaskChange(taskId: string, changes: any, userId: string)
```

**Usage Example:**
```typescript
// In TasksService
async updateTask(id: string, updateDto: UpdateTaskDto, userId: string) {
  const task = await this.prisma.task.update({
    where: { id },
    data: updateDto,
  });
  
  // Broadcast to WebSocket clients
  this.collaborationGateway.broadcastTaskChange(id, updateDto, userId);
  
  return task;
}
```

## Client Implementation Guide

### Connection Setup

```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3101', {
  auth: {
    token: 'your-jwt-token',
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to collaboration server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from collaboration server');
});
```

### Joining a Workspace

```typescript
socket.emit('join-workspace', { workspaceId: 'workspace-123' });

socket.on('presence-update', (users: UserPresence[]) => {
  console.log('Active users:', users);
  // Update UI to show active users
});
```

### Viewing a Task

```typescript
socket.emit('join-task', { 
  taskId: 'task-456',
  workspaceId: 'workspace-123'
});

socket.on('task-presence', (users: UserPresence[]) => {
  console.log('Users viewing this task:', users);
  // Show "User X is viewing" indicator
});

socket.on('task-updated', (update) => {
  console.log('Task updated by:', update.updatedBy);
  // Refresh task data or apply optimistic update
});
```

### Sending Task Updates

```typescript
socket.emit('task-update', {
  taskId: 'task-456',
  workspaceId: 'workspace-123',
  changes: {
    title: 'New title',
    status: 'IN_PROGRESS',
  },
});
```

### Cleanup

```typescript
// When leaving a task
socket.emit('leave-task', { taskId: 'task-456' });

// When leaving a workspace
socket.emit('leave-workspace', { workspaceId: 'workspace-123' });

// On component unmount
socket.disconnect();
```

## Security Considerations

### Authentication
- All connections require valid JWT token
- Token is verified on connection
- Invalid tokens result in immediate disconnection

### Authorization
- Users can only join workspaces they're members of (to be implemented)
- Task updates should verify user permissions (to be implemented)

### Rate Limiting
- Consider implementing rate limiting for events
- Prevent spam/abuse of broadcast events

## Performance Optimization

### Room Management
- Users automatically leave rooms on disconnect
- Presence data is cleaned up on disconnect
- Efficient room-based broadcasting (only to relevant users)

### Scalability
- Current implementation uses in-memory Map for presence
- For production, consider:
  - Redis adapter for multi-server deployments
  - Persistent storage for presence data
  - Message queue for event processing

## Monitoring and Debugging

### Logging
The gateway logs:
- Connection/disconnection events
- Room join/leave events
- Task update broadcasts

### Metrics to Track
- Number of active connections
- Number of users per workspace
- Event frequency
- Average latency

## Future Enhancements

### Conflict Resolution
- **Operational Transformation (OT)**: Transform concurrent operations
- **CRDT (Conflict-free Replicated Data Types)**: Automatic conflict resolution
- **Last-Write-Wins**: Simple but may lose data

### Advanced Features
- **Cursors**: Show where other users are editing
- **Selections**: Highlight what other users have selected
- **Comments**: Real-time comment threads
- **Undo/Redo**: Collaborative undo across users
- **Version History**: Track all changes with replay capability

### Offline Support
- Queue events when offline
- Sync on reconnection
- Conflict resolution for offline edits

## Testing

### Unit Tests
```typescript
describe('CollaborationGateway', () => {
  it('should authenticate users on connection', async () => {
    // Test JWT verification
  });
  
  it('should broadcast presence updates', () => {
    // Test presence broadcasting
  });
  
  it('should handle task updates', () => {
    // Test task update flow
  });
});
```

### Integration Tests
- Test with multiple concurrent connections
- Verify room isolation
- Test reconnection scenarios
- Verify cleanup on disconnect

## Troubleshooting

### Common Issues

**Connection Refused**
- Check if backend is running
- Verify CORS configuration
- Check firewall settings

**Authentication Failures**
- Verify JWT token is valid
- Check token expiration
- Ensure correct secret in backend

**Events Not Received**
- Verify user joined correct room
- Check event name spelling
- Inspect network tab for WebSocket frames

**Memory Leaks**
- Ensure proper cleanup on disconnect
- Remove event listeners when done
- Clear presence data for disconnected users
