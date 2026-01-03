# Backend Improvements Roadmap

Comprehensive guide for enhancing Ordo-Todo backend to enterprise-grade quality.

**Last Updated:** 2 de Enero de 2025

---

## 📚 Documentación Relacionada

- **[AUDITORIA-2025-01-02.md](./AUDITORIA-2025-01-02.md)** - Auditoría completa de calidad (Enero 2025)
- **[AUDITORIA-RESUMEN-EJECUTIVO.md](./AUDITORIA-RESUMEN-EJECUTIVO.md)** - Resumen ejecutivo con métricas
- **[ROADMAP-MEJORAS-2025.md](./ROADMAP-MEJORAS-2025.md)** - Roadmap detallado por fases (32 tareas)

---

## 🎯 Estado Actual

**Calificación General**: 7/10 ⚠️

**Problemas Críticos Identificados**:

1. 🔴 Testing Coverage muy baja (~16% vs 80% esperado)
2. 🔴 Uso excesivo de `any` type (80 ocurrencias)
3. 🔴 Bypass del patrón Repository (100+ llamadas directas a Prisma)
4. 🟡 Validaciones manuales en controladores
5. 🟡 Lógica de side-effect en guards

---

---

## Overview

This document outlines all planned improvements organized by phase. Each section provides clear requirements, implementation details, and testing guidance for developers or AI agents.

---

## Phase 1: Security Hardening

### 1.1 Fix WebSocket CORS

**File:** `src/collaboration/collaboration.gateway.ts`

**Current Code (Line 22-27):**

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',  // ⚠️ SECURITY ISSUE
    credentials: true,
  },
})
```

**Required Change:**

```typescript
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
})
```

**Test:**

```bash
# Should fail from unauthorized origin
wscat -c "ws://localhost:3101" -H "Origin: http://malicious-site.com"
```

---

### 1.2 Add WebSocket Rate Limiting

**New File:** `src/common/guards/ws-throttle.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsThrottleGuard implements CanActivate {
  private connections = new Map<string, { count: number; resetAt: number }>();
  private readonly limit = 50; // 50 messages per minute
  private readonly ttl = 60000;

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const userId = client.data?.userId || client.id;

    const now = Date.now();
    const record = this.connections.get(userId);

    if (!record || now > record.resetAt) {
      this.connections.set(userId, { count: 1, resetAt: now + this.ttl });
      return true;
    }

    if (record.count >= this.limit) {
      throw new WsException("Rate limit exceeded");
    }

    record.count++;
    return true;
  }
}
```

**Apply to Gateway:**

```typescript
@UseGuards(WsThrottleGuard)
@SubscribeMessage('task-update')
handleTaskUpdate(...) { }
```

---

### 1.3 Enhanced Audit Logging

**Modify:** `src/common/interceptors/audit.interceptor.ts`

Add interceptor to log sensitive operations:

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    // Log only mutations
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return next.handle().pipe(
        tap(() => {
          this.logAction(user?.id, method, url, ip);
        }),
      );
    }

    return next.handle();
  }
}
```

---

## Phase 2: Google AI SDK Migration

### 2.1 Update Package

**File:** `package.json`

```diff
- "@google/generative-ai": "^0.24.1",
+ "@google/genai": "^1.0.0",
```

**Command:**

```bash
cd apps/backend
npm uninstall @google/generative-ai
npm install @google/genai
```

---

### 2.2 Update GeminiAIService

**File:** `src/ai/gemini-ai.service.ts`

**Before:**

```typescript
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

@Injectable()
export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private flashModel: GenerativeModel;
  private proModel: GenerativeModel;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.flashModel = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    this.proModel = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });
  }
}
```

**After (using @google/genai):**

```typescript
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class GeminiAIService {
  private genAI: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    this.genAI = new GoogleGenAI({ apiKey });
  }

  private async generateContent(model: string, prompt: string) {
    const response = await this.genAI.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  }

  // For streaming
  private async *streamContent(model: string, prompt: string) {
    const stream = await this.genAI.models.generateContentStream({
      model,
      contents: prompt,
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
}
```

**Models to Use:**

