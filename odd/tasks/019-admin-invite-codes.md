# ODD: Panel de admin + registro por invitación (códigos, bloqueo, regalar Pro)

Issue: #353

Objective: controlar quién entra a Ordo mientras es beta cerrada (registro solo con código de invitación generado por el admin) y dar al admin (tiagofur@gmail.com) un panel con métricas generales, gestión de usuarios con datos NO sensibles (bloquear, regalar Pro) y ciclo de vida de códigos de invitación. El promo code queda fuera (va con 012/billing).
Branch: `feature/odd-019-admin-invite` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; una PR por T# (≤300 líneas ideal; T4/T6 pueden partirse backend/frontend si superan 400); test-first (RED/GREEN) en todo cambio de comportamiento; P0 (T1–T2) primero.
Test runner: Jest (backend, core) · Vitest (web) · e2e Jest (`apps/backend/test/jest-e2e.json`).

## Context (leer primero — presupuesto: estos paths, nada más)

Modelo y migraciones:
- `packages/db/prisma/schema.prisma` — `User` 14-109 (sin rol global, sin status, sin deletedAt; `hashedPassword` 32); `AdminUser` 249-258 (huérfano, NO se usa — no confundir); `Subscription` 1602-1637 + `SubscriptionPlan {FREE,PRO,TEAM,ENTERPRISE}` / `SubscriptionStatus` (huérfana: nadie crea filas; única lectura real: peso de votos en `apps/backend/src/roadmap/roadmap.service.ts:68-87` y `getFullProfile` en `apps/backend/src/users/users.service.ts:56-92`); `WorkspaceInvitation` 783-813 (invitaciones a workspace, NO reutilizar: son por email+token, modelo distinto); `AuthAuditLog` 2024 + `AuthEventType` 2045-2070 (ya tiene `ACCOUNT_LOCKED`/`ACCOUNT_UNLOCKED`; añadir valores de enum = migración aditiva segura).
- Migraciones: `packages/db/prisma/migrations/` (38); comandos en `packages/db/package.json` (`db:migrate`). Convenios TZ-herméticos en specs (memoria: sin setHours locales).

Registro actual (la única vía real del formulario web):
- `apps/backend/src/auth/auth.controller.ts` — `POST /auth/register` 68-124 (`@Public`, `@Throttle` 3/h, cookies httpOnly); `login` 131; OAuth `google`/`github` 364-492.
- `apps/backend/src/auth/auth.service.ts` — `register` 50-96 (usa use case core + `this.login`), `login` 98-207 (NO comprueba ningún estado de cuenta), `validateUser` 209-220 (solo existencia), `refresh` 222+, OAuth find-or-create 357-420 (crea usuario en 395 vía `userRepository.create`; workspace por defecto 404-418).
- `apps/backend/src/auth/dto/register.dto.ts` (class-validator) · `packages/core/src/shared/validation/user.validation.ts` (`registerUserSchema` 12-27) · `packages/core/src/users/usecase/register-user.usecase.ts` · `apps/backend/src/repositories/user.repository.ts` (`save` 57-72, upsert).
- `apps/backend/src/auth/strategies/jwt.strategy.ts` — `validate` 31-47 llama `validateUser(payload.email)` en CADA petición autenticada → punto de enforcement de bloqueo (401 instantáneo sin tocar sesiones).
- **Hueco (cerrar en T2)**: `apps/web/src/app/api/auth/signup/route.ts` crea usuarios directamente con Prisma, sin auth, sin rate-limit, sin pasar por NestJS — bypass total del invite-only. Sin llamadores (verificado 2026-10-23; NextAuth residual en `apps/web/src/lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts` no lo usa). Eliminar ruta (y su test si existe).

