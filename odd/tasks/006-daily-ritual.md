# ODD: Ritual diario guiado (mañana + cierre)

Objective: retención altísima con coste bajo — planificación guiada de mañana y ritual de cierre de noche con time-boxing y analítica de foco (estilo Sunsama), reutilizando plan (005) y resúmenes (004).
Branch: `feature/daily-ritual` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; backend (estado del ritual) → web → móvil; cobertura ≥70%.
Test runner: Jest (backend), Vitest (web).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/competitive-analysis.md` (fila Sunsama)
- `odd/tasks/005-auto-scheduling.md` (leer hasta `## Log` — plan que el ritual presenta)
- `odd/tasks/004-own-agent-mvp.md` (leer hasta `## Log` — resúmenes daily AM/PM que el ritual consume)
- `apps/backend/src/analytics/` (métricas para el cierre: foco, completadas, rachas)
- `apps/web/src/app/[locale]/(pages)/` (dónde vivirá la vista del ritual)

## Specs

S1. **Ritual de mañana (≤3 minutos)**: presenta plan del día (005) + vencidas + propuesta de top-3; usuario acepta/ajusta; estado persistido (`planned_at`, top-3 elegido). Omitible con un toque; nunca bloquea la app. Check: completar ritual con fixtures → estado persistido + top-3 guardado.
S2. **Ritual de cierre (≤2 minutos)**: qué se completó vs plan, qué se mueve a mañana (con razón en 1 toque: "se alargó X", "urgente Y", "sin energía"), racha y foco del día, apagado ("shutdown complete" + sugerencia de desconexión). Check: cierre con tareas pendientes → cada una con destino (mañana/fecha/archivada) + razón.
S3. **Time-boxing ligero**: asignar bloques de tiempo al top-3 (arrastrar o aceptar propuesta); bloques visibles en calendario; sin replanificación aquí (eso es 005). Check: top-3 con bloques → aparecen en vista calendario del día.
S4. **Racha del ritual**: días consecutivos completando mañana y/o cierre; celebra hitos (7/30/100) vía gamificación existente; perder un día no castiga (diseño amable, coherente con bienestar). Check: completar 7 días con fixtures de fecha → hito + XP otorgado.
S5. **Notificaciones amables**: recordatorio configurable de mañana y cierre (respeta horas de trabajo y zona horaria; silencio total fuera de horario salvo opt-in). Reutiliza `smart-notifications`/push existentes. Check: fuera de horario → 0 notificaciones; dentro → 1 por ritual.
S6. **Móvil incluido**: ritual usable en móvil (no solo web): pantallas equivalentes con paridad funcional. Check: matriz de paridad ritual web/móvil en verde.

Fuera de alcance: motor de planificación (005), generación de resúmenes (004), defensa de calendario profunda (010/005).

## Allowed edit surfaces

- `apps/backend/src/ritual/` (nuevo módulo: estado mañana/cierre, rachas, spec)
- `apps/backend/src/gamification/` (solo eventos de hito del ritual; mínimo)
- `apps/backend/src/notifications/` (solo recordatorios del ritual; mínimo)
- `packages/db/prisma/schema.prisma` (+ 1 migración: estado/rachas del ritual)
- `packages/ui/src/components/ritual/` (pasos mañana/cierre; <150 líneas/componente)
- `packages/ui-mobile/` (equivalentes móvil)
- `apps/web/src/` + `apps/mobile/` (wiring vistas ritual)
- `packages/i18n/src/locales/*.json` (solo claves del ritual)

## Verification

- `cd apps/backend && npx jest src/ritual --runInBand` → verde
- `cd apps/web && npx vitest run src/components/ritual` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Ritual mañana + estado persistido | delegada→inline | done | jest ritual 11/11 hermético, migrate scratch OK (L2) |
| T2 | S2 | Ritual cierre + destinos + razones | delegada→inline | done | jest ritual 37/37, summary degradado, dup-400 (L3) |
| T3 | S3 | Time-boxing ligero + calendario día | inline | done | jest ritual 48/48, guard DONE accept (L4) |
| T4 | S4–S5 | Rachas amables + notificaciones con horario | inline | done | jest ritual 65/65 + core 186/186, migrate scratch OK (L5) |
| T5a | S6 | Ritual web + i18n | delegada→inline | done | vitest ui 18/18 + web 18/18, tsc×2 0 (L6) |
| T5b | S6 | Paridad móvil | delegada→inline | done | jest móvil 15/15 + 7/7, tsc 0, matriz S6 verde (L7) |

## Log

