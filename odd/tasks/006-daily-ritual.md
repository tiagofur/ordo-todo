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
| T1 | S1 | Ritual mañana + estado persistido | delegada | pending | — |
| T2 | S2 | Ritual cierre + destinos + razones | delegada | pending | — |
| T3 | S3 | Time-boxing ligero + calendario día | inline | pending | — |
| T4 | S4–S5 | Rachas amables + notificaciones con horario | inline | pending | — |
| T5 | S6 | Paridad móvil del ritual | delegada | pending | — |

## Log

L1. "ser facil de usar" + "hoy tenemos que estar tan bien o mejor que la competencia en las funciones que ofrecen a sus usuarios" (mensaje del usuario 2026-10-18; este doc cubre el ritual diario estilo Sunsama).