Patrón admin existente (reutilizar, no inventar roles):
- `apps/backend/src/auth/auth-security.controller.ts:35-44` y `apps/backend/src/ai/ai.controller.ts:592-613` — `assertAdminAccess`: header `x-admin-api-key` (`ADMIN_API_KEY`) **o** email en `ADMIN_EMAILS` (env, coma-separada). No hay `ADMIN_EMAILS` en `.env.example` ni en `.env` (2026-10-23). Decisión: default en código `tiagofur@gmail.com` cuando la env está vacía (petición del usuario), ampliable por env.
- `GET /users/me` — `apps/backend/src/users/users.controller.ts:75-99`; añade `isAdmin` (fuente única para el menú).

Frontend registro y panel:
- `apps/web/src/app/[locale]/register/page.tsx` (~495 líneas; `useAuth().register`) · `packages/auth-provider/src/auth-provider.tsx` (`registerMutation` 81-86/123-139) · `apps/web/src/lib/api-client.ts` (`register` 451-452, `getCurrentUser` 489-490) · `apps/web/src/middleware.ts` (`publicPages` 7).
- UI: shadcn new-york en `packages/ui/src/components/ui/` (Table, Dialog, Form, Select, Badge, Tabs, sonner). Referencias de patrón: `apps/web/src/components/workspace/workspace-members-settings.tsx` (tabla admin con dropdown de acciones), `invite-member-dialog.tsx` (Dialog+Form+mutación+toast), `apps/web/src/app/[locale]/(pages)/(internal)/profile/page.tsx` (página con datos+mutaciones).
- Hooks: fábrica `packages/hooks/src/hooks.ts` + `query-keys.ts`; web re-exporta en `apps/web/src/lib/api-hooks.ts` y `shared-hooks.ts`. Tipos: `packages/api-client/src/types/`.
- i18n: `packages/i18n/src/locales/{es,en,pt-br}.json` (solo claves nuevas).

Proceso: `odd/README.md` (plantilla), `docs/planning/roadmap.md` (fila 019 en tabla ~L98), `docs/vision/promises-audit.md` §B (L52). Gates raíz: `npm run build` → `check-types` → `test` (turbo; task `test` depende de `^build`). E2E contra Postgres efímero `docker-compose.test.yml` (pgvector). Gotchas conocidos: dists de paquetes antes de medir tsc/vitest (`turbo run build --force`); tests de core SOLO en `packages/core/test/**` (testMatch); menús Radix en jsdom abren con pointerDown→pointerUp→click.

## Specs

S1. **Modelo de invitaciones y estado de usuario (P0)**. Prisma: `model InviteCode` (código `String @unique` formato `ORDO-XXXX-XXXX` generado con alphabet sin ambiguos 0/O/1/I/L; `label String?`; `maxUses Int @default(1)`; `usedCount Int @default(0)`; `expiresAt DateTime?`; `isActive Boolean @default(true)`; `createdById String?` → User; timestamps), `model InviteRedemption` (`userId @unique` — un canje por usuario; `inviteCodeId`; `redeemedAt`; relaciones con onDelete restrict/cascade decididas en T1 y documentadas), `User.status UserStatus @default(ACTIVE)` + `enum UserStatus { ACTIVE BLOCKED }` + `User.blockedAt DateTime?` + `User.lastLoginAt DateTime?` (escrito en login exitoso; alimenta la tabla de admin sin escanear AuthAuditLog). Migración aditiva que también amplía `AuthEventType` con `ADMIN_USER_BLOCKED, ADMIN_USER_UNBLOCKED, ADMIN_PRO_GRANTED, ADMIN_PRO_REVOKED, INVITE_CODE_CREATED, INVITE_CODE_DEACTIVATED` (audit de T3/T4 sin migración tardía). Repositorio `invite-code.repository.ts` (+ provider en `repositories.module.ts`) y use cases core bajo `packages/core/src/invites/` con tests en `packages/core/test/invites/`. El código se guarda en TEXTO PLANO a conciencia: el admin necesita releerlo/copiarlo del panel (no es bearer secret como el tokenHash de workspace). Check: migración aplica limpio en local; tests de dominio (generación de formato, canje válido/agotado/expirado/inactivo, un-canje-por-usuario).

