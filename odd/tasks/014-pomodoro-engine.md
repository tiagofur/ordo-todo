# ODD: Motor Pomodoro unificado (un solo motor, un solo contador, un solo reloj)

Objective: reparar de raíz el Pomodoro roto (al completar WORK resetea a 25:00 en vez de pasar a descanso; contador divergente) unificando los 4 motores actuales en un único motor de ciclo puro + un único hook compartido por web/desktop/móvil, con el backend como fuente de verdad y cobertura de tests en cada transición.
Branch: `feature/pomodoro-engine` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; web primero, luego desktop, luego móvil (blast radius incremental); test-first para cada transición; ningún cambio en backend salvo que un S# lo pida explícitamente.
Test runner: Jest para el motor (`packages/core`, `testMatch: **/test/**/*.test.ts`); Vitest para hooks/UI (`packages/hooks`, `packages/stores`, apps).

## Context (leer primero — presupuesto: estos paths, nada más)

- `packages/core/src/timer/` (`index.ts`, `model/time-session.entity.ts`, `provider/timer.repository.ts`, `usecase/*.usecase.ts`)
- `packages/core/src/shared/constants/timer.constants.ts` (tipos canónicos actuales)
- `packages/core/jest.config.js` (`testMatch: **/test/**/*.test.ts`; ejemplo: `packages/core/src/focus/test/`)
- `packages/hooks/src/use-timer.ts` (Motor B, muerto — nadie lo importa; referencia de lógica, NO editar)
- `packages/hooks/src/hooks.ts:830-912` (`useActiveTimer`/`useStopTimer` reales vía React Query)
- `packages/stores/src/timer-store.ts` (Motor A zustand; referencia del ciclo correcto)
- `apps/web/src/hooks/use-timer-backend.ts` (Copia C-web; bug sync-reset en efecto líneas ~116-155)
- `apps/desktop/src/hooks/use-timer-backend.ts` (Copia C-desktop; countdown→`stop()` directo, sin transición)
- `apps/mobile/app/hooks/use-timer-backend.ts` (Copia C-móvil)
- `apps/web/src/components/providers/timer-settings-provider.tsx` (fuente de config web)
- `apps/backend/src/timers/timers.service.ts` (`getActive`/`stop`: fuente de verdad backend — leer, NO editar en T1-T5)
- Diagnóstico previo: conversación 2026-10-19/20 (revisión profunda Pomodoro; 4 motores, doble provider desktop, 5×P0/4×P1)

## Specs

S1. **Motor de ciclo puro en `@ordo-todo/core`**: módulo `packages/core/src/timer/engine/` sin React, sin Node builtins, sin I/O: `nextMode(mode, completedPomodoros, config)`, `completePhase(mode, completedPomodoros, config)` (devuelve `{ nextMode, completedPomodoros, durationSeconds }`), `remainingSeconds(session, now, config)`, `applyConfigChange(state, newConfig)` (no rompe ciclo activo: solo afecta a fases futuras). Tipos `EngineMode = 'WORK'|'SHORT_BREAK'|'LONG_BREAK'`, `EngineConfig` con validación de límites (`TIMER_LIMITS`). Check: invariantes I1-I4, I10 del contrato verificadas por tests (ver T1).
S2. **Hook único compartido**: UN `useTimerBackend` en `@ordo-todo/hooks` que reemplaza las 3 copias; adaptadores de plataforma (toast/sonido/storage) inyectados por props, cero imports de app. Corrige sync-reset con "intención local": tras transición sin autoStart, ausencia de sesión backend NO resetea a WORK. Corrige desktop: transición real al expirar, contador, LONG_BREAK, notificaciones, `switchTask` llama al backend. Check: síntoma original (WORK→25:00) reproducido en test pre-fix y verde post-fix; skip manual y stop-en-break según contrato.
S3. **Desktop: un solo dueño**: el timer visible (Motor C unificado) es el único dueño; tray/atajos/mini-timer/Settings hablan con él vía `desktopBridge` (no con Motor A); eliminar el `TimerProvider` duplicado (`providers/index.tsx` vs `ProtectedRoute.tsx` — uno solo); Settings escribe preferencias backend. Check: atajos globales y Settings afectan al timer visible; una sola instancia (un intervalo, una llamada backend al completar).
S4. **Contador único desde backend**: `completedPomodoros` deriva de sesiones WORK completadas hoy vía API (nuevo selector o reutilizar `timerStats`/`getActive`-extendido); eliminar localStorage/AsyncStorage/useState divergentes en las 3 apps. Check: número en timer == número en estadísticas, en web/desktop/móvil, antes y después de medianoche (reset diario).
S5. **Reloj robusto + background**: countdown por `endsAt` (timestamp objetivo) en vez de `prev - 1`; sobrevive throttling de `setInterval` en pestaña oculta/app minimizada; completar el trabajo de `apps/mobile/app/lib/hooks/__tests__/use-background-timer.hook.test.ts` si su hook no existe; notificación al completar en background. Check: ciclo WORK→break correcto con app minimizada durante un pomodoro completo (test con fake timers + QA manual).
S6. **Móvil al motor único**: `focus-mode.tsx` migra al hook unificado (hoy usa Motor A cuyo intervalo nadie arranca en móvil → congelado); `timer.tsx` elimina config hardcodeada 25/5/15/4 y lee preferencias. Check: focus-mode avanza/cuenta/respeta ajustes; timer refleja cambios de Settings.
S7. **Limpieza y unificación de tipos**: eliminar Motor B muerto (`packages/hooks/src/use-timer.ts` + sus tests) solo DESPUÉS de que T2 migre las 3 apps; verificar y eliminar Motor D (`apps/desktop/src/hooks/use-timer.ts`) si huérfano; UN solo `TimerMode`/`TimerType` canónico (extender `timer.constants.ts`), resto re-exportan. Check: un `grep` encuentra una sola definición; `npm run check-types` verde; cero imports rotos.