- `gemini-2.0-flash` - Default for most operations
- `gemini-2.0-flash-thinking-exp` - Complex analysis (replaces Pro)

---

## Phase 3: AI Productivity Chat

### 3.1 Database Schema

**File:** `packages/db/prisma/schema.prisma`

Add after existing models:

```prisma
// ============ AI CHAT ============

model ChatConversation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String?  // Auto-generated from first message
  context   Json?    // Workspace/project context snapshot

  messages  ChatMessage[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}

model ChatMessage {
  id             String   @id @default(cuid())
  conversationId String
  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  role      String   // 'user' | 'assistant' | 'system'
  content   String   @db.Text
  metadata  Json?    // Actions taken, suggestions, confidence

  createdAt DateTime @default(now())

  @@index([conversationId])
}
```

**Add User relation:**

```prisma
model User {
  // ... existing fields
  chatConversations ChatConversation[]
}
```

**Run migration:**

```bash
cd packages/db
npx prisma migrate dev --name add_chat_conversations
```

---

### 3.2 Chat Module Structure

Create the following files:

```
src/chat/
├── chat.module.ts
├── chat.controller.ts
├── chat.service.ts
├── chat.gateway.ts          # WebSocket for streaming
├── dto/
│   ├── create-conversation.dto.ts
│   ├── send-message.dto.ts
│   └── chat-response.dto.ts
└── repositories/
    └── chat.repository.ts
```

---

### 3.3 Chat Controller

**File:** `src/chat/chat.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ChatService } from "./chat.service";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // List conversations
  @Get("conversations")
  getConversations(
    @CurrentUser() user: RequestUser,
    @Query("limit") limit?: number,
    @Query("offset") offset?: number,
  ) {
    return this.chatService.getConversations(user.id, { limit, offset });
  }

  // Get single conversation with messages
  @Get("conversations/:id")
  getConversation(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.chatService.getConversation(id, user.id);
  }

  // Create new conversation
  @Post("conversations")
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.createConversation(user.id, dto);
  }

  // Send message (returns AI response)
  @Post("conversations/:id/messages")
  sendMessage(
    @Param("id") conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.sendMessage(conversationId, user.id, dto);
  }

  // Delete conversation
  @Delete("conversations/:id")
  deleteConversation(
    @Param("id") id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chatService.deleteConversation(id, user.id);
  }
}
```

---

### 3.4 Productivity Coach Service

**File:** `src/ai/productivity-coach.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { GeminiAIService } from "./gemini-ai.service";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ProductivityCoachService {
  constructor(
    private readonly gemini: GeminiAIService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Build context for AI prompt including user's tasks, timers, performance
   */
  async buildContext(userId: string) {
    const [pendingTasks, todayCompleted, activeTimer, timerStats, profile] =
      await Promise.all([
        this.getPendingTasks(userId),
        this.getTodayCompleted(userId),
        this.getActiveTimer(userId),
        this.getTimerStats(userId),
        this.getProductivityProfile(userId),
      ]);

    return {
      pendingTasks,
      todayCompleted,
      activeTimer,
      timerStats,
      profile,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate coach response with context awareness
   */
  async chat(userId: string, message: string, conversationHistory: any[]) {
    const context = await this.buildContext(userId);

    const systemPrompt = this.buildSystemPrompt(context);

    return this.gemini.chat(message, conversationHistory, {
      systemPrompt,
      context,
    });
  }

  private buildSystemPrompt(context: any): string {
    return `Eres un coach de productividad personal para Ordo-Todo.

CONTEXTO DEL USUARIO:
- Tareas pendientes: ${context.pendingTasks.length}
- Completadas hoy: ${context.todayCompleted.length}
- Timer activo: ${context.activeTimer ? "Sí, trabajando en " + context.activeTimer.taskTitle : "No"}
- Horas trabajadas esta semana: ${context.timerStats.weeklyHours}
- Horas pico: ${context.profile.peakHours?.join(", ") || "No determinadas"}
- Tasa de completado: ${Math.round(context.profile.completionRate * 100)}%

TUS CAPACIDADES:
1. Responder preguntas sobre las tareas del usuario
2. Dar tips para cumplir tareas específicas
3. Sugerir cómo descomponer tareas complejas
4. Analizar patrones de productividad
5. Recomendar tiempos óptimos para ciertas tareas
6. Dar consejos sobre Pomodoro/descansos
7. Motivar y celebrar logros