S2. **Registro exige código (P0)**. `REGISTRATION_MODE` (env, default `invite-only`; `open` desactiva la exigencia sin tocar código). En invite-only: `RegisterDto` añade `inviteCode` requerido; el flujo valida+consume el código TRANSACCIONALMENTE (existe, `isActive`, no expirado, `usedCount < maxUses` → `updateMany` condicional con `increment` anti-carrera + fila `InviteRedemption`, todo en `$transaction`; registro de usuario en la misma transacción o justo tras consumir — decisión de T2 documentada: si el registro falla, el canje no debe quedar huérfano consumiendo uso). Errores 400/410 con códigos de máquina distinguibles (`INVITE_INVALID`, `INVITE_EXPIRED`, `INVITE_EXHAUSTED`, `INVITE_INACTIVE`) para mapearlos a mensajes i18n. OAuth Google/GitHub (357-420): cuenta nueva en invite-only → 403 con código de máquina `REGISTRATION_INVITE_ONLY` (usuarios existentes linkean OAuth sin cambio). Hueco legacy: eliminar `apps/web/src/app/api/auth/signup/route.ts` (crear usuario directo = bypass; sin llamadores). Rate-limit register 3/h se mantiene. `GET /auth/registration-mode` (`@Public`, ligero) devuelve `{ mode }` para que el formulario muestre/oculte el campo. Check: specs backend RED→GREEN (código válido registra y consume; agotado/expirado/inactivo/inesistente rechazados con su código; modo open ignora el campo; OAuth nuevo rechazado) + e2e (registro feliz + rechazo) + eliminación de la ruta legacy verificada (grep de llamadores).

S3. **Bloqueo de usuarios (P1)**. Endpoints `POST /admin/users/:id/block` y `/unblock` (solo AdminGuard; el admin no puede bloquearse a sí mismo → 400). Enforcement: `login` (98-207) rechaza `status=BLOCKED` con 401 + código de máquina `ACCOUNT_BLOCKED`; `validateUser` (jwt.strategy 31-47) devuelve null para BLOCKED → toda petición autenticada de un bloqueado recibe 401 inmediatamente (las sesiones mueren solas, sin gestión de revocación); `refresh` (222+) también rechaza. `lastLoginAt` se actualiza en login exitoso. Audit: `ADMIN_USER_BLOCKED`/`ADMIN_USER_UNBLOCKED` con metadata `{ adminEmail }`. Frontend NO en esta tarea (el bloqueo se puede verificar por API/e2e). Check: specs RED→GREEN (login bloqueado 401; petición con token previo 401; refresh 401; self-block 400; unblock re-habilita) + e2e.

S4. **Módulo admin backend (P1)**. `apps/backend/src/admin/` nuevo: `AdminGuard` (misma semántica `assertAdminAccess`: `ADMIN_API_KEY` o email en `ADMIN_EMAILS`, default código `tiagofur@gmail.com` — extraer la lógica duplicada de auth-security/ai a un helper común SI el diff se lo permite; si no, tercer uso documentado). Endpoints: `GET /admin/overview` (usuarios totales, nuevos 7/30d, activos 30d vía AuthAuditLog `LOGIN_SUCCESS` distinct, tareas totales/completadas no-deleted, workspaces, distribución de planes groupBy); `GET /admin/users?search&page&limit` (id, email, username, name, createdAt, lastLoginAt, status, plan — SIN contenido); `GET /admin/users/:id` (+ contadores agregados: tareas, workspaces, redenciones — nunca títulos/cuerpos); `POST /admin/users/:id/grant-pro` body `{ days?: number | null }` (null=indefinido; upsert Subscription PRO/ACTIVE, `stripeCurrentPeriodEnd = now+days` si days; idempotente) y `POST /admin/users/:id/revoke-pro` (vuelve a FREE o borra fila — decisión T4 documentada); `GET/POST /admin/invite-codes` (POST: `{ label?, maxUses?, expiresAt? }` → genera código; GET: lista con usedCount/redenciones), `PATCH /admin/invite-codes/:id` `{ isActive }` (desactivar; sin delete duro — auditoría). Toda acción audita en AuthAuditLog. Tests: specs del controller/service + e2e de autorización (no-admin 403, admin 200). Check: specs + e2e.

