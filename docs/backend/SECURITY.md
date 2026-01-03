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

### Implementation Status: ✅ Complete (Updated 2026-01-03)

**File:** `common/guards/throttle.guard.ts`

Custom rate limiting fully implemented with route-based limits.

### CustomThrottleGuard Implementation

```typescript
@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = request.route?.path || request.url;

    // Get route-specific limit
    const rateLimit = this.getRateLimitForRoute(route, request.method);

    if (rateLimit !== null) {
      return this.applyRateLimit(request, rateLimit);
    }

    // Fall back to default NestJS behavior
    return super.canActivate(context);
  }

  private getRateLimitForRoute(route: string, method: string) {
    if (route.includes('/auth/register')) {
      return { limit: 3, ttl: 60000, message: 'Too many registration attempts' };
    }
    if (route.includes('/auth/login')) {
      return { limit: 5, ttl: 60000, message: 'Too many login attempts' };
    }
    // ... more routes
  }
}
```

### Endpoint-Specific Limits

| Endpoint | Limit | TTL | Message | Reason |
|----------|-------|-----|---------|--------|
| POST /auth/register | 3 | 60s | Too many registration attempts. Please try again later. | Prevent automated account creation |
| POST /auth/login | 5 | 60s | Too many login attempts. Please try again later. | Prevent brute force |
| POST /auth/refresh | 10 | 60s | Too many refresh token requests. Please try again later. | Limit token refresh abuse |
| POST /timers/start | 5 | 10s | Too many timer actions. Please slow down. | Prevent timer manipulation |
| POST /timers/stop | 5 | 10s | Too many timer actions. Please slow down. | Prevent timer manipulation |
| Default | 100 | 60s | Rate limit exceeded | General API usage |

### Testing Rate Limiting

```bash
# Test login rate limiting (should fail after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3101/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# Expected: HTTP 429 after 5 attempts
```

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

**Updated:** 2026-01-03 - Comprehensive security headers implemented

```typescript
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resource sharing for uploads
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled-components
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'no-referrer' },
    permittedCrossDomainPolicies: false,
    hidePoweredBy: true,
    ieNoOpen: true,
    frameguard: { action: 'deny' },
  }),
);
```

### Security Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| **Content-Security-Policy** | default-src 'self' | Prevents XSS by whitelisting sources |
| **Strict-Transport-Security** | max-age=31536000; includeSubDomains; preload | Enforces HTTPS for 1 year |
| **X-Content-Type-Options** | nosniff | Prevents MIME type sniffing |
| **X-Frame-Options** | DENY | Prevents clickjacking |
| **X-XSS-Protection** | 1; mode=block | Enables XSS filter |
| **Referrer-Policy** | no-referrer | Controls referrer sharing |
| **X-Download-Options** | noopen | Prevents opening downloads directly |
| **X-Powered-By** | (hidden) | Hides server technology |

### Content-Security-Policy (CSP)

**Directives:**
```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  media-src 'self';
  frame-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

**Purpose:**
- Restricts sources for scripts, styles, images, fonts
- Prevents XSS attacks by whitelisting trusted domains
- `unsafe-inline` allows styled-components

### HSTS (Strict-Transport-Security)

**Configuration:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Purpose:**
- Enforces HTTPS for 1 year
- Applies to all subdomains
- Browser preload list eligible

**Browser Behavior:**
1. First HTTPS visit → Browser stores HSTS policy
2. Future HTTP requests → Auto-upgraded to HTTPS
3. Policy persists for max-age duration

### Testing Headers

```bash
# Check security headers
curl -I http://localhost:3101/api/v1/health | grep -i "x-\|content-\|strict-"

# Expected output:
# x-content-type-options: nosniff
# x-frame-options: DENY
# x-xss-protection: 1; mode=block
# content-security-policy: default-src 'self'...
# strict-transport-security: max-age=31536000; includeSubDomains; preload
```

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

### Implementation Status: ✅ Complete (Updated 2026-01-03)

**Files:** `auth/crypto/bcrypt-crypto.provider.ts`, `auth/dto/register.dto.ts`

### Password Hashing

```typescript
// auth/crypto/bcrypt-crypto.provider.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Complexity Validation

**File:** `auth/dto/register.dto.ts`

```typescript
export class RegisterDto {
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/^(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/^(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/^(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least one special character (@$!%*?&)',
  })
  password: string;
}
```

### Validation Rules

