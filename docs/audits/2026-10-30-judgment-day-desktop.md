# Judgment Day — Auditoría de la app desktop (ledger congelado)

- **Fecha**: 2026-10-30
- **Target identity (sha256 de `git archive HEAD apps/desktop`)**: `669ecec12ddab5e72694bdc61b20e1daf6b7b20b92878948c4e366d2789046c9`
- **Commit congelado**: `0fec8df9c633cd991c2f5173b8115d9b7be8f09f` (main; apps/desktop limpio)
- **Scope congelado**: `apps/desktop/**` — lado Rust/Tauri (src-tauri: main.rs, lib.rs, capabilities/default.json, tauri.conf.json, Cargo.toml) y lado webview (src, ~218 TS/TSX). Otros paquetes solo para verificar claims in-scope.
- **Skill resolution**: `paths-injected` — `impeccable` como criterio de craft en ambos jueces (workflow no aplica a jueces read-only).
- **Método**: dos jueces ciegos read-only, prompts idénticos; fusión y verificación puntual por el orquestador.
- **Ronda**: 1 completada; corrección en decisión.

## Resumen

| Estado | Total | Detalle |
|---|---|---|
| Confirmados (ambos jueces, CRITICAL) | **1** | KDE-001 |
| Sospechosos (un solo juez) | 7 | 2 CRITICAL, 3 WARNING, 2 SUGGESTION |
| Info (ambos jueces, no severos) | 5 | KDE-I01 … KDE-I05 |
| Contradicciones | 0 | — |

## Confirmado (CRITICAL, ambos jueces + verificación del orquestador)

| ID | Localización | Hallazgo | Prueba clave |
|---|---|---|---|
| KDE-001 | `apps/desktop/src/lib/oauth.ts:17-26`, `apps/desktop/src-tauri/Cargo.toml`, `tauri.conf.json`, `src/routes.tsx` | **OAuth Google/GitHub nunca completa en desktop**: la app abre el navegador del sistema con `platform=desktop`, el backend redirige a `ordo://auth/callback?access_token=...&refresh_token=...`, pero el shell Tauri no registra ese esquema — sin `tauri-plugin-deep-link` en Cargo.toml/tauri.conf.json/package.json, sin `onOpenUrl`, y el único receptor in-app (`OAuthCallbackHandler` + `useOAuthCallback` leyendo `window.location.search`) es código muerto sin mount. Los tokens se entregan a la nada y el usuario queda logged out; Auth.tsx además navega a /dashboard de inmediato y ProtectedRoute rebota a /auth. | Ambos jueces citan la misma cadena; grep de deep-link/onOpenUrl sin hits fuera del comentario de oauth.ts; el backend (verificación-only) redirige a ordo:// en auth.controller.ts:464; mobile SÍ implementó su mitad (apps/mobile/src/lib/deep-links.ts) |

## Sospechosos (un solo juez)

| ID | Juez | Severidad | Localización | Hallazgo |
|---|---|---|---|---|
| KDE-S01 | B | CRITICAL | `apps/desktop/src/contexts/timer-context.tsx:197-205` | `completeTask()` en Focus Mode envía `status: "DONE" as TaskStatus` — el enum real es TODO/IN_PROGRESS/COMPLETED/CANCELLED y el PATCH devuelve 400 sin feedback → "Completar tarea" falla siempre en silencio. **Verificado por el orquestador** (lectura directa). |
| KDE-S02 | B | CRITICAL | `apps/desktop/src/components/task/subtask-list.tsx:56-76` | Subtareas rotas en ambas direcciones: el toggle envía `status: "DONE" as any` → 400 con toast de error; y la lectura filtra `=== "DONE"` que nunca es true con datos del servidor ('COMPLETED') → progreso clavado en 0%. Montado en TaskDetailPanel (Dashboard/Tasks/Calendar). **Verificado por el orquestador**. |
| KDE-S03 | A | WARNING | `src-tauri/capabilities/default.json:22` | `global-shortcut:default` resuelve a un set vacío → register/unregister siempre denegados por la ACL: el Quick-Add global (⌘⇧N) y el toggle del Mini Timer (⌘⇧T) silenciosamente nunca funcionan (solo console.warn); la TitleBar sigue anunciando '⌘⇧T Timer'. |
| KDE-S04 | A | WARNING | `src-tauri/src/lib.rs:141-146` | Items del tray 'Start 25m Pomodoro' y 'Pause / Resume' emiten `tray-pomodoro-start/toggle` que nadie escucha en el webview → no hacen nada. |
| KDE-S05 | B | WARNING | `apps/desktop/src/hooks/use-speech-recognition.ts:109-114` | El reconocimiento de voz se aborta a sí mismo a mitad de captura: las deps del efecto incluyen onResult/onError y el consumidor pasa arrows inline → cada re-render (incluido el propio setInterimTranscript del hook) re-crea la instancia y aborta la dictación tras el primer interim result. |
| KDE-S06 | A | SUGGESTION | `apps/desktop/src/hooks/use-timer-backend.ts:202-209` | El broadcast del estado del timer hardcodea `progress: 0` → el anillo circular y la barra del mini-timer nunca avanzan. |
| KDE-S07 | A | SUGGESTION | `src-tauri/capabilities/default.json:19` | `opener:default` concede `allow-reveal-item-in-dir` que el webview nunca usa — más allá de least-privilege. |