L1. "ser facil de usar" + "hoy tenemos que estar tan bien o mejor que la competencia en las funciones que ofrecen a sus usuarios" (mensaje del usuario 2026-10-18; este doc cubre el ritual diario estilo Sunsama).
L2. T1 done 2026-10-21 (PR #313 `0ad452b9`, inline tras 2 stalls del subagente sin una línea): módulo `ritual/` + `GET /ritual/morning` (plan DayPlanService + vencidas por clave TZ + top-3 = 3 primeros bloques + estado) + `POST complete {top3}` (400 fuera-del-plan/duplicados, upsert DONE) + `POST skip` (SKIPPED, limpia top-3) + modelo `RitualDay` (userId+date unique, morning/evening/streakDay) + enum `RitualStatus` + migración. Revisor: APPROVE WITH NITS (startOfTodayIn reutilizado, repo requerido, skip limpia, dup-400, tests status/TZ). Evidencia: jest ritual 11/11 en 4 TZs, tsc 0, eslint 0, `migrate deploy` scratch OK, bootstrap OK.
L3. T2 done 2026-10-21 (PR #314 `b36a4167`): `GET /ritual/evening` (summary PM degradable a null + completadas hoy TZ + pendientes del plan) + `POST complete {moves}` (tomorrow/date/archived=CANCELLED documentado, razones, 400s pre-writes, tenant, transacción, `unmoved[]`, shutdown determinista día-año%7) + skip + AIModule directo (Nest no re-exporta transitivo). Revisor: REQUEST CHANGES → B1 (summary `.catch→null`, GET nunca bloquea/cobra de más) + N1–N5 (dup-400, moves[] DONE, unmoved, stray-date, Feb 30); re-revisión APPROVE WITH NITS (nits comentario/log/nota aplicados). Evidencia: jest ritual 37/37 hermético, tsc 0, eslint 0, bootstrap OK. Sin migración.
L4. T3 done 2026-10-21 (PR #315 `8346ca0b`, inline): `POST /ritual/morning/timebox` (requiere DONE+top-3, valida top-3/ownership/HH:mm/end>start/dups, end=start+estimated, escribe scheduledDate/Time+isTimeBlocked en transacción con tenant) + `POST .../accept` (copia bloques del plan ∩ top-3; mismo guard DONE que manual). Check S3 por construcción (campos == filtro `findTimeBlockedTasks`). Revisor: REQUEST CHANGES → B1 (test tiempos con mocks+mensajes+10:60), B2 (guard DONE en accept pre-getDayPlan); re-revisión APPROVE (mutaciones M1–M3 verificadas). Evidencia: jest ritual 48/48, tsc 0, eslint 0.
L5. T4 done 2026-10-21 (PR #316 `416a9f3e`, inline): `GET /ritual/streak` (consecutivas DONE mañana y/o cierre por claves TZ, hoy-pendiente tolerado, longest en 365) + hitos 7/30/100 (`unlockRitualMilestone` idempotente, seeds + XP 150/500/1500, disparo en completes) + prefs reminder (on/off + HH:mm, defaults ON 08:00/21:00) + enum RITUAL_* + migración + cron 15min (ventana 15min post-hora TZ, skip DONE/deshabilitado/dedup 24h, silencio total fuera de horario, @Optional + fallback prisma). Revisor: REQUEST CHANGES → B1 (enum core, rompía GET notifications), B2 (defaults sin fila), B3 (DTO prefs + mapeo); re-revisión APPROVE WITH NITS (regex estricto + DTO spec). Evidencia: jest ritual 65/65 + core notif 186/186, tsc 0, eslint 0, migrate scratch OK, bootstrap OK.
L6. T5a done 2026-10-21 (PR #317 `38698402`): api-client (tipos + 9 métodos) + i18n Ritual (60 claves paridad es/en/pt-br + Sidebar.ritual) + 7 cards ui <150 (morning/evening/picker/types/overdue/task-title/timebox/streak) + ruta `/ritual` web (sección + 9 hooks, invalidación ritual+tasks+time-blocks). Revisor: REQUEST CHANGES → B1 (gate evening on load/error + `unmoved` toast); re-revisión APPROVE WITH NITS (extracciones <150 aplicadas). Evidencia: vitest ui 18/18 + web 18/18, tsc web+ui 0, eslint 0.
L7. T5b done 2026-10-21 (PR #318 `ffe90d98`): pantalla ritual móvil (stack interna, precedente wellbeing) + 5 cards ui-mobile (<150, StyleSheet-only) + hooks espejo 1:1 + babel.jest.js scoped (infra jest móvil rota repo-wide: hallazgo, Metro intacto) + misma paridad B1/nits que web. Revisor: REQUEST CHANGES → B1 (invalidar time-blocks), B2 (hook <150); re-revisión APPROVE. Evidencia: jest móvil 15/15 + 7/7, tsc 0, eslint 0, matriz S6 10/10 verde.
L8. Merge log 2026-10-21: pila #313→#318 mergeada secuencial estrategia A (CI verde por paso + revisor independiente obligatorio por PR; 4 REQUEST CHANGES cerrados con re-revisión, 2 con mutaciones). Splits: T5→a/b (web/móvil). #235 lista para cerrar. Follow-ups honestos: risk-options ritual n/a; shutdown suggestion efímera (no persistida); mutaciones móvil sin feedback éxito/error; infra jest móvil rota (nativewind/babel); `streakDay` columna reservada sin lector.
