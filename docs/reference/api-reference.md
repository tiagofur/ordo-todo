# Ordo Public API Reference (v1)

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo (ODD 009 — API pública v1 + webhooks)

Public, versioned API for operating Ordo from external agents and
integrations. Authenticate with a personal access token (PAT) or an
OAuth 2.1 access token; every call is scoped to the token owner.

- Interactive docs: `/api-docs` (Swagger, tag group "Public API v1")
- ODD spec: `odd/tasks/009-public-api-webhooks.md`
- Base URLs below assume the API host root (e.g. `https://api.ordo.test`).

## 📋 Índice rápido

- [Authentication](#authentication)
  - [Personal access tokens](#personal-access-tokens)
  - [OAuth 2.1](#oauth-21)
- [Rate limiting](#rate-limiting)
- [Tasks](#tasks)
- [Projects](#projects)
- [Comments](#comments)
- [Users](#users)
- [Webhooks](#webhooks)
- [Errors](#errors)

---

## Authentication

Every `/v1` request needs a bearer token:

```http
Authorization: Bearer ordo_pat_...
```

Tokens resolve `userId` server-side; the owner is never taken from the
request body. OAuth access tokens are JWTs (`tokenType: oauth_access`,
1h TTL) usable on the same endpoints.

### Personal access tokens

Managed with the session JWT (web login), **not** with a PAT:

```bash
# Create (the secret is returned ONLY here — store it)
curl -X POST https://api.ordo.test/api/v1/api-tokens \
  -H "Authorization: Bearer <session-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"name": "CI deploy", "scopes": ["read", "tasks:write"]}'

# → {"id": "…", "name": "CI deploy", "tokenPrefix": "a1b2c3d4",
#     "scopes": ["read", "tasks:write"], "token": "ordo_pat_…"}

# List (no secrets or hashes)
curl https://api.ordo.test/api/v1/api-tokens \
  -H "Authorization: Bearer <session-jwt>"

# Revoke (subsequent uses → 401)
curl -X DELETE https://api.ordo.test/api/v1/api-tokens/<id> \
  -H "Authorization: Bearer <session-jwt>" # → 204
```

Available scopes: `read`, `tasks:write`, `projects:write`,
`admin:webhooks`.

### OAuth 2.1

Authorization code flow with mandatory S256 PKCE. Server metadata:

```bash
curl https://api.ordo.test/api/v1/oauth/.well-known/oauth-authorization-server
```

1. **Register** the client (Client ID Metadata Document; DCR-compatible):

```bash
curl -X POST https://api.ordo.test/api/v1/oauth/register \
  -H "Content-Type: application/json" \
  -d '{"metadataUrl": "https://client.test/.well-known/oauth-client",
       "client_name": "Hermes",
       "redirect_uris": ["https://client.test/callback"],
       "scope": "read tasks:write"}'

# → {"client_id": "https://client.test", …}
# `client_id` is derived from the metadata URL origin.
```

2. **Authorize** (logged-in user approves in the browser):

```text
GET /api/v1/oauth/authorize?client_id=https://client.test
  &redirect_uri=https://client.test/callback
  &scope=read&state=xyz
  &code_challenge=<S256>&code_challenge_method=S256
→ 302 https://client.test/callback?code=<single-use>&state=xyz
```

3. **Exchange** the code for tokens:

```bash
curl -X POST https://api.ordo.test/api/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type": "authorization_code", "code": "<code>",
       "client_id": "https://client.test",
       "redirect_uri": "https://client.test/callback",
       "code_verifier": "<verifier>"}'

# → {"access_token": "<jwt>", "token_type": "Bearer",
#     "expires_in": 3600, "refresh_token": "ordo_rt_…", "scope": "read"}
```

4. **Refresh** (rotation — each use returns a NEW refresh token):

```bash
curl -X POST https://api.ordo.test/api/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type": "refresh_token",
       "refresh_token": "ordo_rt_…",
       "client_id": "https://client.test"}'
```

5. **Revoke** a refresh token (RFC 7009):

```bash
curl -X POST https://api.ordo.test/api/v1/oauth/revoke \
  -H "Content-Type: application/json" \
  -d '{"token": "ordo_rt_…", "client_id": "https://client.test"}'
```

6. **Userinfo** with the access token:

```bash
curl https://api.ordo.test/api/v1/oauth/userinfo \
  -H "Authorization: Bearer <access-jwt>"
# → {"sub": "user-123", "email": "…", "name": "…"}
```

## Rate limiting

Per-token buckets, separate for reads and writes:

| Bucket          | Limit     | Window |
| --------------- | --------- | ------ |
| Reads (GET)     | 300 / min | 60 s   |
| Writes (others) | 100 / min | 60 s   |

Responses carry `X-RateLimit-Limit` and `X-RateLimit-Remaining`.
Exceeding a bucket returns `429` with a `Retry-After` header (seconds).

## Tasks

Stable subset of the internal task API, scoped to the token owner.

```bash
API=https://api.ordo.test
AUTH="Authorization: Bearer ordo_pat_…"

# List (filters: projectId, tags, assignedToMe)
curl "$API/v1/tasks?projectId=proj-1" -H "$AUTH"

# Get one
curl "$API/v1/tasks/task-1" -H "$AUTH"

# Create (owner is forced to the token owner)
curl -X POST "$API/v1/tasks" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"title": "Via API", "projectId": "proj-1", "priority": "HIGH"}'
# → 201

# Update (owner only)
curl -X PATCH "$API/v1/tasks/task-1" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"title": "Renamed"}'

# Delete (owner only)
curl -X DELETE "$API/v1/tasks/task-1" -H "$AUTH" # → 204
```

## Projects

```bash
curl "$API/v1/projects" -H "$AUTH"
curl "$API/v1/projects/proj-1" -H "$AUTH"

curl -X POST "$API/v1/projects" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name": "Website", "workspaceId": "ws-1"}'
# → 201

curl -X PATCH "$API/v1/projects/proj-1" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name": "Website v2"}'

curl -X DELETE "$API/v1/projects/proj-1" -H "$AUTH" # → 204
```

Updates and deletes require project ownership (`403` otherwise).

## Comments

```bash
# Add a comment (token owner becomes the author)
curl -X POST "$API/v1/comments" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"taskId": "task-1", "content": "Shipped from CI"}'
# → 201

# List comments of a task
curl "$API/v1/comments/task/task-1" -H "$AUTH"
```

Task access is enforced by the underlying service.

## Users

```bash
# Who owns this token (S1 round-trip check)
curl "$API/v1/users/me" -H "$AUTH"
# → includes at least: {"id": "user-123", "email": "…",
#     "username": "…", "name": "…"}
```

## Webhooks

Subscribe to events; Ordo POSTs signed JSON to your URL.

```bash
# Subscribe (https only; secret returned once)
curl -X POST "$API/v1/webhooks" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://receiver.test/hooks/ordo",
       "events": ["task.created", "task.completed"]}'
# → 201 {"id": "sub-1", "secret": "ordo_whsec_…", …}

# List (no secrets)
curl "$API/v1/webhooks" -H "$AUTH"

# Delete
curl -X DELETE "$API/v1/webhooks/sub-1" -H "$AUTH" # → 204

# Deliveries of a subscription
curl "$API/v1/webhooks/sub-1/deliveries" -H "$AUTH"

# Redeliver a failed delivery
curl -X POST "$API/v1/webhooks/deliveries/del-1/redeliver" -H "$AUTH"
```

Available events: `task.created`, `task.updated`, `task.completed`,
`task.deleted`, `project.created`, `project.updated`, `comment.created`.

### Verifying signatures

Each delivery sends `ordo-signature` (hex HMAC-SHA256 over
`{timestamp}.{raw-body}` with your secret) and `ordo-timestamp`
(unix seconds):

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

function verifyWebhook(
  secret: string,
  timestamp: string,
  rawBody: string,
  signature: string,
): boolean {
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
```

Reject deliveries older than ~5 minutes on your side to prevent replay
attacks (Ordo does not expire deliveries server-side).
Failed deliveries retry automatically with exponential backoff (up to
8 attempts); use the redeliver endpoint for manual retries.

## Errors

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| 400    | Invalid input, unknown scope/event, bad PKCE   |
| 401    | Missing, invalid, expired or revoked token     |
| 403    | Authenticated but not the resource owner       |
| 404    | Unknown id (or resource of another user)       |
| 429    | Rate limit exceeded (see `Retry-After`)        |

Error bodies follow the standard shape:

```json
{
  "statusCode": 401,
  "message": "Invalid or revoked API token"
}
```