## Info (ambos jueces coinciden; no severos — no elegibles para el fix actor)

| ID | Severidades | Localización | Hallazgo |
|---|---|---|---|
| KDE-I01 | WARNING/WARNING | `src-tauri/tauri.conf.json:38`, `src/routes.tsx` | La ventana Mini Timer carga `#/mini-timer` pero esa ruta no existe (la flotante vive en `#/timer/floating`) → tray/shortcut/bridge muestran el fallback 404 ('Página no encontrada' con link que navega fuera de la app) dentro de la ventana frameless de 280x130. |
| KDE-I02 | WARNING/SUGGESTION | `apps/desktop/src/lib/desktop-bridge.ts:163-179,357-386,401-430` | Carrera entre suscripción y limpieza de listeners Tauri: el unlisten capturado tras resolver la promesa puede quedar en closure muerta si el consumidor se desmonta antes → handlers duplicados acumulados (timer-context re-suscribe en cada cambio isRunning/isPaused). |
| KDE-I03 | SUGGESTION/SUGGESTION | `apps/desktop/src/components/quick-actions/QuickAddTask.tsx:2` | `useDispatch` de react-redux importado sin usar y SIN declarar en package.json del desktop — resuelve solo por hoisting del workspace (dep fantasma). |
| KDE-I04 | WARNING/SUGGESTION | `apps/desktop/src/pages/Auth.tsx` | Login/registro 100% hardcodeado en español (sin useTranslation) en app trilingüe; además el placeholder 'Mínimo 6 caracteres' contradice la regla real de 8+ con mayúscula/número/símbolo. |
| KDE-I05 | WARNING/SUGGESTION | `use-timer-backend.ts:134-158`, `NotificationPopover.tsx:13,40`, `sync-store.ts:116-132`, `TimerFloatingWindow.tsx`, `routes.tsx:194-210`, `QuickAddTask.tsx` | Clúster i18n de superficie: notificaciones nativas y toasts del timer en español fijo, fechas relativas con locale es de date-fns fijo, mini-timer/404 en español, Quick Add en inglés. |

## Notas del orquestador

- Ambos jueces verificaron la superficie IPC: los 6 comandos Rust coinciden con los invoke() del webview; sin over-grant relevante (salvo KDE-S07); CSP settled por PR #437 no re-reportado.
- Historia causal: la migración Electron→Tauri (6e02318a) dejó sin counterpart webview el deep-link, los shortcuts ACL-denied, los eventos del tray y la ruta del mini-timer.
- Los 2 sospechosos CRITICAL (KDE-S01/S02) fueron verificados por el orquestador leyendo el código: `status: "DONE"` está en el código exactamente como lo describe el juez B. Son fixes triviales (→ 'COMPLETED') pero NO son elegibles para el fix actor del proceso (un solo juez).

## Veredicto terminal