S5. **Frontend: registro con código (P0)**. `register/page.tsx`: campo "Código de invitación" visible cuando `GET /auth/registration-mode` responde `invite-only` (y fallback: si el endpoint falla, mostrar el campo — fail-closed en UI); mapeo de códigos de máquina (S2) a mensajes claros i18n (es/en/pt-br). `registerUserSchema` core + `RegisterUserDTO` del auth-provider + tipos del api-client. Eliminada la ruta legacy, el formulario no cambia de destino (ya apunta a NestJS). Check: tests Vitest del formulario (campo requerido en invite-only, error de código agotado visible) + tsc.

S6. **Frontend: panel admin (P1)**. Rutas `/(internal)/admin/{page,users,codes}` (layout interno ya fuerza auth; layout de admin valida `isAdmin` de `/users/me` → no-admin redirige a dashboard). Dashboard: tarjetas de métricas (estilo Analytics existente). Users: tabla con búsqueda/paginación/estado/plan, dropdown de acciones (bloquear con confirmación, regalar Pro con diálogo días/null, quitar Pro) y detalle en Dialog con contadores agregados — SIN acceso a contenido de tareas/notas (los endpoints no lo exponen y la UI no lo pide). Codes: tabla (código, etiqueta, usos, expiración, activo), Dialog de creación, botón copiar al portapapeles, desactivar. Enlace "Admin" en el menú solo si `isAdmin`. Hooks React Query nuevos (`packages/hooks`) + tipos (`packages/api-client`). i18n es/en/pt-br. Check: tests Vitest (render tabla, gating isAdmin, diálogo crear código) + tsc + eslint.

S7. **Sin regresiones + verdad pública (P1)**. Suites backend/core/web verdes; tsc/eslint 0 nuevos en superficies; e2e verdes; `docs/vision/promises-audit.md` §B se actualiza SOLO con lo mergeado en main (invite-only y panel admin pasan a verificables); fila 019 del roadmap al merge final.

Fuera de alcance: promo codes y descuentos (012-billing), Stripe/checkout/webhooks/enforcement de límites por plan, límites de recursos por plan, multi-admin con UI de gestión de admins (`AdminUser` sigue huérfano), panel admin en desktop/mobile, emails transaccionales de bloqueo/invitación, verificación de email en registro (follow-up L6-b de 018), transferencia de propiedad de workspace.

## Contrato de colaboración (invariantes nuevas)

- A1. En `REGISTRATION_MODE=invite-only` no existe vía alguna de creación de cuenta sin código válido: Ni `POST /auth/register`, Ni OAuth de cuenta nueva, Ni rutas legacy de Next (eliminadas).
- A2. Un código consume un uso exactamente por cuenta creada (transaccional, sin carreras); un usuario canjea como máximo una vez.
- A3. Un usuario BLOCKED no autentica por ninguna vía (login, refresh, token ya emitido) desde el instante del bloqueo.
- A4. Las superficies de admin exponen datos agregados/identificativos básicos, jamás contenido de tareas, notas, comentarios o mensajes de los usuarios.
- A5. Solo los emails en `ADMIN_EMAILS` (default `tiagofur@gmail.com`) acceden a `/admin/*`; el admin no puede bloquearse a sí mismo.
- A6. Toda acción de admin (bloqueo, Pro, ciclo de códigos) queda auditada con el email del admin en metadata.

