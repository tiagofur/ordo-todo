# CSRF Protection and Rate Limiting

## CSRF Protection

### Why CSRF is NOT Implemented

This backend uses **JWT (JSON Web Tokens)** for authentication, stored in `localStorage` on the client. CSRF (Cross-Site Request Forgery) protection is **NOT required** for this architecture because:

1. **JWT in localStorage**: JWT tokens are stored in browser localStorage, not in cookies
2. **No automatic credential sending**: Browsers don't automatically send localStorage data with requests
3. **Explicit Authorization header**: JWT must be explicitly added to `Authorization: Bearer <token>` header
4. **Same-Origin Policy**: Browser's Same-Origin Policy prevents other sites from reading localStorage

### When CSRF Protection IS Needed

CSRF protection is needed when using:
- Cookie-based authentication (session cookies)
- Automatic cookie sending with requests
- Traditional server-side rendered apps

### What We Use Instead

Instead of CSRF tokens, we use:

1. **JWT Authentication** (`Authorization: Bearer <token>`)
   - Tokens stored in localStorage
   - Explicitly sent in Authorization header
   - Cannot be automatically sent by browser

2. **Rate Limiting** (see below)
   - Prevents brute force attacks
   - Prevents API abuse
   - Per-IP and per-user limits

## Rate Limiting

### Implementation

We use `@nestjs/throttler` with a custom `CustomThrottleGuard` for rate limiting:

```typescript
// app.module.ts
{
  provide: APP_GUARD,
  useClass: CustomThrottleGuard,
}
```

### Rate Limits by Endpoint

| Endpoint | Limit | TTL | Purpose |
|----------|-------|-----|---------|
| `POST /auth/register` | 3 req/min | 60s | Prevent automated account creation |
| `POST /auth/login` | 5 req/min | 60s | Prevent brute force password attacks |
| `POST /auth/refresh` | 10 req/min | 60s | Prevent token refresh abuse |
| `POST /timers/start` | 5 req/10s | 10s | Prevent timer manipulation |
| `POST /timers/stop` | 5 req/10s | 10s | Prevent timer manipulation |
| **Other endpoints** | **100 req/min** | **60s** | Default limit |

### Custom Rate Limits

You can add custom rate limits in `CustomThrottleGuard.getRateLimitForRoute()`:

```typescript
if (route.includes('/your-endpoint')) {
  return {
    limit: 10,
    ttl: 60000, // 1 minute
    message: 'Too many requests. Please try again later.',
  };
}
```

### Skip Rate Limiting

To skip rate limiting for a specific endpoint:

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Post()
@SkipThrottle()
async sensitiveOperation() {
  // No rate limiting
}
```

### Response

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests"
}
```

## Security Best Practices

### For JWT Authentication (Our Current Setup)

✅ **DO:**
- Use JWT in localStorage
- Send JWT in Authorization header
- Implement rate limiting
- Use short-lived access tokens (1h)
- Use refresh tokens for long-term sessions
- Implement token blacklist on logout
- Validate JWT signature and expiration

❌ **DON'T:**
- Store JWT in cookies without HttpOnly
- Send JWT in URL parameters
- Use long-lived JWT without refresh mechanism
- Forget to implement rate limiting
- Expose sensitive data in JWT payload

### For Cookie-Based Authentication (If We Switch)

If we ever switch to cookie-based auth, we MUST implement:

1. **CSRF Tokens**: Generate and validate CSRF tokens for state-changing operations
2. **SameSite Cookies**: Set `SameSite=strict` or `SameSite=lax` on cookies
3. **HttpOnly Cookies**: Set `HttpOnly=true` to prevent XSS access
4. **Secure Flag**: Set `Secure=true` (HTTPS only) in production

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Rate_Limiting_Cheat_Sheet.html)
- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [JWT vs CSRF](https://stackoverflow.com/questions/27358918/csrf-protection-for-json-web-tokens)

## Conclusion

For our JWT-based SPA architecture:
- ✅ **CSRF tokens**: NOT NEEDED
- ✅ **Rate limiting**: IMPLEMENTED AND WORKING
- ✅ **JWT blacklist**: IMPLEMENTED WITH REDIS
- ✅ **Token refresh**: IMPLEMENTED
- ✅ **Short-lived tokens**: CONFIGURED (1h access token)