| Requirement | Value | Error Message |
|-------------|-------|---------------|
| Minimum length | 12 characters | Password must be at least 12 characters long |
| Maximum length | 100 characters | Password must be less than 100 characters |
| Lowercase letter | At least 1 | Password must contain at least one lowercase letter |
| Uppercase letter | At least 1 | Password must contain at least one uppercase letter |
| Number | At least 1 | Password must contain at least one number |
| Special character | At least 1 (@$!%*?&) | Password must contain at least one special character (@$!%*?&) |

### Example Passwords

**Valid:**
- `SecurePass123!`
- `MyStr0ng@Password`
- `CorrectH0rse$Battery`

**Invalid:**
- `password` - No uppercase, number, or special character
- `Password1` - Too short (only 9 characters)
- `PASSWORD123!` - No lowercase letter

## JWT Token Blacklist

### Implementation Status: ✅ Complete (Updated 2026-01-03)

**Files:**
- `auth/token-blacklist.service.ts` - Blacklist service
- `auth/auth.service.ts` - Logout method
- `auth/strategies/jwt.strategy.ts` - Blacklist validation
- `auth/auth.controller.ts` - Logout endpoint

### Architecture

The token blacklist system prevents JWT token reuse after logout:

```typescript
// 1. User logs out → Token is blacklisted
POST /auth/logout
Authorization: Bearer <access_token>

// 2. Token added to blacklist
await tokenBlacklistService.blacklist(accessToken);

// 3. Future requests with blacklisted token are rejected
if (await tokenBlacklistService.isBlacklisted(token)) {
  throw new UnauthorizedException('Token has been revoked');
}
```

### TokenBlacklistService

```typescript
@Injectable()
export class TokenBlacklistService {
  private readonly blacklist = new Set<string>();

  async blacklist(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token);
    const jti = decoded.jti || token;
    const exp = decoded.exp;

    if (exp && new Date(exp * 1000) > new Date()) {
      this.blacklist.add(jti);

      // Auto-cleanup after expiration
      const ttl = (exp * 1000) - Date.now();
      setTimeout(() => this.blacklist.delete(jti), ttl);
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const decoded = this.jwtService.decode(token);
    const jti = decoded.jti || token;
    return this.blacklist.has(jti);
  }
}
```

### JWT Strategy Integration

```typescript
// auth/strategies/jwt.strategy.ts
async validate(payload: any) {
  const token = this.request?.get('authorization')?.replace('Bearer ', '');

  // Check if token is blacklisted
  if (token && await this.tokenBlacklistService.isBlacklisted(token)) {
    throw new UnauthorizedException('Token has been revoked');
  }

  const user = await this.authService.validateUser(payload.email);
  return { id: payload.sub, email: payload.email, name: payload.name };
}
```

### Logout Endpoint

```typescript
// auth/auth.controller.ts
@Post('logout')
async logout(@CurrentUser() user: any, @Req() req: Request) {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (token) {
    await this.authService.logout(token);
  }

  return { message: 'Logout successful' };
}
```

### Production Considerations

**Current Implementation:**
- In-memory Set (suitable for single-instance deployments)
- Auto-expires tokens based on JWT expiration time
- Automatic cleanup after expiration

**For Production Scaling:**
- Migrate to Redis for multi-instance deployments
- Add persistent storage for audit trails
- Implement distributed cache invalidation

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

### ✅ Implemented (Updated 2026-01-03)

**Authentication & Authorization:**
- [x] JWT authentication
- [x] Role-based authorization
- [x] Workspace membership validation
- [x] **JWT token blacklist** (NEW)
- [x] **Token revocation on logout** (NEW)

**Input Validation & Sanitization:**
- [x] Global validation pipe
- [x] DTO-based validation
- [x] **Password complexity validation** (NEW)
  - Min 12 characters
  - Uppercase + lowercase + number + special character

**Rate Limiting:**
- [x] **Custom route-based rate limiting** (NEW)
  - Auth endpoints: 3-10 req/min
  - Timer endpoints: 5 req/10s
  - Default: 100 req/min
- [x] Global rate limiting

**HTTP Security:**
- [x] **Comprehensive Helmet headers** (NEW)
  - Content-Security-Policy
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - And more...
- [x] CORS for REST API
- [x] **WebSocket CORS with dynamic origins** (NEW)

**Other Security Measures:**
- [x] Password hashing (bcrypt, salt rounds: 10)
- [x] Audit logging (WorkspaceAuditLog)

### 🔴 Needs Implementation

- [ ] API key support for integrations
- [ ] Request signing for webhooks
- [ ] IP allowlisting (optional)
- [ ] Enhanced audit logging
- [ ] Redis-based token blacklist for scaling

---

## Security Improvements Roadmap

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for planned security enhancements.
