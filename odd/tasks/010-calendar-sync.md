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
| T1 | S1 | OAuth real Google + Outlook + refresh + re-auth | delegada | pending | — |
| T2 | S2 | Ordo → calendario (CRUD eventos + settings propagación) | delegada | pending | — |
| T3 | S3 | Calendario → Ordo (bloqueos "ocupado", opt-in tareas) | delegada | pending | — |
| T4 | S4–S5 | Conflictos + estado sync + cuotas + doc de límites | inline | pending | — |
| T5 | S6 | UI conexión + errores humanos | inline | pending | — |

## Log

L1. "integracion con las apps externas, calendarios..." (mensaje del usuario 2026-10-18; este doc cubre calendario real; Slack vive en 011).
