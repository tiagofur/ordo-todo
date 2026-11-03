# ODD 043 — Desktop review + build local

Objetivo: review completo de la app desktop (como el web) y build local sin firmar para BETA.
Rama: feat/043-desktop-review. Runner: suites con vitest (`--ui=false` en desktop), `tsc --noEmit`, `vite build`, `tauri build`.

## Specs

- S1 (review): "Review + build local" — review completo del desktop espejando el web (paquetes compartidos, sync, consistencia visual, gates).
- S2 (gates base, verificado): `tsc` limpio y suite 117/117 en `apps/desktop` antes de tocar nada.
- S3 (build): bundle local macOS sin firmar para prueba manual (Gatekeeper: apertura con clic derecho).
- S4 (commits): work-unit commits con tests/docs junto al código, Conventional Commits, sin push sin OK.

## Tasks

- [x] T1 — Review paquetes compartidos: DesktopApiClient podado a genuinos desktop (1c835478 tipos meeting a verdad backend, 56b23eec poda) [S1]
- [x] T2 — Review wiring sync: desktop ya usa createSyncEngine + createConflictRegistry de @ordo-todo/stores — nada que migrar [S1]
- [x] T3 — Review visual: Auth→primary, project cards→emerald, popover→primary; planes/strength categóricos (84835dc3, detector limpio) [S1]
- [x] T4 — Fixes: poda api-client + meeting.types + api-client.test.ts (4 tests) + T3 — tsc limpio, 121/121 desktop [S1,S4]
- [x] T5 — Build local: `vite build` verde, `tauri build` genera Ordo-Todo.app (13 MB, binario firmado ad-hoc); DMG falla por sandbox (hdiutil sin permiso crear imágenes) — límite entorno, no código. Humo manual pendiente usuario (clic derecho → Abrir) [S3,S4]

## Log

- L1 (usuario, verbatim): "seguimos" → frente desktop. Pregunta: "¿Review completo del desktop (como el web) y luego build local sin firmar, o directo al build?" Respuesta (verbatim): "Review + build local (Recomendado)".
- L2: base verificada en rama (tsc limpio, 117/117). Mirror Engram: pendiente (sin herramientas MCP en esta sesión).