Fuera de alcance: reescritura del backend de timers (sano); nuevas features (auto-scheduling 005, ritual 006); cambios de UI/visuales salvo wiring; sonido/notificaciones nuevas (solo reconectar las existentes).

## Contrato del Pomodoro (invariantes — toda T# debe preservarlas)

- I1. Al completar WORK → modo BREAK con su duración (nunca WORK/25:00).
- I2. Descanso largo exactamente cada N pomodoros (N configurable).
- I3. Contador visible = WORK completados hoy según backend.
- I4. Stop durante descanso → descanso reseteado, no salto a WORK.
- I5. Pausar no pierde tiempo; reanudar continúa donde quedó.
- I6. Sin sesión activa y sin intención local → estado inicial limpio.
- I7. Una sola instancia del timer por plataforma; un solo provider.
- I8. Sonido + notificación al completar cada fase (si habilitados).
- I9. Cerrar la app a mitad de pomodoro no pierde el ciclo al reabrir.
- I10. Cambiar ajustes no rompe un ciclo activo.

## Allowed edit surfaces

- `packages/core/src/timer/engine/` (nuevo: motor puro + `test/*.test.ts`)
- `packages/core/src/shared/constants/timer.constants.ts` (solo para S7: tipos canónicos)
- `packages/core/src/timer/index.ts` (solo re-export del engine)
- `packages/hooks/src/use-timer-backend.ts` (nuevo: hook único) + `packages/hooks/src/index.ts` (re-export)
- `packages/hooks/src/use-timer.ts` + `packages/hooks/src/__tests__/use-timer.test.ts` (solo S7: eliminación)
- `apps/web/src/hooks/use-timer-backend.ts` (S2: adelgazar a re-export/adaptador o eliminar)
- `apps/desktop/src/hooks/use-timer-backend.ts` (S2: idem) + `apps/desktop/src/hooks/use-timer.ts` (S7: verificar/eliminar)
- `apps/mobile/app/hooks/use-timer-backend.ts` (S2: idem)
- `apps/desktop/src/contexts/timer-context.tsx`, `apps/desktop/src/components/providers/index.tsx`, `apps/desktop/src/components/auth/ProtectedRoute.tsx`, `apps/desktop/src/hooks/use-electron.ts`, `apps/desktop/src/pages/Settings.tsx`, `apps/desktop/src/stores/timer-store.ts` (solo S3)
- `apps/mobile/app/screens/(internal)/timer.tsx`, `apps/mobile/app/screens/(internal)/focus-mode.tsx` (solo S6; + background hook si S5 lo crea)
- `apps/web/src/components/providers/timer-provider.tsx` (solo wiring al hook único, sin lógica nueva)
- `docs/planning/roadmap.md` (solo añadir fila ODD 014)

