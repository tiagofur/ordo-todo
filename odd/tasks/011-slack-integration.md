# ODD: Integración Slack profunda

Objective: Ordo vive dentro de Slack sin clonarlo — notificaciones accionables, crear tarea desde cualquier mensaje, estado/foco sincronizado y resúmenes donde el equipo ya trabaja.
Branch: `feature/slack-integration` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; OAuth + notificaciones primero, slash/actions después; cobertura ≥70%.
Test runner: Jest (backend). Smoke contra workspace Slack de test solo autorizado por padre.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/competitive-analysis.md` (sección "Vs Slack" — complementarios, no clon)
- `docs/vision/promises-audit.md` (§F: Slack prometido, stub real)
- `apps/backend/src/users/users.service.ts:327-386` (stub a reemplazar para SLACK)
- `apps/backend/src/notifications/` (notificaciones actuales a rutear a Slack)
- `odd/tasks/009-public-api-webhooks.md` (leer hasta `## Log` — webhooks entrantes firmados: patrón para eventos Slack)
- `odd/tasks/001-mcp-server.md` (leer hasta `## Log` — Ordo como MCP en Slackbot, doc 002-S3)

## Specs

S1. **OAuth Slack + workspace mapping**: instalar app Ordo en workspace Slack, mapear usuario Slack ↔ usuario Ordo, canales ↔ proyectos (configurable); uninstall limpio revoca todo. Check: instalar → mapear → desinstalar en workspace de test sin residuos.
S2. **Notificaciones accionables**: vencimientos, menciones en comentarios, cambios en tareas seguidas → mensajes Slack con botones (Completar, Posponer a mañana, Ver). Botones firmados y con expiración. Check: vencer tarea → mensaje con 3 botones funcionando end-to-end.
S3. **Crear desde Slack**: message action "Crear tarea en Ordo" + slash `/ordo` (crear, listar mis hoy, iniciar timer); parseo NL reutilizando `parse-task` (007). Check: desde un mensaje cualquiera → tarea creada con link de vuelta al mensaje.
S4. **Estado de foco**: timer/focus activo en Ordo → estado Slack (`:tomato: foco hasta 15:30`, DND opcional); al terminar, estado restaurado. Opt-in explícito. Check: iniciar pomodoro → estado cambia; pausar → restaura; opt-out → 0 cambios.
S5. **Resumen diario al canal**: daily configurable (plan del día 005 + completadas ayer + riesgos) posteado al canal elegido a la hora elegida. Check: job dispara a la hora con contenido correcto en canal de test.
S6. **Seguridad Slack**: verificación de firma en cada request/evento (`X-Slack-Signature`), manejo de `tokens_revoked`/`app_uninstalled`, scopes mínimos documentados, rate limits de Web API respetados. Check: request sin firma → 401; uninstall → limpieza verificada.

Fuera de alcance: chat propio (no-meta), Slack Lists/Canvas como storage (Slack es canal, Ordo es fuente de verdad), Teams/Discord (futuro).

## Allowed edit surfaces

- `apps/backend/src/slack/` (nuevo módulo: OAuth, eventos, acciones, notifier, status-sync, spec)
- `apps/backend/src/users/` (mapeo Slack↔Ordo en `UserIntegration` SLACK)
- `apps/backend/src/notifications/` (router a Slack; mínimo)
- `packages/db/prisma/schema.prisma` (+ 1 migración: mapeos Slack, settings por workspace)
- `apps/web/src/` (UI: conectar Slack, mapear canal↔proyecto, settings resumen/estado)
- `packages/i18n/src/locales/*.json` (solo claves Slack)
- `docs/guides/integrations/slack.md` (nuevo: setup + scopes + límites)

## Verification

- `cd apps/backend && npx jest src/slack --runInBand` → verde (con Slack API mockeada)
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Smoke real (solo padre): workspace de test — instalar, notificar, crear desde mensaje, estado foco, resumen
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1+S6 | OAuth + mapping + verificación firma + uninstall limpio | delegada | pending | — |
| T2 | S2 | Notificaciones accionables con botones firmados | delegada | pending | — |
| T3 | S3 | Message action + `/ordo` con `parse-task` | delegada | pending | — |
| T4 | S4–S5 | Status-sync foco + resumen diario | inline | pending | — |
| T5 | — | UI conexión + mapeos + `slack.md` | inline | pending | — |

## Log

L1. "integracion con las apps externas" (mensaje del usuario 2026-10-18; este doc cubre Slack; calendario vive en 010).