REGLAS:
- Sé conciso pero amigable
- Usa los datos del contexto para personalizar respuestas
- Si sugieresmejoras, sé específico
- Responde en español
- Si el usuario pide crear/modificar tareas, devuelve la acción en JSON`;
  }

  private async getPendingTasks(userId: string) {
    return this.prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assigneeId: userId }],
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        priority: true,
        dueDate: true,
        estimatedMinutes: true,
      },
    });
  }

  // ... other helper methods
}
```

---

## Phase 4: Real-Time Notifications Gateway

### 4.1 Notifications Gateway

**File:** `src/notifications/notifications.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ namespace: "notifications" })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;

      // Track user's sockets
      const userSockets = this.userSockets.get(payload.sub) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(payload.sub, userSockets);

      // Join user's room
      client.join(`user:${payload.sub}`);
      this.logger.log(`User ${payload.sub} connected to notifications`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  // Called by NotificationsService when creating notification
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }

  // Called by SmartNotificationsService for reminders
  sendReminder(userId: string, reminder: any) {
    this.server.to(`user:${userId}`).emit("task:reminder", reminder);
  }

  // Called by TimersService for timer alerts
  sendTimerAlert(userId: string, alert: any) {
    this.server.to(`user:${userId}`).emit("timer:alert", alert);
  }

  // Called by ProductivityCoachService for proactive insights
  sendInsight(userId: string, insight: any) {
    this.server.to(`user:${userId}`).emit("ai:insight", insight);
  }
}
```

---

### 4.2 Integrate with Existing Services

**Modify:** `src/notifications/notifications.service.ts`

```typescript
@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway, // Add injection
  ) {}

  async create(data: CreateNotificationData) {
    const notification = await this.prisma.notification.create({ data });

    // Push real-time notification
    this.gateway.sendNotification(data.userId, notification);

    return notification;
  }
}
```

---

## Phase 5: New API Endpoints

### 5.1 AI Coach Endpoints

**Add to:** `src/ai/ai.controller.ts`

```typescript
// ============ PRODUCTIVITY COACH ============

@Post('coach/chat')
async coachChat(
  @Body() dto: AIChatDto,
  @CurrentUser() user: RequestUser,
) {
  return this.productivityCoach.chat(user.id, dto.message, dto.history);
}

@Post('decompose-task')
async decomposeTask(
  @Body() dto: { taskId: string; complexity?: string },
  @CurrentUser() user: RequestUser,
) {
  return this.aiService.decomposeTask(user.id, dto.taskId, dto.complexity);
}

@Get('insights')
async getProactiveInsights(@CurrentUser() user: RequestUser) {
  return this.productivityCoach.getProactiveInsights(user.id);
}
```

---

## Phase 6: Testing Plan

### 6.1 E2E Tests

**Create:** `test/chat.e2e-spec.ts`

```typescript
describe("Chat (e2e)", () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password" });
    authToken = response.body.accessToken;
  });

  it("should create conversation", async () => {
    const response = await request(app.getHttpServer())
      .post("/chat/conversations")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "Hello coach" })
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.messages).toHaveLength(2); // User + Assistant
  });

  it("should not access other user conversations", async () => {
    // Create conversation as user A
    // Try to access as user B
    // Expect 404
  });
});
```

---

## Verification Commands

```bash
# Run all backend tests
cd apps/backend
npm run test

# Run e2e tests
npm run test:e2e

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Start in dev mode
npm run start:dev
```

---

## Implementation Order

1. **Phase 1.1** - Fix WebSocket CORS (Critical security)
2. **Phase 2** - SDK migration (Required for new features)
3. **Phase 3.1** - Database schema (Foundation)
4. **Phase 4** - Notifications gateway (Quick win)
5. **Phase 3.2-3.4** - Chat module (Main feature)
6. **Phase 5** - New endpoints
7. **Phase 6** - Testing

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security implementation
- [ai-features.md](./ai-features.md) - AI capabilities
- [README.md](./README.md) - API reference
