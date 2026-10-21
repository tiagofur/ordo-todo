# Ordo MCP Server (technical reference)

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo (ODD 001 — servidor MCP remoto)

Remote MCP server exposing Ordo to Claude, ChatGPT, Hermes, OpenClaw
and Cursor over Streamable HTTP with OAuth 2.1. A developer should be
able to connect a generic MCP client using only this document.

- ODD spec: `odd/tasks/001-mcp-server.md`
- Public REST sibling: `docs/reference/api-reference.md` (same
  contracts, same services underneath)
- Base URLs below assume the API host root (e.g. `https://api.ordo.test`).

## 📋 Índice rápido

- [Transport](#transport)
- [Authentication](#authentication)
- [Scopes and step-up](#scopes-and-step-up)
- [Tool catalog](#tool-catalog)
- [Permissions and audit](#permissions-and-audit)
- [Throttling](#throttling)
- [Connecting a generic client](#connecting-a-generic-client)
- [Errors](#errors)

---

## Transport

- **Endpoint**: `POST /mcp` (mounted outside the `api/v1` global
  prefix, like `/v1/*`)
- **Protocol**: JSON-RPC 2.0 over Streamable HTTP (MCP SDK
  `@modelcontextprotocol/sdk`, server `ordo-mcp`)
- **Mode**: stateless — every request gets a fresh transport
  (`sessionIdGenerator: undefined`), no session tracking, no SSE
  streams held open
- `GET /mcp` → `405` (stateless server: use POST for all requests)
- `DELETE /mcp` → `200 {ok: true}` (nothing to terminate server-side)

## Authentication

`POST /mcp` accepts either credential (checked in this order):

1. **OAuth access token** — JWT issued by `POST /api/v1/oauth/token`
   (`tokenType: oauth_access`, 1h TTL). Full flow in
   `docs/reference/api-reference.md` (register → authorize → exchange
   → refresh → revoke, userinfo).
2. **Personal access token** — `ordo_pat_...` created via
   `POST /api/v1/api-tokens` (secret shown once).

```http
Authorization: Bearer <oauth-jwt | ordo_pat_...>
```

Bearer in the `Authorization` header only — never in query params.
Missing/invalid/expired/revoked credentials → `401`.

Discovery (no auth required):

```bash
# Protected resource metadata (RFC 9728)
curl https://api.ordo.test/.well-known/oauth-protected-resource
# → {"resource": "https://api.ordo.test/mcp",
#     "authorization_servers": ["https://api.ordo.test"],
#     "scopes_supported": ["read", "tasks:write",
#       "projects:write", "admin:webhooks"],
#     "bearer_methods_supported": ["header"],
#     "resource_signing_alg_values_supported": ["HS256"]}

# Authorization server metadata (RFC 8414, from ODD 009)
curl https://api.ordo.test/api/v1/oauth/.well-known/oauth-authorization-server
```

## Scopes and step-up

Required scope per tool (see catalog below). Calling a tool without
its scope returns a tool error naming the missing scope:

```json
{ "error": "Tool ordo_task_create requires scope \"tasks:write\" (granted: read)",
  "missingScopes": ["tasks:write"] }
```

At the HTTP layer, insufficient scope returns `403` listing **every**
missing scope at once plus a step-up header, so clients upgrade in a
single round-trip:

```http
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope",
  scope="tasks:write projects:write"
```

Available scopes: `read`, `tasks:write`, `projects:write`,
`admin:webhooks` (same vocabulary as PATs and OAuth).

## Tool catalog

18 tools. Reads need `read`; mutations need the write scope shown.
All tools scope operations to the token owner (see Permissions).

| Tool | Scope | Arguments | Does |
| ---- | ----- | --------- | ---- |
| `ordo_ping` | `read` | — | Health check → `{ok: true}` |
| `ordo_search` | `read` | `query`*, `limit?` (1–50) | Semantic search across tasks, projects, habits |
| `ordo_task_list` | `read` | `projectId?` | List my tasks (+ optional project filter) |
| `ordo_task_create` | `tasks:write` | `title`*, `projectId`*, `description?`, `priority?`, `dueDate?` (ISO) | Create a task (owner forced to caller) |
| `ordo_task_get` | `read` | `id`* | Get a task by id |
| `ordo_task_update` | `tasks:write` | `id`*, `title?`, `description?`, `priority?` | Update a task I own |
| `ordo_task_complete` | `tasks:write` | `id`* | Mark a task completed |
| `ordo_project_list` | `read` | — | List my projects |
| `ordo_project_create` | `projects:write` | `name`*, `workspaceId`*, `description?` | Create a project |
| `ordo_project_get` | `read` | `id`* | Get a project by id |
| `ordo_project_update` | `projects:write` | `id`*, `name?`, `description?` | Update a project I own |
| `ordo_comment_add` | `tasks:write` | `taskId`*, `content`* | Comment on a task as the caller |
| `ordo_habit_today` | `read` | — | Today's habits + completion status |
| `ordo_habit_complete` | `tasks:write` | `id`*, `note?` | Complete a habit for today |
| `ordo_objective_progress` | `read` | — | Current OKR period summary |
| `ordo_me` | `read` | — | Token owner identity |
| `ordo_day_plan` | `read` | — | Today's plan: blocks, frozen tasks, pending changes, risk alerts |
| `ordo_day_plan_apply` | `tasks:write` | `proposalId`* | Apply a day-plan proposal onto my tasks |

Example `tools/call` (JSON-RPC over `POST /mcp`):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "ordo_task_create",
    "arguments": { "title": "Via agent", "projectId": "proj-1" }
  }
}
```

Results return `content: [{type: "text", text: "<json>"}]`;
failures return `isError: true` with `{error, ...}` JSON in the text.

## Permissions and audit

- **Inheritance**: tools delegate to the same `/v1` services as REST,
  so the agent sees/operates exactly what the token owner can.
  Cross-owner access surfaces as tool errors (`403`/`404`
  semantics) without leaking whether the resource exists
  (conformance-tested).
- **Guests**: there is no guest role in the membership model
  (`OWNER`/`ADMIN`/`MEMBER`/`VIEWER`) — every MCP caller is a full
  user resolved from its token; nothing extra to block.
- **Revoke**: revoking the PAT (`DELETE /api/v1/api-tokens/:id`) or
  the OAuth refresh token (`POST /api/v1/oauth/revoke`) makes
  subsequent MCP calls `401` immediately (validated per request,
  nothing cached).
- **Audit**: every successful mutating tool call
  (`ordo_task_create|update|complete`,
  `ordo_project_create|update`, `ordo_comment_add`,
  `ordo_habit_complete`, `ordo_day_plan_apply`) emits an `MCP_TOOL_CALL` audit event with
  `{tool}` metadata + user id. Reads are not logged (signal over
  noise).

## Throttling

Two layers, same as `/v1`:

1. **Per-token buckets** (`TokenRateLimitGuard` on `POST /mcp`):
   300 reads/min, 100 writes/min per PAT id / OAuth client (IP
   fallback). `429` with `Retry-After` + `X-RateLimit-*` headers.
2. **Global guard** (`CustomThrottleGuard`): unmatched routes fall
   through to the default 100 req/min behavior.

No per-tool limits beyond these buckets — documented here so the
absence is explicit, not an oversight.

## Connecting a generic client

With the TypeScript SDK (any MCP client works the same way):

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport(
  new URL('https://api.ordo.test/mcp'),
  {
    requestInit: {
      headers: { Authorization: `Bearer ${process.env.ORDO_PAT}` },
    },
  },
);

const client = new Client({ name: 'my-agent', version: '1.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(tools.map((t) => t.name)); // ordo_search, ordo_task_list, …

const created = await client.callTool({
  name: 'ordo_task_create',
  arguments: { title: 'Via agent', projectId: 'proj-1' },
});
```

For OAuth clients (Claude/ChatGPT/Hermes/OpenClaw): point the
connector at `https://api.ordo.test/mcp`; discovery via
`/.well-known/oauth-protected-resource` + the RFC 8414 metadata
provides the authorization server, scopes and bearer rules, ending
in the standard browser-approve flow. Per-client 1-click guides live
in ODD 002 (out of scope here).

## Errors

| Symptom | Meaning |
| ------- | ------- |
| HTTP `401` | Missing/invalid/expired/revoked token |
| HTTP `403` + `WWW-Authenticate: scope="…"` | Authenticated but missing scope(s); step up |
| HTTP `429` + `Retry-After` | Per-token bucket exhausted |
| Tool `isError: true` | Domain failure (`{error}` JSON, e.g. not found, forbidden, scope) |
| HTTP `405` on `GET /mcp` | Stateless server — use POST |
```

Check: a developer connects a generic MCP client using only this doc
(human review criterion).
