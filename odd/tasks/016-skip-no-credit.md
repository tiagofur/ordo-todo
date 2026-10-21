# ODD: Skip sin crédito — cerrar la trampa de farmear pomodoros

Objective: que saltar/abandonar una fase antes del 80% NO acredite pomodoro, XP ni métricas — en skip manual, chips de fase y (ya lo hace) stop manual.
Branch: `fix/skip-no-credit` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; test-first en hook; un solo PR directo a main.
Test runner: Vitest (`packages/hooks`, `packages/ui`).

## Context (leer primero — presupuesto: estos paths, nada más)

- `packages/hooks/src/use-timer-backend.ts` (`skipToNext` ~427, `goToPhase` ~502, `getProgress`, `notify.sessionComplete`)
- `packages/hooks/src/__tests__/use-timer-backend.test.tsx` (suite 36 tests)
- `packages/ui/src/components/timer/pomodoro-timer.tsx` (diálogo skip, `needsSkipConfirm`, labels)
- `packages/ui/src/components/dashboard/dashboard-timer-widget.tsx` (`onSkip`, chips `onPhaseSelect`)
- `packages/ui-mobile/src/components/timer/pomodoro-timer.tsx` (`Alert.alert` skip)
- `packages/core/src/shared/constants/timer.constants.ts` (`SKIP_CREDIT_THRESHOLD`)
- `apps/backend/src/timers/timers.service.ts:174-260` (stop: tolera sin-sesión, gatea XP/métricas por `wasCompleted`; leer, NO editar)
- Predecesores: `odd/tasks/014-pomodoro-engine.md` (I1–I10), `odd/tasks/015-phase-persistence.md` (I11–I12)

## Specs

S1. **Crédito por progreso en el hook**: `skipToNext` y `goToPhase` calculan `earned = getProgress() >= SKIP_CREDIT_THRESHOLD (80)` sobre la fase que se abandona. `api.stop({ wasCompleted: earned })`; `optimisticExtra+1` y `notify.sessionComplete` solo si `earned && mode===WORK` (para BREAK: `notify` solo si earned). Expiración natural intacta (siempre `true`). Umbral en `timer.constants.ts` exportado. Check: tests RED→GREEN (ver Tareas).
S2. **Diálogo skip con texto dinámico**: `pomodoro-timer.tsx` (web/desktop, 2 variantes) muestra `skipConfirmDescriptionNoCredit` ("Saltar ahora no contará como pomodoro completado.") cuando `progress < 80`, si no la descripción actual. Móvil igual en `Alert.alert`. Check: tests UI.
S3. **Confirmación en dashboard widget**: `dashboard-timer-widget.tsx` `onSkip` (botón ⏭️) confirma con la misma regla 80% (Dialog pequeño inline; reutiliza labels). Chips llaman `goToPhase` directo (ya nunca acreditan de más por S1; el hook decide). Check: tests UI.
S4. **Sin regresiones**: suites hooks/ui verdes; tsc/eslint 0 nuevos; backend untouched; CI verde.

Fuera de alcance: cambiar `stop(false)` (ya manda false); gamificación (respeta wasCompleted); push/background.

## Contrato añadido (extiende I1–I12)

- I13. Abandonar una fase (skip/chip/stop) con <80% completado NO acredita pomodoro, XP, métricas ni racha.
- I14. Abandonar con ≥80% o por expiración SÍ acredita (redención + completitud natural).

## Allowed edit surfaces

- `packages/core/src/shared/constants/timer.constants.ts` (solo añadir `SKIP_CREDIT_THRESHOLD`)
- `packages/hooks/src/use-timer-backend.ts` + `packages/hooks/src/__tests__/use-timer-backend.test.tsx`
- `packages/ui/src/components/timer/pomodoro-timer.tsx` (+ test existente)
- `packages/ui/src/components/dashboard/dashboard-timer-widget.tsx` (+ test existente)
- `packages/ui-mobile/src/components/timer/pomodoro-timer.tsx`
- `packages/i18n/src/locales/{es,en,pt-br}.json` (solo claves skip/chips)
- `odd/tasks/016-skip-no-credit.md` + `docs/planning/roadmap.md` (fila)

## Verification

- `cd packages/hooks && npx vitest run src/__tests__/use-timer-backend.test.tsx` → verde (36+6)
- `cd packages/ui && npx vitest run src/components/timer/pomodoro-timer.test.tsx src/components/dashboard/dashboard-timer-widget.test.tsx` → verde
- `npx tsc --noEmit` hooks/ui/ui-mobile/web/desktop/mobile → 0 (tras rebuild dists locales)
- `npx eslint` archivos tocados → 0 errores
- Gates raíz (padre, CI-sim): `npm run build` → `npm run check-types`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| C1 | S1 | Umbral core + hook acredita-por-progreso + 6 tests | inline | done | `3834312d` — SKIP_CREDIT_THRESHOLD, timeLeftRef hoisted, suite 39/39 |
| C2 | S2+S3 | Diálogo dinámico + confirm dashboard + móvil + tests UI + i18n | inline | done | `3834312d` — copy no-credit, dashboard confirm, móvil Alert, ES/EN/PT, 16 UI |
| C3 | S4 | Gates + PR + CI + merge + limpieza + memoria | inline | in_progress | gates verdes, PR pendiente |

## Log

L1. "si cambio de pomodoro a descanso en los chips que ahora son botones, cuenta 1 pomodoro como completado... incluso el skip debia de no contar como 1 pomodoro" + "proceda" (usuario 2026-10-20). Umbral 80% aprobado (consistente con diálogo #303).
L2. C1 done 2026-10-20: `SKIP_CREDIT_THRESHOLD=80` en core; `computeEarnsCredit()` con `timeLeftRef` hoisted; `skipToNext` acredita solo si earned (stop+optimistic+notify gateados); `goToPhase` WORK-exit siempre interrumpido (detenido ⇒ 0% — simplificado tras descubrir que stop resetea). Tests viejos de farm reescritos a I13/I14. Suite hooks 39/39.
L3. C2 done 2026-10-20: diálogo skip muestra copy no-credit (único caso que aparece); UI importa el umbral de core (móvil mirror documentado); dashboard skip confirma igual; wrappers dashboard pasan 4 labels nuevas; i18n ES/EN/PT (`skipConfirm.descriptionNoCredit`, `skipConfirmTitle`, `Timer.cancel`). Tests UI 16/16 (+mock threshold en vitest.setup). Commit único `3834312d` (18 files, +353/−41).
L4. Gates 2026-10-20: build 16/16, check-types 15/15, hooks 39/39 (suite 163), engine 22/22, backend suite verde, tsc/eslint 0 en superficies. Incidente conocido: `tsbuildinfo` api-client corrupto → `rm -rf dist tsbuildinfo` + rebuild (código ajeno ODD 004, dists NO commiteados).
