# ODD: Auto-scheduling (Do Date vs Due Date + replanificación)

Objective: el "wow" demo del segmento — Ordo planifica el día solo, distingue fecha-de-hacer vs fecha-límite, replanifica cuando te atrasas y avisa días antes si hay riesgo (estilo Motion/Reclaim).
Branch: `feature/auto-scheduling` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; modelo primero, motor después, UI al final; cobertura ≥70%.
Test runner: Jest (backend), Vitest (web).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/competitive-analysis.md` (secciones Motion/Reclaim, "Vs Motion / Reclaim / Sunsama")
- `apps/backend/src/ai/ai.controller.ts:491,537` (`GET optimal-schedule`, `predict-duration` — base a convertir en sistema)
- `apps/backend/src/tasks/` (modelo de tarea: dónde añadir `doDate`; `time-blocks` existentes)
- `apps/backend/src/timers/` (historial real para aprender duraciones)
- `apps/backend/src/notifications/smart-notifications.service.ts` (patrón de notificaciones proactivas)

## Specs

S1. **Modelo Do Date vs Due Date**: `doDate` (cuándo lo harás) separado de `dueDate` (límite); `doDate` editable por usuario y por motor; migración backfill (`doDate = dueDate` si existe, si no `null`); API y UI muestran ambos sin romper clientes viejos. Check: tarea con solo `dueDate` → backfill correcto; contrato viejo sigue respondiendo.
S2. **Motor de planificación**: dado (tareas con duración estimada, do/due dates, prioridad, calendario del usuario, horas de trabajo, perfil de energía si existe) produce plan diario con bloques; respeta vencimientos primero, luego prioridad, luego energía; determinista ante misma entrada (mismo input → mismo plan). Check: fixture de 20 tareas → plan válido (sin solapes, vencimientos respetados) + snapshot determinista.
S3. **Replanificación automática**: evento disparador (tarea atrasada, tarea completada antes, nuevo evento en calendario, día empezado) replanifica solo lo afectado; el usuario ve qué cambió y por qué ("Moví X a mañana porque Y se alargó"); modo manual de "congelar" bloques. Check: completar una tarea 1h antes → bloques siguientes se adelantan; bloque congelado no se mueve jamás.
S4. **Alertas de riesgo**: si el plan no cabe (sobrecarga) o un vencimiento peligra, avisa con días de antelación + propuesta concreta (mover, partir, delegar, renegociar fecha). Nunca afirmaciones absolutas ("nunca pierdas un deadline" prohibido — ver `promises-audit.md` §C). Check: fixture sobrecargado → alerta con ≥2 opciones accionables.
S5. **Aprendizaje de duraciones**: `predict-duration` aprende del historial de timers (estimado vs real por tipo de tarea/usuario); expone confianza; si no hay datos, dice "sin datos" en vez de inventar. Check: con historial → error medio baja vs baseline; sin historial → respuesta honesta.
S6. **UI + MCP**: vista "Mi plan de hoy" (web primero) con aceptar/rechazar cambios propuestos; herramienta MCP `ordo_day_plan` (proponer) + `ordo_day_plan_apply` (aplicar) para 001. Check: flujo completo web + tools MCP registradas.

Fuera de alcance: sync calendario bidireccional (010 — aquí se consume calendario ya sincronizado o `.ics` importado), ritual (006 — aquí se produce el plan que el ritual presenta).

## Allowed edit surfaces

- `apps/backend/src/scheduling/` (nuevo módulo: motor, replanificador, alertas, spec)
- `apps/backend/src/ai/` (solo `optimal-schedule`/`predict-duration`: delegar al motor, sin romper contrato)
- `apps/backend/src/tasks/` (solo añadir `doDate` + endpoints de plan; mínimo)
- `packages/db/prisma/schema.prisma` (+ 1 migración: `doDate`, planes propuestos)
- `packages/ui/src/components/scheduling/` (vista plan + diff de cambios; <150 líneas/componente)
- `apps/web/src/` (wiring "Mi plan de hoy")
- `packages/i18n/src/locales/*.json` (solo claves de scheduling)

## Verification

- `cd apps/backend && npx jest src/scheduling src/ai --runInBand` → verde (incluye snapshot determinista)
- `cd apps/web && npx vitest run src/components/scheduling` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | `doDate` + backfill + contratos compatibles | delegada | done | jest tasks 177/177, backfill scratch OK, tsc 0 (L2) |
| T2a | S2 | Motor determinista + fixtures + snapshot | delegada→inline | done | jest 150/150 + snapshot, tsc 0 (L3) |
| T2b | S2 | Cableado `optimal-schedule` + `dayPlan` compatible | inline | done | jest 155/155, TZ fix + spec hermético (L3) |
| T3a | S3 | Motor replan puro + triggers + criterio compartido | delegada→inline | done | jest 235/235, 4 bloqueantes review cerrados (L4) |
| T3b | S3 | Proposals + freeze/apply endpoints + migración | delegada→inline | done | jest 248/248, migrate scratch OK, B1/B2 cerrados (L5) |
| T4a | S5 | Duraciones desde timers + `predict-duration` honesto | delegada→inline | done | jest 295/295, tags fix + tests genuinos (L6) |
| T4b | S4 | Risk alerts + endpoint + cron | delegada→inline | done | jest 272/272, nits N1-N6 (L7) |
| T5a | S6 | Tools MCP `ordo_day_plan*` + dismiss | delegada→inline | done | jest 298/298, DI fix + audit test (L8) |
| T5b | S6 | Vista "Mi plan de hoy" web + i18n | delegada→inline | done | vitest ui 9/9 + web 14/14, tsc×3 0 (L9) |

## Log

L1. "quiero que seamos la mejor de lejos... hoy tenemos que estar tan bien o mejor que la competencia en las funciones que ofrecen a sus usuarios" (mensaje del usuario 2026-10-18; este doc cubre auto-scheduling estilo Motion/Reclaim).
L2. T1 done 2026-10-20 (PR #298, commit `aef80136`): `Task.doDate` nullable + índice + migración con backfill `doDate = dueDate` + DTOs create/update (patrón `scheduledDate`) + pass-through entity/usecase/repository. `tasks.service.ts` sin cambios (spread; tests PRESERVE). Evidencia: jest `src/tasks+repositories` 177/177, tsc 0 (tras rebuild core dist, revertido), eslint 0 nuevos, cobertura 80.6%, backfill en scratch (con/sin dueDate → copiado/NULL; scratch borrada). Hallazgo no tocado: `create-task.usecase.spec.ts` huérfano (testMatch de core no lo ejecuta).
L3. T2 done 2026-10-20 (partido en T2a #299 `6a558c70` + T2b #302 `064f44c0` por tamaño): motor `planDay` puro (due→prioridad→energía→taskId, eventos+almuerzo como busy, `unscheduled` con motivo) + fixture 20 tareas + snapshot + `SchedulingService`/`SchedulingModule`; `GET ai/optimal-schedule` añade `dayPlan` manteniendo `peakHours/peakDays/recommendation`. Revisor T2a: APPROVE WITH NITS (N1 NaN→0, N2/N3 orden explícito + bordes, N5 nota doDate→T3 — aplicados en T2b). Revisor T2b: REQUEST CHANGES → fix TZ (`user.timezone` + `Intl en-CA`, patrón `findToday`) + tests exactos + pin TZ hermético. Evidencia: jest 155/155 + snapshot, tsc 0, eslint 0, bootstrap AppModule temporal OK (borrado).
L4. T3a done 2026-10-20 (PR #304 `d17175f4`): `replan()` puro (congelados como busy fijo, regla dura jamás-semueven; diff moved/added/removed/resized con motivos + trigger) + triggers explícitos (`replanOnDayStart/Completed/Overrun`, sin EventEmitter — no existe en backend) + criterio candidatas extraído a `candidate-criteria.ts` (ai.service delega, spec T2 intacto) + `todayEvents` desde `ExternalCalendarBlock` (010, solo lectura, clamp cross-midnight + `24:00`). Revisor: REQUEST CHANGES ×2 rondas → B1 (doble `removed` fusionado con motivo rico), B2 (ghost-freeze se planifica), B3+residual (clamp ambos lados + `24:00`), B4 (mock completed con tarea presente) + specs TZ-herméticos (`cdmxAt`, verificado local+UTC+Kiritimati; fix colateral del flake T2 en CI). Evidencia: jest 235/235 + snapshot, tsc 0, eslint 0, mutaciones verificadas por revisor.
L5. T3b done 2026-10-20 (PR #305 `37a9c1c3`): `DayPlanProposal` (userId/date/blocks/frozen/changes/status enum 3 ficheros) + migración SQL manual aislada (excluye drift preexistente Content*/Idea*, documentado en cabecera) + `DayPlanService` (GET solo PROPOSED, freeze/unfreeze idempotentes 404, apply con tenant-check `ownerId` + 409 faltantes + `$transaction` atómica + TZ-aware `date`) + 4 endpoints tasks (day-plan antes de `:id`) + getter prisma. Revisor: REQUEST CHANGES → B1 (tenant+tx), B2 (solo PROPOSED) + nits (payload pineado, TZ date, wheres userId). Evidencia: jest 248/248, `migrate deploy` scratch OK (tabla+enum+índices+FK; scratch eliminado), tsc 0, eslint 0 errores (2 prettier preexistentes corregidos a petición del dueño).
L6. T4a done 2026-10-20 (PR #308 `9e623579`): `DurationLearningService` (sesiones WORK/CONTINUOUS 90d vía TimerRepository + TaskRepository, comparable categoría[tags/project]→prioridad→none, mediana con IQR, ladder <5 fallback honesto "Sin datos suficientes"/5–14 MEDIUM/≥15 HIGH) + `predict-duration` delegando (contrato + sampleSize/source; Gemini solo en fallback-con-título; legacy si no resuelve). Revisor: REQUEST CHANGES → B1 (`tags` include en `findById`+`IncludeDeleted`, read-only), B2 (T1 boundary 40/45 + `atípicas`, T4 2+4 discriminante; mutaciones verificadas) + nits (header none, title fuera, bordes 4/14, blank-category). Evidencia: jest 295/295, tsc 0, eslint 0.
L7. T4b done 2026-10-20 (PR #309 `8be6975a`): `assessRisks` pura (claves YYYY-MM-DD, sin TZ math; overload + deadline-at-risk 0..3d, ≥2 opciones cada una, mensajes honestos sin absolutos pineados por regex) + `RiskAlertService` (plan en memoria documentado — proposal T3b no persiste `unscheduled`; sort determinista por due) + cron 8am dedup 24h (`@Optional` NotificationsService + fallback prisma, sin ciclo DI) + `GET tasks/day-plan/risks` (daysAhead default 3, 503 si no resuelve). Revisor: APPROVE WITH NITS (N1 forwardRef fuera, N2 roles sin VIEWER, N3 tests endpoint + doDate-null, N4 sort, N5 regex `guarantee`, N6 comentario prod-path; N7 idioma asumido EN). Evidencia: jest 272/272, tsc 0, eslint 0, mutaciones verificadas por revisor.
L8. T5a done 2026-10-20 (PR #310 `f2ccf7d8`): tools MCP `ordo_day_plan` (read: `{...plan, risks}`) + `ordo_day_plan_apply` (mutante tasks:write + audit) con scopes + `SchedulingModule` en McpModule (DI faltante cazada por repro orquestador antes que CI) + `POST day-plan/dismiss` (PROPOSED→DISMISSED, 404/409, sin writes) + docs mirror (+ conteo 16→18 en listings). Revisor: APPROVE WITH NITS (docs stale, comentario DI, renombres, test 409-DISMISSED, test audit `MCP_TOOL_CALL` para apply). Evidencia: jest 298/298, tsc 0, eslint 0, bootstrap OK (borrado).
L9. T5b done 2026-10-20 (PR #311 `bdf6c9de`): 3 cards presentacionales `packages/ui` (102/105/96 líneas, shape T4b real alineado por orquestador tras rebase: kind/taskIds/message/options) + ruta `/plan` + `DayPlanSection` + hooks react-query (plan/risks/apply/dismiss/freeze, invalidación plan+tasks) + api-client + sidebars ×2 + i18n Scheduling paridad es/en/pt-br. `onSelectOption` read-only con TODO a ritual 006. Revisor: APPROVE WITH NITS (clearAllMocks, clave `noPlan` muerta eliminada, useMemo títulos; 3/5/6 diseño-edge como follow-up). Evidencia: vitest ui 9/9 + web 14/14, tsc web+ui+backend 0, eslint 0.
L10. Merge log 2026-10-20: pila #298→#311 mergeada secuencial estrategia A (CI verde por paso + revisor independiente obligatorio por PR — regla permanente guardada en memoria a petición del dueño; 2 REQUEST CHANGES en T3a/T3b/T4a cerrados con re-revisión y mutaciones). Splits: T2→a/b, T3→a/b, T4→a/b, T5→a/b (motores+specs inseparables). #234 lista para cerrar. Follow-ups honestos para 006/ritual: risk options read-only, proposals viejas sin filtro `date`, TOCTOU dismiss/apply concurrente, `@@unique([userId,date])`.