```yaml
target_identity: 669ecec12ddab5e72694bdc61b20e1daf6b7b20b92878948c4e366d2789046c9 (commit 0fec8df9, apps/desktop)
round: 1
confirmed: [KDE-001]                 # RESUELTO y verificado
suspect: [KDE-S01..KDE-S07]          # KDE-S01/S02 corregidos como edición ordinaria autorizada; resto sin fix
contradictions: []
info: [KDE-I01..KDE-I05]
fix_work_units: [KDE-001-deeplink-registration, KDE-S01-completed-status, KDE-S02-completed-status]
scoped_rejudgment: approved          # r1: {"findings":[]} de ambos jueces
terminal_state: approved
skill_resolution: paths-injected
```

**JUDGMENT: APPROVED ✅**

## Ronda 1 — corrección y re-juicio scopeado

**Fix actor**: 3 unidades, 9 archivos apps/desktop (+317/−13) + Cargo.lock, SIN COMMIT en rama `judgment-day/round1-fixes` (que también porta el delta backend de otro audit — boundaries separados por carpetas y patches). Delta congelado: `2026-10-30-judgment-day-desktop-fix-delta-r1.patch` (sha256 `1697d8cf18f6976c08a2b249099de824635a944f97f6df195e10ff812254d658`).

- **KDE-001**: vía preferida — `tauri-plugin-deep-link 2.6.3` + `tauri-plugin-single-instance 2.5.5` (feature deep-link), `plugins.deep-link.desktop.schemes: ["ordo"]` en tauri.conf.json (Info.plist en bundle), `register_all()` bajo `#[cfg(desktop)]`, comando `get_deep_link_urls` para cold start; webview: `onDeepLinkUrl`/`getDeepLinkLaunchUrls`/`isMainWindow` en desktop-bridge (con cancelled-flag, mejora parcial sobre la carrera KDE-I02 sin tocar listeners existentes), efecto deep-link en use-oauth-callback.ts reusando handleAuthCallback/storeOAuthTokens (dedupe cold-start+live), OAuthCallbackHandler montado vía pathless layout route (válido en react-router 7.18), mini-timer window excluida. 7 tests nuevos.
- **KDE-S01**: timer-context.tsx `status: "COMPLETED"` (cast eliminado, import TaskStatus retirado).
- **KDE-S02**: subtask-list.tsx sin ningún "DONE" restante — escritura `COMPLETED`, guard `!== "COMPLETED"`, lecturas 74/114/127/137.

**Verificación del fix actor**: `cargo check` PASS sin warnings; `tsc --noEmit` PASS; vitest desktop 108/108 (incl. 7 nuevos); eslint en tocados 0 errores (+1 floating-promise idéntico al estilo del archivo).

**Re-juicio scopeado (ambos jueces, ledger + delta r1)**: `{"findings":[]}` de ambos. Verificaron: orden de registro single-instance→deep-link conforme a docs del plugin, capabilities existentes cubren el listen (`core:event:allow-listen` para main+timer), routes array byte-idéntico (solo extracción + wrapper), handler montado exactamente una vez, dedupe y guards correctos, COMPLETED válido contra el union TaskStatus y UpdateTaskDto. Nota no-bloqueante documentada: el `invalidateQueries(['currentUser'])` pre-existente no matchea la query key real — no es defecto del fix porque navigate→ProtectedRoute re-fetchea al montar.

**Verificación final independiente (orquestador)**: `git diff -- apps/desktop` = sha256 `1697d8cf…` = patch congelado; vitest 108/108 PASS; check-types limpio.

## Residuales y verificación humana pendiente (owner)

1. **El flujo OAuth real exige rebuild + reinstalación**: el esquema ordo:// se registra en el Info.plist de la app bundleada (no vive en `tauri dev`); macOS pedirá permiso la primera vez que el navegador intente abrir ordo://. Verificar `tauri build` → instalar → login Google/GitHub.
2. Flujos Slack/calendar en vuelo del backend ya cubiertos en su audit; nada nuevo aquí.
3. Otros `"DONE"` defensivos detectados fuera de boundary (project-card, Projects, ProjectDetail, Tasks, Eisenhower, TasksPeriod) son OR-checks muertos-inofensivos; `TasksPeriod.tsx:94` tiene un `case "DONE":` genuinamente muerto — candidatos a limpieza en un PR ordinario.
4. `"test:watch"` duplicado en apps/desktop/package.json (líneas 23/27) — cosmético, sin tocar.
