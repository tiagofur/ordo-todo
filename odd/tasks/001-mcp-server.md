# ODD: Servidor MCP remoto OAuth-first

Objective: exponer Ordo como servidor MCP remoto (Streamable HTTP) con OAuth 2.1, espejo del patrón Notion/Slack, para que Claude, ChatGPT, Hermes, OpenClaw y Cursor operen Ordo sin configuración manual.
Branch: `feature/mcp-server` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; slices encadenados si >400 (chained-pr); squash and merge; cobertura ≥70%.
Test runner: Jest (backend).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (completo — es la spec conceptual)
- `odd/tasks/009-public-api-webhooks.md` (leer hasta `## Log` — OAuth AS y `/v1` que este doc reutiliza)
- `apps/backend/src/search/search.controller.ts:32,141,205,253` (endpoints de búsqueda a exponer)
- `apps/backend/src/tasks/tasks.controller.ts` (operaciones de tareas a exponer)
- `apps/backend/src/meetings/meetings.controller.ts:75-485` (alcance meetings, si se expone)

## Specs

S1. **Transporte**: JSON-RPC 2.0 sobre Streamable HTTP (POST + SSE opcional) en `/mcp`; sin STDIO en servidor; stateless con `server/discover`; notificaciones opt-in. Check: handshake + `tools/list` + `tools/call` contra cliente del SDK oficial MCP.
S2. **Auth OAuth-first**: reutiliza el AS de 009; Protected Resource Metadata RFC 9728 en `/.well-known/oauth-protected-resource`; scopes mínimos primero (`WWW-Authenticate: scope=`), resto por step-up; 403 `insufficient_scope` con todos los faltantes a la vez; `resource` RFC 8707 obligatorio, audience validada, PKCE, Bearer solo en header. Check: token sin scope → 403 con lista completa de faltantes; flujo browser-approve end-to-end.
S3. **Set de herramientas** (nombres exactos): `ordo_search`, `ordo_task_list|create|get|update|complete`, `ordo_project_list|create|get|update`, `ordo_comment_add`, `ordo_habit_today|complete`, `ordo_objective_progress`, `ordo_me`. Cada tool valida scopes y permisos del usuario. Check: matriz tool×scope con 401/403/200 correctos.
S4. **Herencia de permisos**: el agente solo ve/opera lo que el usuario OAuth ve/opera (workspaces, proyectos, tareas); invitados (guests) bloqueados de OAuth/MCP. Check: test de conformidad — usuario sin acceso a workspace W → tools sobre W devuelven 403/not-found sin filtrar existencia.
S5. **Controles**: listado/revocación de grants por usuario y admin; audit log de cada `tools/call` con mutación; límites de throttling por tool documentados. Check: revocar grant → llamadas posteriores 401; mutación visible en audit log.
S6. **Docs técnicas**: crear `docs/reference/mcp-server.md` (transporte, auth, scopes, catálogo de tools con ejemplos). Check: un dev conecta un cliente MCP genérico solo con ese doc.

Fuera de alcance: guías por cliente final (002), directorios (003), nuevas capacidades de dominio (solo exponer lo existente en `/v1`).

## Allowed edit surfaces

- `apps/backend/src/mcp/` (nuevo módulo: transporte, router JSON-RPC, catálogo tools, guards de scope, spec)
- `apps/backend/src/app.module.ts` (registro)
- `apps/backend/src/main.ts` (solo wiring `/mcp` si es necesario)
- `packages/db/prisma/schema.prisma` (+ 1 migración: grants MCP / audit si no lo cubre 009)
- `docs/reference/mcp-server.md` (nuevo)

## Verification

- `cd apps/backend && npx jest src/mcp --runInBand` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- `cd apps/backend && npx jest src/api-tokens src/oauth --runInBand` → verde (sin regresión en 009)
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`
- Nota: si se añade `@modelcontextprotocol/sdk` como dependencia, requiere autorización explícita del padre (mutación de deps).

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Transporte Streamable HTTP + `tools/list|call` + tests protocolo | delegada | pending | — |
| T2 | S2 | Auth: metadata RFC 9728 + scopes + step-up + browser-approve | delegada | pending | — |
| T3 | S3 | Catálogo `ordo_*` sobre `/v1` + matriz de scopes | delegada | pending | — |
| T4 | S4–S5 | Herencia de permisos + guests bloqueados + revoke + audit | delegada | pending | — |
| T5 | S6 | `docs/reference/mcp-server.md` | inline | pending | — |

## Log

L1. "tenemos que piensas en la integracion perfecta con agentes como Hermes, openclaw, tambien con ChatGPT, Claude y demas soluciones de IA porque esto es el futuro... muchos siquiera usaran mas UI, todo sera agentico, asi que tenemos que estar preparados..." (mensaje del usuario 2026-10-18; este doc cubre el servidor MCP remoto).