## Allowed edit surfaces

- `packages/db/prisma/schema.prisma` + `packages/db/prisma/migrations/` (solo lo de S1)
- `packages/core/src/users/` (register use case) · `packages/core/src/invites/` (nuevo) · `packages/core/src/shared/validation/user.validation.ts` · `packages/core/test/{users,invites}/`
- `apps/backend/src/auth/` (controller, service, dto, strategies, specs) · `apps/backend/src/admin/` (nuevo) · `apps/backend/src/users/` (controller getMe isAdmin + spec)
- `apps/backend/src/repositories/` (user, invite-code nuevo, subscription, repositories.module + specs) · `apps/backend/src/common/` (helper admin si se extrae)
- `apps/backend/test/` (nuevos e2e: registro/códigos, admin, bloqueo)
- `packages/api-client/src/` (types + client) · `packages/hooks/src/` · `packages/auth-provider/src/`
- `apps/web/src/app/[locale]/register/` · `apps/web/src/app/api/auth/signup/` (ELIMINAR en T2) · `apps/web/src/app/[locale]/(pages)/(internal)/admin/` (nuevo) · `apps/web/src/components/admin/` (nuevo) · `apps/web/src/components/layout/` (solo enlace Admin) · `apps/web/src/lib/` (api-hooks/shared-hooks re-exports)
- `apps/backend/.env.example` (REGISTRATION_MODE, ADMIN_EMAILS documentadas)
- `packages/i18n/src/locales/{es,en,pt-br}.json` (solo claves nuevas)
- `docs/vision/promises-audit.md` (solo §B, T7) · `docs/planning/roadmap.md` (fila 019) · `odd/tasks/019-admin-invite-codes.md` (estados T# + `## Log`)

## Verification

- `cd apps/backend && npx jest src/auth src/admin src/users src/repositories` → verde
- `cd apps/backend && npm run test:e2e -- <nuevos specs>` → verde (DB local; memoria docker-dev-env)
- `cd packages/core && npx jest test/users test/invites` → verde
- `cd apps/web && npx vitest run` (o rutas tocadas) → verde (dists construidos antes)
- `npx tsc --noEmit` en backend/web/api-client/hooks/auth-provider → 0 · `npx eslint` en tocados → 0 errores
- Gates raíz: `npm run build` → `npm run check-types` → `npm run test` (22 suites)
- Prueba humana (local :3100): entrar como tiagofur@gmail.com → panel → crear código → registrar usuario nuevo en ventana privada con el código → verlo en Users → bloquearlo → verificar que su sesión muere y el login rechaza → regalar Pro 30 días → ver plan PRO en su perfil → desactivar el código → intento de registro con él rechazado.

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Schema + migración (InviteCode, InviteRedemption, User.status/lastLoginAt, enum AuthEventType) + repositorio + use cases core + tests | delegada | done | commit feat(019) T1 — core test/invites 28/28 (2 suites nuevas), backend repositories 123/123 (spec nuevo 8), backend completo 1241/1241 (124 suites), packages/db 256/256 (45 de migraciones), build+check-types core/backend 0, eslint 0 errores en tocados |
| T2 | S2+ | Registro con código transaccional + REGISTRATION_MODE + OAuth nuevo bloqueado + eliminación ruta legacy + GET registration-mode + tests/e2e | delegada | pending | — |
| T3 | S3 | Bloqueo: checks login/refresh/JWT + block/unblock + lastLoginAt + audit + tests/e2e | delegada | pending | — |
| T4 | S4 | Módulo admin backend: overview, users, grant/revoke Pro, CRUD códigos + AdminGuard + tests/e2e | delegada | pending | — |
| T5 | S5 | Frontend registro con código + i18n + tests | delegada | pending | — |
| T6 | S6 | Frontend panel admin (dashboard, users, codes) + enlace menú + i18n + tests | delegada | pending | — |
| T7 | S7 | Cierre: gates raíz, promises-audit §B, roadmap fila 019, log | inline | pending | — |

Orden: T1 → T2 → T3 → T4 → T5 → T6 → T7 (P0 primero; T5 puede solaparse con T3/T4 — el campo de registro solo necesita T2).

## Log

L1. Origen (2026-10-23): petición del usuario — "quiero temporalmente poner que para poder hacer registro necesita un codigo de invitacion… necesito un panel completo de admin con todas posibilidades de ver metricas generales, por usuario (con datos basicos sin ver su informacion sensible como sus tareas)… poder bloquear 'regalar pro'… con la opcion de codigos de invitacion por ahora y posteriormente codigo promocional tambien… el usuario admin por ahora siempre sea tiagofur@gmail.com". Exploración con 3 subagentes (auth/registro, billing+modelo, ODD+frontend). Decisiones aprobadas en plan: (1) OAuth social bloqueado para cuentas NUEVAS mientras invite-only (usuarios existentes entran normal); (2) entrega secuencial código→panel en un solo ODD; (3) interruptor `REGISTRATION_MODE` en config. Hallazgos clave: patrón ADMIN_EMAILS ya existe (auth-security + ai stub); Subscription huérfana lista para "regalar Pro" sin Stripe (ODD 012 pendiente); `User` sin status/rol global; jwt.strategy ya revalida usuario por petición → bloqueo instantáneo sin gestión de sesiones; **hueco de seguridad**: `apps/web/src/app/api/auth/signup/route.ts` crea usuarios vía Prisma directo sin auth/rate-limit/código, sin llamadores → eliminar en T2; `ADMIN_EMAILS` ausente de envs → documentar en `.env.example` con default en código.

L2. T1 done (2026-10-23). Migración ESCRITA A MANO (`20261023_invite_codes_user_status`, convención de naming `[a-z_]` sin dígitos que aplica `packages/db/migrations.test.ts`): el primer `prisma migrate dev` generó una migración que barria el DRIFT PREEXISTENTE entre schema.prisma e historia — dropeaba 8 tablas Creator OS (modelos eliminados del schema en el pasado sin migración; `20260114165737_creator_os_models` está aplicada y sus tablas sin uso en backend), añadía `ProjectType FOCUS/CREATOR/HYBRID` (valores añadidos al schema sin migración) y **dropeaba el índice hnsw `AiEmbedding_embedding_idx`** (pgvector, creador a mano en `20261019_agent_embeddings`, inexpresable para Prisma) → no commitear ese barrido; reconciliar el drift es decisión aparte. La migración manual se validó con replay completo en una base desechable (38 migraciones aplican desde cero, igual que hará CI con `migrate deploy`). Detalles de implementación: `InviteCodeProps extends EntityProps<string>` (el default es `string | number` y rompe los ports); `randomInt` inyectable en `generateCode`/`CreateInviteCodeUseCase` (Web Crypto con rejection sampling para evitar sesgo de módulo; 8 draws por código, uno por carácter); `consume` del repo usa `$executeRaw` con UPDATE condicional (`usedCount < maxUses` NO es expresable en un `where` de Prisma, que no compara columnas) y `release` es el decremento compensatorio con floor 0; `PrismaService` expone modelos por getters → añadidos `inviteCode`/`inviteRedemption` (`$executeRaw` ya estaba expuesto); gotchas de test: `noUncheckedIndexedAccess` en `buf[0]`, y el test de carrera se simplificó a "consume perdido → INVITE_EXHAUSTED" (la atomicidad real se valida en el spec del repo, que aserta el SQL, y en el e2e de T2). Reparaciones locales registradas: DB 5432 es la real (el contenedor `ordo-postgres-dev` expone 5434); tras el barrido del primer migrate dev se restauró el índice hnsw y se reasentó el registro de `_prisma_migrations`.
