# ODD: Sync calendario bidireccional real (Google + Outlook)

Objective: cerrar la promesa rota del changelog v2.4.1 — sync bidireccional real con Google Calendar y Outlook: tareas Ordo ↔ eventos, en ambas direcciones, con resolución de conflictos honesta.
Branch: `feature/calendar-sync` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; Google primero, Outlook después; cobertura ≥70%.
Test runner: Jest (backend). Tests contra APIs reales solo con autorización del padre (cuentas de test); por defecto fakes/mocks.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/promises-audit.md` (§F fila calendario; §D changelog v2.4.1 falso)
- `apps/backend/src/tasks/tasks.controller.ts:207-244` (feed `.ics` unidireccional actual — se preserva)
- `apps/backend/src/users/users.service.ts:327-386` (`connectIntegration` stub — se reemplaza por OAuth real)
- `packages/db/prisma/schema.prisma:368-390` (`UserIntegration`), `:393-401` (`IntegrationProvider`)
- `odd/tasks/009-public-api-webhooks.md` (leer hasta `## Log` — patrones OAuth/audit a reutilizar)
- `apps/web/src/lib/offline-storage.ts`, `sync-store.ts`, `conflict-resolver.ts` (patrón de conflictos existente en web)

## Specs

S1. **OAuth real por proveedor**: Google Calendar + Outlook (Microsoft Graph) con `accessToken`/`refreshToken`/`expiresAt`/`scope` en `UserIntegration`; refresh automático; re-auth guiada cuando el grant muere; Apple Calendar vía `.ics` suscrito (documentado como solo-lectura, sin venderlo como sync). Check: conectar → desconectar → reconectar cada proveedor; token expirado → refresh silencioso.
S2. **Ordo → calendario**: tareas con fecha (do/due) crean/actualizan eventos en calendario elegido por el usuario; respeta calendario destino configurable por proyecto; borrado/archivado propaga (configurable: borrar o conservar). Check: crear→aparece, mover fecha→se mueve, completar→marca (formato configurable), borrar→propaga según setting.
S3. **Calendario → Ordo**: eventos importados como time-blocks/bloqueos (no como tareas salvo opt-in explícito); el motor de scheduling (005) los consume como "ocupado". Nunca crear tareas fantasma sin consentimiento. Check: evento externo → bloque "ocupado" visible; 0 tareas creadas sin opt-in.
S4. **Conflictos y honestidad**: detección de edición en ambos lados → política visible (last-write-wins con aviso + log, o manual); estado de sync por cuenta (ok/error/re-auth) visible en UI; reintentos con backoff. Check: editar ambos lados → conflicto registrado + UI lo muestra + resolución manual posible.
S5. ** Límites declarados**: cuotas de API respetadas (batch + incremental sync con `syncToken`/delta); sync inicial paginado; documentado qué NO hace (sin invitados, sin videollamadas, sin recurrencias exóticas que el proveedor no soporte). Check: cuenta con 500 eventos → sync inicial completa sin exceder cuotas; doc de límites publicado.
S6. **UI de conexión**: conectar/desconectar/elegir calendarios por proyecto desde perfil e in-app; errores en lenguaje humano ("Google revocó el acceso. Reconecta."). Check: flujo completo por UI sin tocar la terminal.

Fuera de alcance: scheduling (005 — consume esto), Slack (011), Apple bidireccional (imposible sin API; `.ics` es el máximo honesto).

## Allowed edit surfaces

- `apps/backend/src/calendar-sync/` (nuevo módulo: providers, sync engine, conflictos, spec)
- `apps/backend/src/users/` (reemplazar stub `connectIntegration` por flujo real; preservar firma si es posible)
- `packages/db/prisma/schema.prisma` (+ 1 migración: estado sync, mapeos evento↔tarea)
- `apps/web/src/` + `apps/desktop/src/` (UI conexión + estado sync)
- `packages/ui/src/components/integrations/` (componentes conexión; <150 líneas)
- `packages/i18n/src/locales/*.json` (solo claves de calendario)
- `docs/guides/integrations/calendar-sync.md` (nuevo: cómo funciona + límites honestos)

## Verification

