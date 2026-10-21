# Paridad por plataforma (web / desktop / móvil)

> **Última actualización**: 2026-10-21
> **Regla**: cada celda describe lo que existe en `main` hoy. ✅ existe (UI funcional conectada al backend) · ⚠️ parcial (existe a medias o en parte de la plataforma) · ❌ no existe. Cada ⚠️/❌ enlaza a su ODD o al roadmap. Ver [`promises-audit.md`](../vision/promises-audit.md) §E y [visión](../vision/product-vision.md) (criterios de éxito).

## Matriz

| Feature | Web | Desktop (Tauri) | Móvil (Expo) |
|---|---|---|---|
| Tareas CRUD + proyectos | ✅ | ✅ | ✅ |
| Captura rápida + paleta de comandos | ✅ (`command-palette.tsx`, `quick-add-dialog.tsx`) | ✅ (`QuickAddTask.tsx`, paleta en `MainLayout`) | ❌ sin Quick-Add global ni paleta ([007](../../odd/tasks/007-omnipresent-capture.md) cubre web/desktop; móvil pendiente) |
| Calendario día + time-blocks | ✅ (`(pages)/calendar`) | ✅ (`pages/Calendar.tsx`) | ✅ (tab `calendar.tsx`) |
| Pomodoro / timer | ✅ (`components/timer`, `components/focus`) | ✅ (`components/timer/pomodoro-timer.tsx`) | ⚠️ timer backend + pantalla timer, sin Pomodoro UI dedicada ([014](../../odd/tasks/014-pomodoro-engine.md)) |
| Ritual diario (mañana/cierre/racha) | ✅ (`/ritual`, ODD 006) | ⚠️ diálogo legacy (`daily-ritual-dialog.tsx`), sin vista ritual nueva ([006](../../odd/tasks/006-daily-ritual.md)) | ✅ (pantalla ritual, paridad S6) |
| Mi plan de hoy (scheduling) | ✅ (`/plan`, ODD 005) | ❌ sin vista de plan ([005](../../odd/tasks/005-auto-scheduling.md) web-first) | ❌ sin vista de plan ([005](../../odd/tasks/005-auto-scheduling.md) web-first) |
| Hábitos | ✅ (`(pages)/habits`) | ✅ (`pages/Habits.tsx`) | ✅ (tab `habits.tsx`) |
| Modo foco / wellbeing | ✅ | ✅ (`FocusMode.tsx`, score) | ✅ (`focus-mode.tsx`) |
| Offline + cola de sync | ⚠️ `offline-storage.ts`, `sync-store.ts`, `conflict-resolver.ts`; SW/push completos no verificados | ✅ SQLite + sync engine + last-write-wins + indicador 🟢🟡🔴 | ⚠️ `AsyncStorage` + `NetInfo`, sin cola de sync equivalente |
| Push / notificaciones | ✅ (`use-push-notifications`) | ✅ (notificaciones nativas vía bridge) | ✅ (push + socket `use-notifications-socket`) |
| Colaboración tiempo real | ⚠️ presencia + comentarios, sin edición concurrente (sin Yjs/Liveblocks) | ⚠️ igual que web (mismo backend) | ⚠️ igual que web (mismo backend) |
| Atajos de teclado | ✅ mapa canónico en [`shortcuts.md`](./shortcuts.md) | ✅ mismo mapa (Tauri) | ❌ n/a (táctil; sin atajos físicos) |

## Notas

- "Sin edición concurrente" es decisión de producto, no deuda: ver [product-vision.md](../vision/product-vision.md) (no-metas).
- Esta matriz se revisa cada vez que una plataforma gana o pierde una capacidad; el dueño es ODD 013 ([`013-marketing-docs-cleanup.md`](../../odd/tasks/013-marketing-docs-cleanup.md)).
