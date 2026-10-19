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
| T1 | S1 | `doDate` + backfill + contratos compatibles | delegada | pending | — |
| T2 | S2 | Motor determinista + fixtures + snapshot | delegada | pending | — |
| T3 | S3 | Replanificación + congelar + "qué cambió y por qué" | delegada | pending | — |
| T4 | S4–S5 | Alertas de riesgo + aprendizaje de duraciones honesto | delegada | pending | — |
| T5 | S6 | Vista "Mi plan de hoy" web + tools MCP `ordo_day_plan*` | delegada | pending | — |

## Log

L1. "quiero que seamos la mejor de lejos... hoy tenemos que estar tan bien o mejor que la competencia en las funciones que ofrecen a sus usuarios" (mensaje del usuario 2026-10-18; este doc cubre auto-scheduling estilo Motion/Reclaim).
