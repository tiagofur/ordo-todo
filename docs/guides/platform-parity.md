# Paridad por plataforma (web / desktop / móvil)

> **Última actualización**: 2026-10-21
> **Regla**: cada celda describe lo que existe en `main` hoy. ✅ existe (UI funcional conectada al backend) · ⚠️ parcial (existe a medias o en parte de la plataforma) · ❌ no existe. Cada ⚠️/❌ enlaza a su ODD o al roadmap. Ver [`promises-audit.md`](../vision/promises-audit.md) §E y [visión](../vision/product-vision.md) (criterios de éxito).

## Matriz

| Feature | Web | Desktop (Tauri) | Móvil (Expo) |
|---|---|---|---|
| Tareas CRUD + proyectos | ✅ | ✅ | ✅ |
| Captura rápida + paleta de comandos | ✅ (`command-palette.tsx`, `quick-add-dialog.tsx`) | ✅ (`QuickAddTask.tsx`, paleta en `MainLayout`) | ⚠️ FAB + borrador `?text=` (007 S6 done); sin paleta equivalente ([007](../../odd/tasks/007-omnipresent-capture.md)) |
| Calendario día + time-blocks | ✅ (`app/[locale]/(pages)/calendar`) | ✅ (`pages/Calendar.tsx`) | ✅ (tab `calendar.tsx`) |
| Pomodoro / timer | ✅ (`components/timer`, `components/focus`) | ✅ (`components/timer/pomodoro-timer.tsx`) | ✅ (`ui-mobile` `pomodoro-timer.tsx` + pantalla timer, motor 014) |
| Ritual diario (mañana/cierre/racha) | ✅ (`app/[locale]/(pages)/ritual`, ODD 006) | ⚠️ diálogo legacy (`daily-ritual-dialog.tsx`), sin vista ritual nueva ([006](../../odd/tasks/006-daily-ritual.md)) | ✅ (pantalla ritual, paridad S6) |
| Mi plan de hoy (scheduling) | ✅ (`app/[locale]/(pages)/plan`, ODD 005) | ❌ sin vista de plan ([005](../../odd/tasks/005-auto-scheduling.md) web-first) | ❌ sin vista de plan ([005](../../odd/tasks/005-auto-scheduling.md) web-first) |
| Hábitos | ✅ (`app/[locale]/(pages)/habits`) | ✅ (`pages/Habits.tsx`) | ✅ (tab `habits.tsx`) |
| Modo foco / wellbeing | ✅ | ✅ (`pages/FocusMode.tsx`, score) | ✅ (`focus-mode.tsx`) |
| Offline + cola de sync | ⚠️ `stores/sync-store.ts`, `lib/offline-storage.ts`, `lib/conflict-resolver.ts`; SW/push completos no verificados ([roadmap](../planning/roadmap.md)) | ✅ SQLite + sync engine + last-write-wins + indicador 🟢🟡🔴 | ⚠️ `AsyncStorage` + `NetInfo`, sin cola de sync equivalente ([roadmap](../planning/roadmap.md)) |
| Push / notificaciones | ⚠️ hook + SW local, sin suscripción server ni backend push/VAPID ([roadmap](../planning/roadmap.md)) | ⚠️ notificaciones nativas vía bridge (locales, sin push remoto) ([roadmap](../planning/roadmap.md)) | ⚠️ socket + notificaciones locales programadas (sin push remoto FCM/APNs) ([roadmap](../planning/roadmap.md)) |
| Colaboración tiempo real | ⚠️ presencia + comentarios, sin edición concurrente ([visión: no-metas](../vision/product-vision.md)) | ⚠️ igual que web (mismo backend) ([visión: no-metas](../vision/product-vision.md)) | ⚠️ igual que web (mismo backend) ([visión: no-metas](../vision/product-vision.md)) |
| Atajos de teclado | ✅ mapa canónico en [`shortcuts.md`](./shortcuts.md) | ✅ mismo mapa (Tauri) | ❌ n/a táctil por diseño (ver [`shortcuts.md`](./shortcuts.md): alcance web/desktop) |

## Notas

- "Sin edición concurrente" es decisión de producto, no deuda: ver [product-vision.md](../vision/product-vision.md) (no-metas).
- Esta matriz se revisa cada vez que una plataforma gana o pierde una capacidad; el dueño es ODD 013 ([`013-marketing-docs-cleanup.md`](../../odd/tasks/013-marketing-docs-cleanup.md)).
