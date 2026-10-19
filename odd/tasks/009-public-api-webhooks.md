# ODD: API pública v1 + webhooks salientes

Objective: exponer una API pública versionada con tokens de usuario (PAT + OAuth 2.1) y webhooks salientes firmados, como cimiento de MCP (001), integraciones (010, 011) y ecosistema.
Branch: `feature/public-api-webhooks` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal (CONTRIBUTING.md); slices encadenados si >400 (chained-pr); squash and merge; cobertura ≥70%.
Test runner: Jest (backend). E2E solo con autorización del padre (requiere Postgres de test).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (secciones "MCP es el estándar", "Modelo de permisos")
- `docs/vision/promises-audit.md` (§F, fila "API access")
- `apps/backend/src/auth/auth-security.controller.ts:36` (único uso actual de `ADMIN_API_KEY`)
- `apps/backend/src/main.ts:111` (prefijo global vía `API_PREFIX`) y `:114-184` (Swagger)
- `apps/backend/src/tasks/tasks.controller.ts:52` (patrón `@Controller` + `@Public()`)
- `packages/db/prisma/schema.prisma:393-401` (`IntegrationProvider`), `:368-390` (`UserIntegration`)

## Specs

S1. **Tokens personales (PAT)**: crear/revocar/listar tokens por usuario; almacenamiento hasheado (nunca en claro); formato `ordo_pat_...`; scopes (`read`, `tasks:write`, `projects:write`, `admin:webhooks`); guard que resuelve `userId` desde el token, nunca del body. Check: crear → usar en `GET /v1/me` → revocar → 401; el secreto en claro solo se muestra una vez.
S2. **OAuth 2.1 Authorization Server**: flujo authorization code + PKCE; registro de clientes por Client ID Metadata Documents (DCR solo compat); endpoints `authorize`, `token`, `revoke`, `userinfo`; metadata RFC 8414; reutilizable por 001 (MCP) y 010 (calendario). Check: code+PKCE round-trip completo contra `userinfo` con tokens auto-refrescables.
S3. **Superficie pública versionada `/v1`**: recursos tasks, projects, comments, users/me, webhooks bajo `/v1`; rutas internas existentes intactas (sin breaking changes). Check: `GET /v1/tasks` ≡ subset estable de `GET /tasks`; Swagger documenta `/v1` por separado.
S4. **Webhooks salientes**: CRUD de suscripciones (url https, eventos, secreto); entregas firmadas HMAC-SHA256 con timestamp (`ordo-signature`, `ordo-timestamp`); reintentos con backoff + log de entregas + endpoint de reenvío; eventos mínimos `task.created|updated|completed|deleted`, `project.created|updated`, `comment.created`. Check: crear tarea → POST firmado al receptor en <5s; receptor caído → reintentos visibles en log → reenvío manual OK.
S5. **Límites y auditoría**: rate limiting por token (lectura/escritura diferenciados); entradas de audit log en lifecycle de tokens, clientes OAuth y webhooks. Check: ráfaga > límite → 429 con `Retry-After`; lifecycle completo visible en audit log.
S6. **Docs**: crear `docs/reference/api-reference.md` (público v1 + webhooks + OAuth) con ejemplos copiables; actualizar Swagger. Check: un tercero integra solo con ese doc (criterio de revisión humana).

Fuera de alcance: SSO/SAML (008), facturación (012), MCP (001), receptores inbound genéricos (solo firmados salientes aquí).

## Allowed edit surfaces

- `apps/backend/src/api-tokens/` (nuevo módulo: controller, service, guard, dto, spec)
- `apps/backend/src/oauth/` (nuevo módulo Authorization Server)
- `apps/backend/src/webhooks/` (nuevo módulo: suscripciones + dispatcher + worker reintentos)
- `apps/backend/src/app.module.ts` (registro de módulos)
- `apps/backend/src/main.ts` (solo wiring necesario: prefijo `/v1`, filtros — mínimo)
- `packages/db/prisma/schema.prisma` (+ 1 migración Prisma)
- `docs/reference/api-reference.md` (nuevo)

## Verification

- `cd apps/backend && npx jest src/api-tokens src/oauth src/webhooks --runInBand` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`
- Migración: `cd packages/db && npx prisma migrate dev --name public-api-webhooks` (requiere DB local; solo autorizado por padre)

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | PAT: modelo + CRUD + guard + tests | delegada | pending | — |
| T2 | S2 | OAuth AS: code+PKCE + metadata + tests | delegada | pending | — |
| T3 | S3 | Superficie `/v1` (tasks/projects/comments/me) + Swagger | delegada | pending | — |
| T4 | S4 | Webhooks: suscripciones + dispatcher + reintentos + tests | delegada | pending | — |
| T5 | S5 | Rate limiting por token + audit lifecycle | inline | pending | — |
| T6 | S6 | `docs/reference/api-reference.md` + revisión Swagger | inline | pending | — |

## Log

L1. "piensar en la integracion con agentes pero no con MCPs complejos de configurar y etc, como un plugin o conector de facil conexion y muy bien integrado." + "integraciones con agentes externos y las mejoras necesarias para nuestro agente, integracion con las apps externas, calendarios... en fin, lo que queremos que nuestra app haga" (mensajes del usuario 2026-10-18; este doc cubre el cimiento API/webhooks).
