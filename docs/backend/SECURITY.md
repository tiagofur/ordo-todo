# Backend Security Documentation

Comprehensive security implementation guide for Ordo-Todo backend.

## Current Security Stack

| Layer | Implementation | Status |
|-------|----------------|--------|
| Authentication | JWT + Passport.js | ✅ Active |
| Authorization | Role-based guards | ✅ Active |
| Rate Limiting | @nestjs/throttler | ✅ Active |
| Input Validation | class-validator | ✅ Active |
| HTTP Security | Helmet | ✅ Active |
| CORS | Configurable origins | ✅ Active |
| Password Hashing | bcrypt | ✅ Active |

## Authentication

### JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
```

### Token Configuration

```env
JWT_SECRET=your-strong-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

**Recommendations:**
- [ ] Reduce token expiry to 15-30 minutes
- [ ] Implement refresh token rotation
- [ ] Add token revocation list

## Authorization

### Guard Hierarchy

```
JwtAuthGuard (global)
  └── Validates token, extracts user
       │
       ▼
BaseResourceGuard
  └── Validates workspace membership
       │
       ├── WorkspaceGuard
       ├── ProjectGuard (validates via project's workspaceId)
       └── TaskGuard (validates via task's project's workspaceId)
```

### Code Example

```typescript
// common/guards/base-resource.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  if (!user) return false;

  const workspaceId = await this.getWorkspaceId(request);
  if (!workspaceId) return false;

  // Verify membership
  const membership = await this.prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: user.id },
    },
  });

  if (!membership) {
    throw new ForbiddenException('You are not a member of this workspace');
  }

  // Check roles if required
  const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()]
  );

  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    throw new ForbiddenException('Insufficient permissions');
  }

  return true;
}
```

## Rate Limiting

### Current Configuration (app.module.ts)

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000,   // 1 minute window
    limit: 100,    // 100 requests per minute
  },
]),
```

### Endpoint-Specific Limits

```typescript
// For sensitive endpoints like AI
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Post('ai/chat')
async chat() { ... }
```

**Recommendations:**
- [ ] Add stricter limits for auth endpoints (5 req/min)
- [ ] Add per-user limits for AI endpoints
- [ ] Implement exponential backoff for rate limit violations

## Input Validation

### Current Configuration (main.ts)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Reject requests with unknown properties
    transform: true,            // Auto-transform payloads
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### DTO Best Practices

```typescript
// tasks/dto/create-task.dto.ts
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
```

## HTTP Security (Helmet)

### Current Configuration (main.ts)

```typescript
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // For uploads
  }),
);
```

**Enabled by Default:**
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection

**Recommendations:**
- [ ] Configure strict CSP for API
- [ ] Add Referrer-Policy
- [ ] Add Permissions-Policy

## CORS Configuration

### Current Configuration (main.ts)

```typescript
const corsOrigins = configService.get<string>('CORS_ORIGINS')!.split(',');
app.enableCors({
  origin: corsOrigins,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization',
});
```

### Environment Variable

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://ordo-todo.com
```

### ⚠️ WebSocket CORS Issue

```typescript
// collaboration/collaboration.gateway.ts - NEEDS FIX
@WebSocketGateway({
  cors: {
    origin: '*',  // ⚠️ Should match REST CORS
    credentials: true,
  },
})
```

**Fix Required:**
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
```

## Password Security

### Current Implementation

```typescript
// auth/auth.service.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Data Isolation

### User Data Isolation

All queries include user context:

```typescript
// repositories/tasks.repository.ts
async findByUser(userId: string, options: QueryOptions) {
  return this.prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { project: { workspace: { members: { some: { userId } } } } }
      ],
      ...options.where,
    },
  });
}
```

### Workspace Isolation

Members only see their workspaces:

```typescript
// Always filter by membership
const workspaces = await this.prisma.workspace.findMany({
  where: {
    members: {
      some: { userId: user.id }
    }
  }
});
```

## Security Checklist

### ✅ Implemented

- [x] JWT authentication
- [x] Role-based authorization
- [x] Workspace membership validation
- [x] Input validation and sanitization
- [x] Rate limiting (global)
- [x] Password hashing (bcrypt)
- [x] Helmet security headers
- [x] CORS for REST API
- [x] Audit logging (WorkspaceAuditLog)

### 🔴 Needs Implementation

- [ ] WebSocket CORS restriction
- [ ] Refresh token rotation
- [ ] Token revocation
- [ ] API key support for integrations
- [ ] Request signing for webhooks
- [ ] IP allowlisting (optional)
- [ ] Enhanced audit logging

---

## Security Improvements Roadmap

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for planned security enhancements.
