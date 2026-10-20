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
- `apps/backend/src/tasks/`, `apps/backend/src/projects/`, `apps/backend/src/notes/`, `apps/backend/src/comments/`, `apps/backend/src/habits/` (SOLO hooks de re-indexado en escritura, patrón `@Optional()` — ver L2)
- `apps/backend/test/` (e2e de ask + fuga; helpers existentes)
- `packages/db/prisma/schema.prisma` (+ migraciones: embeddings pgvector, jobs, usage)
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `docker-compose.yml`, `docker-compose.test.yml` (SOLO imagen postgres → pgvector pinneada — ver L3; resto de ficheros intacto)
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
| T1 | S1 | `LlmProvider` + mock + `src/ai` verde sin cambios de contrato | delegada | done | jest src/ai 85/85, tsc 0, eslint 0 (L4) |
| T2a | S2 | Infra pgvector + `AiEmbedding` + índice HNSW (sin endpoints) | delegada | done | migrate deploy scratch OK, smoke vector(768) round-trip (L5) |
| T2b | S2 | Indexado en escritura + `POST ai/ask` con citas + test de fuga | delegada | done | jest 206/206, e2e ask 4/4, tsc 0, eslint 0 nuevos (L6) |
| T3 | S3 | Tools auditadas + confirmación + audit log | delegada | done | jest src/ai 127/127, e2e tools 9/9 + ask 4/4, tsc 0 (L7) |
| T4 | S4 | Daily AM/PM en `reports/*` (formato estable) | inline | done | jest src/ai 130/130, e2e S4 OK, tsc 0 (L8) |
| T5 | S5 | Jobs recurrentes NL + UI web mínima | delegada→inline | done | jest 165/165, e2e jobs 6/6, vitest ui 4/4, tsc×4 0 (L9) |
| T6 | S6 | Créditos/trial + `GET ai/usage` | inline | done | jest 1046/1046, e2e credits 5/5 + 22 regresión, tsc 0 (L12) |

## Log

