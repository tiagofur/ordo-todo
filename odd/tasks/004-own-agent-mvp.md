# ODD: Agente propio MVP (Q&A con retrieval + acciones + jobs)

Objective: que Ordo brille sin agentes externos — preguntas sobre el workspace con recuperación real, acciones en lenguaje natural, resúmenes y trabajos recurrentes programables en lenguaje natural.
Branch: `feature/own-agent-mvp` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; pgvector primero (migración), luego retrieval, luego acciones, luego jobs; cobertura ≥70%.
Test runner: Jest (backend). E2E con LLM real solo autorizado por padre (coste); por defecto tests con provider mockeado.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (sección "Agente propio: alcance mínimo")
- `apps/backend/src/ai/ai.controller.ts:46,108-491` (`chat`, `wellbeing`, `burnout/*`, `profile` — base a extender)
- `apps/backend/src/ai/gemini-ai.service.ts` (motor actual solo-Gemini; abstraer provider)
- `apps/backend/src/search/search.controller.ts` (búsqueda actual sin embeddings)
- `apps/backend/src/chat/` (`conversations/*`, `insights` — coach actual)
- `apps/backend/src/notifications/smart-notifications.service.ts` (cron jobs existentes: patrón de scheduling)

## Specs

S1. **Abstracción de provider LLM**: interfaz `LlmProvider` (`chat`, `embed`, `modelStats`) + implementación Gemini actual + mock determinista para tests; selección de modelo por complejidad preservada (`model-stats`). Sin breaking changes en `ai/*` existente. Check: suite `src/ai` verde con mock; `model-stats` responde igual que antes.
S2. **Retrieval real sobre contenido del usuario**: embeddings (pgvector) de tareas/proyectos/notas/comentarios/hábitos con re-indexado en escritura; `POST ai/ask` responde citando fuentes (`[{type, id, title, excerpt}]`); respeta permisos (solo indexa/recupera lo visible al usuario). Check: pregunta "¿qué vence esta semana?" → respuesta con ≥1 cita correcta; contenido de workspace ajeno jamás aparece (test de fuga).
S3. **Acciones con tools**: el agente ejecuta vía tools auditadas — `create_task`, `update_task`, `complete_task`, `create_project`, `schedule_block` — con confirmación obligatoria para acciones destructivas o masivas (>3 ítems); cada ejecución en audit log. Check: "reprograma mis vencidas a mañana" → propone plan → confirma → ejecuta; sin confirmación no muta.
S4. **Resúmenes**: extender `ai/reports/*` con daily AM/PM (extremos del ritual 006) reutilizables por el ritual; formato estable versionado. Check: generar daily dos días seguidos con fixtures → diff solo en datos, no en estructura.
S5. **Trabajos recurrentes en lenguaje natural**: "cada viernes a las 5, prepárame el resumen semanal" → job persistido (cron/evento) visible, pausable y borrable por el usuario; ejecución con contexto del usuario + notificación al completar. Check: crear, listar, pausar, ejecutar manualmente, borrar — todo vía API + UI web mínima.
S6. **Créditos y trial**: modelo de consumo por request/completitud con trial generoso; `GET ai/usage` con saldo e historial; sin saldo → 402 con mensaje accionable (no texto de error crudo). Los números exactos (trial, coste por acción) los define negocio antes de T5 — si no están, T5 queda `blocked`. Check: consumir hasta agotar trial → 402; recargar (stub admin) → funciona.

Fuera de alcance: MCP (001; pero toda tool nueva debe diseñarse exponible como tool MCP — regla de oro), auto-scheduling (005), ritual UI completa (006), STT/voz propia.

## Allowed edit surfaces

- `apps/backend/src/ai/` (provider, `ask`, tools, usage; extender controller/servicios existentes)
- `apps/backend/src/agent-jobs/` (nuevo módulo: CRUD jobs + scheduler + spec)
- `packages/db/prisma/schema.prisma` (+ migraciones: embeddings pgvector, jobs, usage)
- `packages/ui/src/components/ai/` (UI web mínima: usage + jobs; <150 líneas/componente)
- `apps/web/src/` (wiring: página o sección de jobs + usage en ai-chat/settings)
- `packages/i18n/src/locales/*.json` (solo claves de agente/jobs/usage)

## Verification

- `cd apps/backend && npx jest src/ai src/agent-jobs --runInBand` → verde (con provider mock)
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Migraciones pgvector: solo con autorización del padre + DB local (`cd packages/db && npx prisma migrate dev`)
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | `LlmProvider` + mock + `src/ai` verde sin cambios de contrato | delegada | pending | — |
| T2 | S2 | pgvector + indexado + `POST ai/ask` con citas + test de fuga | delegada | pending | — |
| T3 | S3 | Tools auditadas + confirmación + audit log | delegada | pending | — |
| T4 | S4 | Daily AM/PM en `reports/*` (formato estable) | inline | pending | — |
| T5 | S5 | Jobs recurrentes NL + UI web mínima | delegada | pending | — |
| T6 | S6 | Créditos/trial + `GET ai/usage` (bloqueado hasta números de negocio) | inline | pending | blocked? |

## Log

L1. "las mejoras necesarias para nuestro agente" (mensaje del usuario 2026-10-18; este doc cubre el agente propio MVP; la conexión con agentes externos vive en 001/002/003).
