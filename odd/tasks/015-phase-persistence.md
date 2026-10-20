# ODD: Persistencia de fase del Pomodoro (el turno sobrevive al restart)

Objective: que el turno (WORK/BREAK) sobreviva a restarts derivado de la última sesión cerrada del día, y que el ciclo resetee limpio al día siguiente — sin migraciones ni endpoints nuevos.
Branch: `feature/phase-persistence` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; test-first; un solo PR directo a main (cambio contenido, mismo ritual de gates que 014).
Test runner: Vitest (`packages/hooks`); Jest (`packages/core` si se toca el motor).

## Context (leer primero — presupuesto: estos paths, nada más)

- `packages/hooks/src/use-timer-backend.ts` (hook único; `pendingModeRef`, efecto sync, prop `completedToday`)
- `packages/hooks/src/__tests__/use-timer-backend.test.tsx` (suite, helpers `setupHook`/`advance`)
- `packages/core/src/timer/engine/engine.ts` (`nextMode`, `completePhase`; NO debería necesitar cambios)
- `apps/web/src/hooks/use-timer-backend.ts`, `apps/desktop/src/hooks/use-timer-backend.ts`, `apps/mobile/app/hooks/use-timer-backend.ts` (adaptadores; añaden 1 query cada uno)
- `packages/hooks/src/hooks.ts:849-913` (`useStopTimer` invalida `allTimerHistory`; `useSessionHistory`, `useTimerStats`)
- `apps/backend/src/repositories/timer.repository.ts:254-301` (`findWithFilters`: `startedAt desc` + `completedOnly`; leer, NO editar)
- Predecesor: `odd/tasks/014-pomodoro-engine.md` (contrato I1–I10; este doc añade I11–I12)

## Specs

S1. **Turno inicial derivado**: nueva prop opcional `lastClosedSession?: { type: TimerBackendMode; endedAt: string | Date; wasCompleted: boolean } | null` en el hook. Efecto de arranque: si no hay sesión activa Y no hay intención local pendiente, deriva el turno: última cerrada de HOY (día local por `endedAt`) → `nextMode(type, completedPomodoros)` del motor + duración correspondiente. Casos: WORK→BREAK (LONG si C%N==0), BREAK→WORK, cierre de ayer o null → WORK#1 (reset diario gratis), interrumpida (`wasCompleted=false`) → ignorada (= null). `CONTINUOUS` cerrada → WORK (volver a Pomodoro es el default sensato). Check: 6 tests nuevos en verde.
S2. **Adaptadores proveen el dato**: los 3 añaden `useSessionHistory({ completedOnly: true, limit: 1 })` y mapean `sessions[0] ?? null`. Sin cambios de firma hacia sus consumidores. Check: tsc/eslint limpios, baselines intactos.
S3. **Medianoche con app abierta**: vigilancia de día local en el hook: si `toDateString()` cambia y NO hay sesión activa → reset a WORK#1 (limpiar intención + extra optimista). Con sesión activa → no tocar (edge documentado, resuelve al cerrar). Check: test con fake timers cruzando 00:00 en ambos casos.
S4. **Sin regresiones**: suites engine 22/22 + hooks (22+N)/... verdes; gates CI-sim (build→check-types) verdes; lint 0 errores nuevos; backend untouched.

Fuera de alcance: chips de fase clicables (Fase 3 del plan, decisión pendiente del usuario); migraciones/endpoints; notificaciones push; realtime multi-device.

## Contrato añadido (extiende I1–I10 de 014)

- I11. Reiniciar sin sesión activa restaura el turno correcto según la última fase cerrada hoy (nunca pierde un descanso ganado).
- I12. Al día siguiente (reapertura o medianoche sin sesión) el ciclo arranca en WORK #1.

## Allowed edit surfaces

- `packages/hooks/src/use-timer-backend.ts` + `packages/hooks/src/__tests__/use-timer-backend.test.tsx`
- `apps/web/src/hooks/use-timer-backend.ts`
- `apps/desktop/src/hooks/use-timer-backend.ts`
- `apps/mobile/app/hooks/use-timer-backend.ts`
- `odd/tasks/015-phase-persistence.md` (este doc)
- `docs/planning/roadmap.md` (solo fila ODD 015)

## Verification

- `cd packages/hooks && npx vitest run src/__tests__/use-timer-backend.test.tsx` → verde (28 tests: 22 + 6 S1... ajustar cuenta real)
- `cd packages/core && npx jest src/timer --runInBand --coverage=false` → 22/22
- Rebuild local dists (core/hooks) + `npx tsc --noEmit` en hooks/web/desktop/mobile → baselines intactos
- `npx eslint` en archivos tocados → 0 errores
- Gates raíz (padre, CI-sim): `npm run build` → `npm run check-types`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| P1 | S1+S2 | Turno derivado + 6 tests + 3 adaptadores | inline | done | `9ebddc68` — 8 tests (6+2 guards), suite 30/30→32/32, tsc 0 |
| P2 | S3 | Vigilancia medianoche + 2 tests | inline | done | `b68e9e5b` — 32/32 en GMT-11/-6/+14, tsc 0, lint 0 |
| P3 | S4 | Gates + PR + CI + merge + limpieza | inline | done | build 16/16, check 15/15, suites 159+22+1060, lint 0 |

## Log

L1. "tenia uno terminado y era el turno de descanso, pero por los restart se perdio y regreso a Pomodoro, pero contando correctamente que es el pomodoro 2... tendria que mantener el tipo persistentemente pero resetar al final del dia" + "planeamos muy bien esta solucion... arrancamos" (usuario 2026-10-20). Fase 3 (chips clicables) propuesta, sin decisión del usuario.
L2. P1 done 2026-10-20: prop `lastClosedSession` + efecto derivación (`nextMode` con count-1 para WORK, evita doble-conteo) + guard `hasInteractedRef`. 3 adaptadores con `useSessionHistory({completedOnly, limit:1})` (+1 línea firma móvil). 8 tests (6 plan + llegada-tardía + no-pisar-interacción). Suite 30/30; tsc 0 (tras rebuild dists locales); eslint 0. Commit `9ebddc68`.
L3. P2 done 2026-10-20: watcher 30s, reset WORK#1 al cambiar día sin sesión/corriendo; ciclo activo intacto. Tests con fechas relativas + `beforeEach` a mediodía local: 32/32 en GMT-11, GMT-6, GMT+14 (absolutas UTC fallaban en zonas extremas — `toDateString` es local). tsc 0, lint 0, suite hooks 159/159. Commit `b68e9e5b`.
L4. P3 done 2026-10-20: gates CI-sim verdes (build 16/16, check-types 15/15, hooks 159/159, engine 22/22, backend 1060/1060, lint 0 nuevos). Incidente: `tsconfig.tsbuildinfo` corrupto en api-client generaba dist sin AgentJob (código del otro chat) → rebuild limpio (`rm -rf dist tsbuildinfo`) lo resolvió; dists NO commiteados.