L1. "las mejoras necesarias para nuestro agente" (mensaje del usuario 2026-10-18; este doc cubre el agente propio MVP; la conexión con agentes externos vive en 001/002/003).
L2. Diseño S2 cerrado por orquestador 2026-10-19: (a) hooks de re-indexado vía `@Optional()` en los 5 servicios de dominio (verificado sin ciclos DI: `chat→blog→search→meetings` consumen `GeminiAIService` por clase, `DatabaseModule` es `@Global()`; notifs/AIModule/Slack ya usan `forwardRef`/`@Optional` como precedente; `NotasModule`/`HabitsModule` ciclos imposibles por imports) — superficie de edición ampliada en consecuencia; (b) colección embedding `AiEmbedding(embeddingId, contentType, contentId, chunkIndex, content, vector Unsupported("vector(768)"), metadata Json?)` — multi-chunk con `@@unique([contentType, contentId, chunkIndex])`, índice HNSW cosine fuera de drift-check (`CREATE INDEX CONCURRENTLY` imposible en transacción migrate: índice normal en migración + nota, o CONCURRENTLY manual en prod); `text-embedding-004` 768 dims; `contentType` enum string simple (no FK polimórfica); (c) retrieval en 2 fases (candidatos vectoriales top 40-60 + verificación Prisma `workspaceId`) — fugas imposibles por construcción, test de fuga como contrato; (d) `POST ai/ask` no-persistente (sin tabla Q&A); (e) T2 partido en T2a (infra) + T2b (indexado+ask) por tamaño PR.
L3. Autorizaciones 2026-10-19 (brief inicial del orquestador = autorización del padre): pgvector como nueva dependencia SÍ autorizada (issue la lista como "requiere autorización del padre" y el brief ordena implementar T2); imagen `pgvector/pgvector:0.8.7-pg16` pinneada (tags verificados en Docker Hub 2026-10-19) para `ci.yml`, `deploy.yml`, `docker-compose.yml`, `docker-compose.test.yml` (únicos 4 ficheros infra tocables); `GEMINI_API_KEY` de CI rotada indicada para reutilizar en T2b e2e con LLM real.
L4. T1 done 2026-10-19 (commit `405c5a03`): `LlmProvider` (chat/embed/modelStats) + `LLM_PROVIDER` token, adapter `GeminiLlmProvider`, `MockLlmProvider` determinista (768-dim unit vectors, mulberry32, compatible pgvector); `GeminiAIService`: `embed()` aditivo + `complexity` opcional en `generate()`. Evidencia: jest `src/ai` 85/85 (68 PRESERVE + 17 nuevos), tsc 0 errores, eslint 0 errores.
L5. T2a done 2026-10-19 (commit `fc52118e`): modelo `AiEmbedding` + migración `20261019_agent_embeddings` (CREATE EXTENSION vector + HNSW cosine, drift documentado) + pin `pgvector/pgvector:0.8.7-pg16` en ci/deploy/compose×2 + docs docker-run + getter `PrismaService.aiEmbedding`. Evidencia: `prisma migrate deploy` en scratch aplica la migración; `\d AiEmbedding` muestra `vector(768)` + índice hnsw; smoke: INSERT/SELECT/DELETE de vector 768-dim OK (dim 3 rechazada con error esperado); jest `src/ai` 85/85 PRESERVE, tsc 0, eslint 0.
L6. T2b done 2026-10-19: `EmbeddingIndexerService` (upsert + `$executeRaw` vector, never-breaks-write) + `RetrievalService` (2 fases: top-50 vectorial + verificación Prisma por tipo) + `POST ai/ask` (DTO con decoradores, `AIService.ask` con `@Optional()` para no romper spec viejo) + hooks `@Optional()` + `AIModule` en los 5 módulos de dominio + e2e `ai-ask` (200/400/401 + fuga como contrato: B ve 0 citas, A ve 1). Desviaciones justificadas: import runtime del indexer (no `import type`: `emitDecoratorMetadata` lo exige; sin ciclo ES) y `metadata` tipada `Prisma.InputJsonValue`. Evidencia: jest 206/206 (194 PRESERVE + 12 nuevos), e2e 4/4 en scratch (verificado por orquestador), tsc 0, eslint 0 nuevos (1 prettier preexistente en `tasks.service.ts:471`, verificado vía stash en HEAD).
L7. T3 done 2026-10-19: 5 tools (`create_task`, `update_task`, `complete_task`, `create_project`, `schedule_block`) con validadores + authz propia + descripciones humanas (regla de oro MCP en shape); `propose`/`execute` con `planRequiresConfirmation` pura (>3 steps o CANCELLED; `confirmed:false` → 403 SIN mutar = contrato S3); continue-on-error; audit `AGENT_TOOL_CALL` solo-éxito (precedente MCP); migración enum + 1 línea schema + 1 valor TS. Incidente: brief prohibía `schema.prisma` por error — el subagente paró y escaló con prueba empírica (probe `Invalid value`, precedente MCP `bd9970ef` tocaba 3 ficheros); orquestador autorizó la línea (el ODD permite schema). Evidencia: jest `src/ai` 127/127 (30 nuevos), e2e tools 9/9 + ask 4/4 regresión (verificado por orquestador en scratch), tsc 0, eslint 0 errores.
L8. T4 done 2026-10-19 (inline): `POST ai/reports/daily` (`kind` AM/PM + `date` opcional) con scopes `DAILY_AM`/`DAILY_PM` (migración enum + schema) y snapshot versionado `daily/v1` (format/kind/date/tasksDue/tasksCompleted/totalMinutesWorked/totalPomodoros — mismas claves siempre, consumible por el ritual 006); `getReports` acepta los scopes nuevos (cast documentado: core `ReportScope` lo extiende 005, Prisma ya los acepta); `gemini-ai.service`: scopes + `getScopePeriod` AM/PM + snapshot con strings. Evidencia: jest `src/ai` 130/130 (3 nuevos de estabilidad: 2 días → misma estructura, solo datos), e2e temporal en scratch AM+PM×2 días → 1 único keyset + 400/401 OK (borrado tras verificar), tsc 0, eslint 0 errores.
L9. T5 done 2026-10-20 (orquestador inline tras abandono del subagente — dejó solo migración+modelo+spec parser): módulo `agent-jobs` (parser NL trilingüe determinista DAILY/WEEKLY×1-2/WEEKDAYS + scheduler `SchedulerRegistry`/`CronJob.from` sin ciclos + servicio CRUD scoping userId + rutas semanal/diario/chat + notificación SYSTEM + `lastStatus`; controller CRUD + `POST :id/run`; `onModuleInit` re-registra activos) + migración `AgentJob` + frontend mínimo (api-client tipos+métodos, hooks react-query, `AgentJobCard` 117 líneas + vitest 4/4, sección settings en tab AI, i18n `Settings.agentJobs` 22 claves ×3 paridad exacta). Decisiones: bare 1-6 sin meridiem = tarde ES/PT ("a las 5"→17h, spec-literal); cambiar horario = borrar+crear; summaries ES en MVP. Evidencia: jest `src/ai+agent-jobs` 165/165 (35 nuevos backend), e2e jobs 6/6 en scratch (incl. cron registrado en Registry + 404 ajeno + notificación + report WEEKLY), vitest ui 4/4, tsc backend/api-client/ui/web 0 (web requirió rebuild `dist` api-client+ui por stale, revertido sin commitear), eslint 0 errores.
L10. Judgment Day 2026-10-20 (pedido por usuario pre-publicación): 2 jueces ciegos sobre T1–T5 (69 ficheros) → 5 confirmados (JD-01 HIGH: VIEWER mutaba vía tools; JD-02: timezone inválida dejaba job huérfano; JD-03: AM/PM por hora servidor; JD-04: date inválida → 500; JD-05: complete_task propose/execute discrepaban) + 4 sospechosos single-judge (deuda honesta: validación fina schedule_block, date daily/v1 en hosts >UTC, recurrencia sin indexar, latencia embed en escrituras). Fix `7f325555` (241 líneas + tests por hallazgo); re-revisión acotada limpia por ambos jueces → APPROVED. Evidencia: jest 173/173, e2e 22/22, full backend 1038/1038, tsc 0, eslint 0.
L11. Merge log 2026-10-20: pila #286→#294 mergeada secuencial estrategia A (CI verde por paso, retarget+rebase--onto+empty-trigger; 0 conflictos, 0 rojos). T2b partido en 2 PRs, T3 entero (1.5k, auditoría inseparable). #233 queda ABIERTA con T6 blocked (números de negocio).
L12. T6 done 2026-10-20 (inline, desbloqueado por usuario: trial 100 créditos, estilo Notion spend-down, costes ask 1 / tool-step 2 / report 5): `AiCreditAccount` (balance + trialUsed) + `AiUsageEvent` (kind/cost/balance/detail) + migración + `CreditsService` (trial lazy en primer uso, cobro atómico vía transacción, 402 con mensaje accionable ES, `recharge` stub admin) + cobro en `ask` (pre-LLM), `executePlan` (por step exitoso) y 4 generadores de reports (weekly solo si isNew) + `GET ai/usage` (saldo + últimas 50) + `POST ai/usage/recharge` (guard ADMIN_API_KEY/ADMIN_EMAILS, precedente auth-security) + e2e contrato S6 (drain 20 dailies → 402 accionable → recharge 50 → funciona). Evidencia: jest 1046/1046 (8 nuevos), e2e credits 5/5 + 22/22 regresión en scratch, tsc 0, eslint 0 errores. #233 lista para cerrar.
