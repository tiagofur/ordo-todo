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
| T1 | S1 | Transporte Streamable HTTP + `tools/list|call` + tests protocolo | delegada | done | worktree /tmp/ordo-mcp-server, branch `feature/mcp-server` sobre punta de pila 009 (6caa3f01), commit `feat(mcp)` T1 + `chore(backend)` SDK 1.32.1 exacto (autorizado por padre). jest src/mcp: 4/4 vs cliente real SDK; tsc: 0 errores; eslint: 0 errores. |
| T2 | S2 | Auth: metadata RFC 9728 + scopes + step-up + browser-approve | delegada | done | mismo worktree/branch, commit T2. jest: 11/11; tsc: 0 errores; eslint: 0 errores. |
| T3 | S3 | Catálogo `ordo_*` sobre `/v1` + matriz de scopes | delegada | done | mismo worktree/branch, commit T3. jest: 15/15 (catálogo completo vs cliente SDK); tsc: 0 errores; eslint: 0 errores. |
| T4 | S4–S5 | Herencia de permisos + guests bloqueados + revoke + audit | delegada | done | mismo worktree/branch, commit T4. jest: 19/19 (incl. conformancia S4/S5); tsc: 0 errores; eslint: 0 errores. Migración `20261019_mcp_tool_call_audit` validada en scratch DB. |
| T5 | S6 | `docs/reference/mcp-server.md` | inline | done | mismo worktree/branch, commit T5 docs. Doc verificado claim-por-claim (16 tools, paths, headers, ejemplo cliente SDK). |

## Log

L1. "tenemos que piensas en la integracion perfecta con agentes como Hermes, openclaw, tambien con ChatGPT, Claude y demas soluciones de IA porque esto es el futuro... muchos siquiera usaran mas UI, todo sera agentico, asi que tenemos que estar preparados..." (mensaje del usuario 2026-10-18; este doc cubre el servidor MCP remoto).

L2 (2026-10-19). T1–T5 completados en worktree aislado `/tmp/ordo-mcp-server`, branch `feature/mcp-server` sobre punta de pila 009 (commit 6caa3f01). Instalación npm aislada propia (symlinks rotos; `--legacy-peer-deps` por conflicto preexistente react-native/react19, no causado por mí). SDK `@modelcontextprotocol/sdk@1.32.1` exacto añadido con autorización explícita del padre. Decisiones: stateless (`sessionIdGenerator: undefined`, transporte fresco por request); `ordo_ping` como health tool; POST /mcp con `@Public()` (salta JWT de sesión global) + `McpAuthGuard` (PAT u OAuth, delegando a guards 009) + `TokenRateLimitGuard` reutilizado sin cambios; 403 step-up con TODOS los faltantes + header WWW-Authenticate; contexto de request vía AsyncLocalStorage (SDK no propaga userId en authInfo); catálogo de 15 tools delegando a servicios /v1 (mismo contrato que REST); `ordo_task_complete` va directo a TasksService (V1 no expone complete); scopes habit/objective sobre `tasks:write` hasta scopes dedicados; guests = no existen en el modelo (documentado, nada que bloquear); `MCP_TOOL_CALL` audit solo en mutaciones exitosas; sin modelo de grants (los grants SON los PATs/tokens OAuth; revoke → 401 inmediato por validación per-request); `prisma generate` requerido en worktree fresco (tsc fallaba sin cliente generado). Barrido final: 80/80 tests (19 MCP + 61 009 sin regresión), tsc 0 errores, eslint 0 errores, migración validada en scratch DB. Pendiente padre: push + PRs apilados sobre la pila 009 (refs #230); `prisma migrate resolve` de la fallida ajena sigue bloqueando la dev DB local.

L3 (2026-10-19). Push + PRs hechos ("haga"). 6 ramas/PRs apilados sobre punta de pila 009 (`feature/009-t6-api-docs`): #249 (SDK, base 009-tip) → #250 (T1) → #251 (T2) → #252 (T3) → #253 (T4) → #254 (T5 docs, closes #230). Comentario de tracking en #230. CI aún sin reportar checks en #249 a esta hora (revisar).

L4 (2026-10-19). Merge secuencial estrategia A completado ("seguimos corrigiendo conflictos y merge hasta terminar"). Orden real: #256 (SDK, recreado tras auto-cierre de #249 al borrar su base) → #257 (T1, recreado tras auto-cierre de #250) → #251 (T2) → #252 (T3, con fix DI: V1Module no exportaba V1*Services — misma familia que el bug #246, detectado por e2e CI) → #253 (T4) → #254 (T5 docs). Cada paso: rebase --onto main + push + CI verde + merge commit. #230 CLOSED. Lección: no borrar la rama base de una pila hasta mergear el siguiente (GitHub auto-cierra el PR dependiente); y el e2e bootstrap de AppModule es el único detector de errores DI entre módulos (los unit tests mockean módulos).

L5 (2026-10-25). Auditoría de conexión real contra producción: el MCP respondía solo bajo `/api/v1/mcp` y el discovery OAuth (RFC 9728/8414) era inalcanzable en la raíz → ningún cliente estándar (ChatGPT/Claude) podía conectar; además el registro era CIMD-only (DCR RFC 7591 → 400), los DTOs rechazaban `resource`, y dos bugs pre-existentes (getters PrismaService faltantes para apiToken/oAuth*/webhook*; LoggingInterceptor con `JSON.stringify(undefined)`) reventaban auth PAT, AS OAuth y cron de webhooks. Todo arreglado en PR #388: rutas en raíz, challenge 401, DCR idempotente estricto, redirect a login sin sesión, endurecimiento tras revisión independiente (client_id DCR siempre aleatorio — anti-phishing; scopes default `read`; revoke sin borrado masivo). Verificado e2e local simulando el flujo completo de ChatGPT (DCR → approve → token → tools/list → ordo_me → revocación). Sondas de producción + prueba humana pendientes del deploy.