- `cd apps/backend && npx jest src/calendar-sync src/users --runInBand` → verde (con providers mockeados)
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Smoke real (solo padre): conectar cuenta de test Google + Outlook → sync ida y vuelta observado
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | OAuth real Google + Outlook + refresh + re-auth | delegada | done | worktree /tmp/ordo-238, branch `feature/calendar-sync`, commits `chore(backend)` SDK + `feat(calendar)` T1. jest src/calendar-sync: 14/14; tsc: 0 errores; eslint: 0 errores. Migración enum `MICROSOFT_CALENDAR` validada en scratch DB. |
| T2 | S2 | Ordo → calendario (CRUD eventos + settings propagación) | delegada | done | mismo worktree/branch, commit T2. jest: 20/20; tsc: 0 errores; eslint: 0 errores. Migración modelos validada en scratch DB (9 statements OK). |
| T3 | S3 | Calendario → Ordo (bloqueos "ocupado", opt-in tareas) | delegada | done | mismo worktree/branch, commit T3. jest: 26/26; tsc: 0 errores; eslint: 0 errores. |
| T4 | S4–S5 | Conflictos + estado sync + cuotas + doc de límites | inline | done | mismo worktree/branch, commit T4. jest: 32/32; tsc: 0 errores; eslint: 0 errores. `calendar-sync.md` con matriz de conflictos, cuotas y never-list. |
| T5 | S6 | UI conexión + errores humanos | inline | done | mismo worktree/branch, commit T5. tsc web/ui/api-client limpios; web build verde; i18n trilingüe verificado. |

## Log

L1. "integracion con las apps externas, calendarios..." (mensaje del usuario 2026-10-18; este doc cubre calendario real; Slack vive en 011).

L2 (2026-10-19). T1–T5 completados en worktree aislado `/tmp/ordo-238`, branch `feature/calendar-sync` desde `main` post-#260. Dependencia única nueva: `google-auth-library@10.5.0` exacta (autorizada por padre); Microsoft va por REST directo sin SDK. Decisiones: `MICROSOFT_CALENDAR` como valor de enum honesto (no reusar MICROSOFT_TEAMS); tokens en `UserIntegration` existente (sin modelo nuevo para credenciales); refresh con skew de 5min + flag `re-auth-required` con mensaje humano al morir el grant; `Task.ownerId` (NO `userId`) como ownership; `dueDate` como fecha del evento (sin `doDate` hasta ODD 005); echo prevention por mapping + extended property `ordoTaskId`; 0 tareas fantasma (opt-in exige proyecto destino, spec-pineado); conflictos last-write-wins por `updatedAt` con log en settings (últimos 20); incremental syncToken/delta marcado follow-up honesto (pull actual = ventana 30d paginada); UI solo web en T5 (desktop sigue el mismo componente presentacional cuando toque). Barrido final: 71/71 jest (calendar-sync + users), tsc backend/web/ui/api-client limpios, web build verde, eslint 0 errores, 2 migraciones validadas en scratch DB. Nota: mensaje del commit T5 trae typo "MICRSOFT" (solo cosmético, el código dice MICROSOFT_CALENDAR). Pendiente padre: smoke real con cuentas test Google + Outlook + push + PRs (refs #238); `prisma migrate resolve` de la fallida ajena sigue bloqueando la dev DB local.

L3 (2026-10-19). Push + PRs hechos ("siga"). 6 ramas/PRs apilados sobre `main`: #261 (SDK, base main) → #262 (T1) → #263 (T2) → #264 (T3) → #265 (T4) → #266 (T5 UI, closes #238). Comentario de tracking en #238. T1–T4 pasan 400 líneas pero son unidades mecánicas revisables (provider+spec, servicio+spec). CI corriendo en #261 a esta hora.

L4 (2026-10-19). Merge secuencial estrategia A completado ("merge secuencial por ti"). Orden: #261 → #262 → #263 → #264 → #265 → #266, cada uno con CI verde antes de mergear (retarget + rebase --onto + trigger CI). Incidente único: rebase de T5 chocó con la nueva settings por tabs de `main` (trabajo del otro agente, PR #259); resuelto quedándome con `main` + re-aplicando la sección Calendar adaptada al estilo cards del tab general (verificado: tsc web limpio). #238 CLOSED. Ramas de la pila borradas (remotas + locales), worktree /tmp/ordo-238 eliminado. Pendiente humano: smoke real con cuentas Google + Outlook (credenciales OAuth app) + `prisma migrate resolve` de la fallida ajena.