## Verification

- Motor: `cd packages/core && npx jest src/timer --runInBand` → verde (testMatch `**/test/**/*.test.ts`)
- Hooks: `cd packages/hooks && npx vitest run` → verde
- Tipos: `npm run check-types` (raíz) → 0 errores
- Lint: `npm run lint` → sin nuevos warnings en superficies tocadas
- Reproducción del síntoma (pre-T2): test RED que simula WORK→0 y espera SHORT_BREAK/5:00 (falla en las 3 copias actuales por sync-reset/desktop-stop)
- Gates raíz (padre): `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Motor puro `timer/engine/` + suite del contrato (I1,I2,I4,I10) | inline | done | `554d2667` — 22/22 Jest GREEN, tsc build OK |
| T2a | S2 | Hook único en `@ordo-todo/hooks` + test RED→GREEN del síntoma | inline | done | `085d7144` — 15/15 Vitest GREEN (suite 150/150), tsc OK |
| T2b | S2 | Migrar web al hook único (provider + settings wiring) | inline | done | `a2d5c9ea` — adaptador 125 líneas (-429), tsc/eslint limpios, provider intacto |
| T2c | S2 | Migrar desktop al hook único (transición+contador+LONG_BREAK+notif+switchTask) | inline | done | `d8f23d37` — adaptador 154 líneas (-224), tsc 1 preexistente antes/después, eslint limpio |
| T2d | S2 | Migrar móvil-timer al hook único | inline | pending | — |
| T3 | S3 | Desktop: dueño único + eliminar provider duplicado (tray/atajos/mini/Settings al hook) | inline | pending | — |
| T4 | S4 | Contador único desde backend (eliminar storages divergentes) | inline | pending | — |
| T5 | S5 | Reloj por `endsAt` + background (móvil/web minimizada) | inline | pending | — |
| T6 | S6 | Móvil focus-mode al hook único + config desde preferencias | inline | pending | — |
| T7 | S7 | Limpieza: eliminar motores muertos + tipos canónicos únicos | inline | pending | — |
| T8 | — | QA de excelencia: matriz manual por plataforma + checklist del contrato | inline | pending | — |

## Log

L1. "el sistema de Pomodoro no esta funcionando correctamente, porque solo pasa los 25 minutos y al terminar no cambia a descanso, no cambia el tiempo al de descanso, solo resetea los 25 minutos por ejemplo, no cuenta correctamente los pomodoros, en fin, un desastre TOTAL..." + "revisa y crea un plan de excelencia para la funcion de pomodoro" + "creamos un nuevo worktree y arrancamos con la solucion del Pomodoro, si prefieres documentar primero y crear los planes de ODD adelante, empezamos y vamos planeando tarea por tarea ante de hacerla" (mensajes del usuario 2026-10-19/20).
L2. T1 done 2026-10-20: `timer/engine/` (types+engine+index) + `test/engine.test.ts` (22 tests, I1/I2/I4/I5/I10). TDD RED→GREEN. `npx jest src/timer` 22/22; `tsc -p tsconfig.build.json` 0 errores. Commit `554d2667`.
L3. T2a done 2026-10-20: `packages/hooks/src/use-timer-backend.ts` (hook único) + `__tests__/use-timer-backend.test.tsx` (15 tests). Fix sync-reset vía `pendingModeRef` (intención local); tick con `timeLeftRef` propio (batching React 18+). Suite hooks 150/150 GREEN; `tsc --noEmit` OK (tras rebuild local de core dist, no commiteado). Commit `085d7144`.
L4. T2b done 2026-10-20: `apps/web/src/hooks/use-timer-backend.ts` reescrito como adaptador fino (478→125 líneas). Toasts/sonidos preservados. `timer-provider.tsx` intacto (firma compatible). tsc: 9 errores preexistentes antes y después (dists ui/api-client), 0 en timer; eslint limpio. Commit `a2d5c9ea`.
L5. T2c done 2026-10-20: `apps/desktop/src/hooks/use-timer-backend.ts` reescrito como adaptador (269→154 líneas). Gana: transición al expirar, contador, LONG_BREAK, notificaciones nativas, switchTask real, pauseCount real (contexto: eliminada línea `pauseCount: 0`). Tray sync preservado. tsc: 1 preexistente antes/después (parse-task); eslint limpio. Commit `d8f23d37`.