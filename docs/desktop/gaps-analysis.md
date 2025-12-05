# 🔍 Análisis de Brechas: Desktop vs Web

**Fecha de Análisis**: 2025-12-04  
**Estado**: Actualizado con estado real del código

---

## 📊 Resumen Ejecutivo

| Categoría | Web | Desktop | Estado |
|-----------|-----|---------|--------|
| **Project Components** | 11 archivos | 2 archivos | 🔴 **9 faltantes** |
| **Task Detail Components** | 15 archivos | 9 archivos (5 stubs) | 🔴 **Stubs sin implementar** |
| **Workspace Components** | 11 archivos | 3 archivos | 🟡 **8 faltantes** |
| **AI Components** | 4 archivos | 1 archivo | 🟡 **3 faltantes** |
| **Dashboard Widgets** | 2 archivos | 7 archivos | ✅ Desktop superior |
| **Analytics** | 5 archivos | 6 archivos | ✅ Paridad |
| **Electron Native** | N/A | 12+ archivos | ✅ Completo |

---

## 🔴 Componentes Críticos Faltantes

### 1. Sistema Kanban (Project)

**Ubicación Web**: `apps/web/src/components/project/`  
**Ubicación Desktop**: `apps/desktop/src/components/project/` (incompleto)

| Componente | Web | Desktop | Prioridad |
|------------|-----|---------|-----------|
| `project-board.tsx` | ✅ 6,053 bytes | ❌ | 🔴 Crítica |
| `board-column.tsx` | ✅ 1,749 bytes | ❌ | 🔴 Crítica |
| `kanban-task-card.tsx` | ✅ 5,630 bytes | ❌ | 🔴 Crítica |
| `sortable-task.tsx` | ✅ 805 bytes | ❌ | 🔴 Crítica |
| `project-list.tsx` | ✅ 4,787 bytes | ❌ | 🟡 Alta |
| `project-timeline.tsx` | ✅ 3,606 bytes | ❌ | 🟡 Alta |
| `project-settings.tsx` | ✅ 11,425 bytes | ❌ | 🟡 Media |
| `project-settings-dialog.tsx` | ✅ 6,839 bytes | ❌ | 🟡 Media |
| `project-files.tsx` | ✅ 3,747 bytes | ❌ | 🟢 Baja |

> **Nota**: Desktop tiene `KanbanBoard.tsx` en `/components/kanban/` pero es una implementación básica.

---

### 2. Task Detail Components (STUBS)

**Ubicación Web**: `apps/web/src/components/task/`  
**Ubicación Desktop**: `apps/desktop/src/components/task/`

Los siguientes componentes existen en Desktop pero son **STUBS vacíos**:

| Componente | Web (bytes) | Desktop | Contenido Actual |
|------------|-------------|---------|------------------|
| `activity-feed.tsx` | 9,701 | ⚠️ 173 bytes | `"Actividad próximamente..."` |
| `attachment-list.tsx` | 10,261 | ⚠️ 174 bytes | `"Lista de archivos próximamente..."` |
| `comment-thread.tsx` | 9,684 | ⚠️ 179 bytes | `"Comentarios próximamente..."` |
| `file-upload.tsx` | 10,695 | ⚠️ 176 bytes | `"Subida de archivos próximamente..."` |

**Componentes faltantes completamente**:

| Componente | Web (bytes) | Función | Prioridad |
|------------|-------------|---------|-----------|
| `assignee-selector.tsx` | 11,604 | Selector de asignado | 🔴 Crítica |
| `recurrence-selector.tsx` | 3,913 | Selector de recurrencia | 🟡 Media |
| `task-card-compact.tsx` | 22,412 | Tarjeta compacta | 🟢 Baja |
| `task-detail-view.tsx` | 4,963 | Vista alternativa | 🟢 Baja |
| `task-filters.tsx` | 5,050 | Filtros de tareas | 🟡 Media |

---

### 3. Workspace Components

**Ubicación Web**: `apps/web/src/components/workspace/`  
**Ubicación Desktop**: `apps/desktop/src/components/workspace/`

| Componente | Web | Desktop | Prioridad |
|------------|-----|---------|-----------|
| `create-workspace-dialog.tsx` | ✅ | ✅ | ✅ OK |
| `workspace-selector.tsx` | ✅ | ✅ | ✅ OK |
| `workspace-settings-dialog.tsx` | ✅ | ✅ | ✅ OK |
| `invite-member-dialog.tsx` | ✅ 6,646 bytes | ❌ | 🔴 Crítica |
| `workspace-members-settings.tsx` | ✅ 7,480 bytes | ❌ | 🔴 Crítica |
| `workspace-activity-log.tsx` | ✅ 6,329 bytes | ❌ | 🟡 Media |
| `workspace-dashboard.tsx` | ✅ 14,470 bytes | ❌ | 🟡 Media |
| `workspace-info-bar.tsx` | ✅ 7,452 bytes | ❌ | 🟢 Baja |
| `workspace-card.tsx` | ✅ 7,314 bytes | ❌ | 🟢 Baja |
| `workspace-auto-selector.tsx` | ✅ 1,266 bytes | ❌ | 🟢 Baja |
| `workspace-configuration-settings.tsx` | ✅ 8,399 bytes | ❌ | 🟡 Media |

---

### 4. AI Components

**Ubicación Web**: `apps/web/src/components/ai/`  
**Ubicación Desktop**: `apps/desktop/src/components/ai/`

| Componente | Web | Desktop | Prioridad |
|------------|-----|---------|-----------|
| `AIWeeklyReport.tsx` | ❌ | ✅ 13,499 bytes | ✅ OK |
| `generate-report-dialog.tsx` | ✅ 5,744 bytes | ❌ | 🟡 Alta |
| `report-card.tsx` | ✅ 5,544 bytes | ❌ | 🟡 Media |
| `report-detail.tsx` | ✅ 9,093 bytes | ❌ | 🟡 Media |
| `ai-assistant-sidebar.tsx` | ✅ 5,000 bytes | ❌ | 🟢 Baja |

---

## ✅ Áreas con Paridad o Superioridad

### Dashboard Widgets (Desktop Superior)
Desktop: 7 componentes vs Web: 2 componentes

```
apps/desktop/src/components/dashboard/
├── ActiveProjectsWidget.tsx    ✅
├── ProductivityStreakWidget.tsx ✅
├── StatsCard.tsx               ✅
├── TimerWidget.tsx             ✅
├── UpcomingTasksWidget.tsx     ✅
├── WeeklyActivityWidget.tsx    ✅
└── index.ts                    ✅
```

### Analytics (Paridad)
```
apps/desktop/src/components/analytics/
├── FocusScoreGauge.tsx         ✅
├── PeakHoursHeatmap.tsx        ✅
├── ProductivityInsights.tsx    ✅
├── ProjectTimeline.tsx         ✅ (único en desktop)
├── WeeklyChart.tsx             ✅
└── index.ts                    ✅
```

### Electron Native Features (Completo)
```
apps/desktop/electron/
├── tray.ts                     ✅ System Tray
├── shortcuts.ts                ✅ Global Shortcuts
├── notifications.ts            ✅ Native Notifications
├── menu.ts                     ✅ Native Menu
├── window-state.ts             ✅ Window Persistence
├── auto-launch.ts              ✅ Auto-start
├── auto-updater.ts             ✅ Auto-updates
├── deep-links.ts               ✅ Deep Links (ordo://)
├── timer-window.ts             ✅ Timer Flotante
├── preload.ts                  ✅ IPC Bridge
├── ipc-handlers.ts             ✅ IPC Handlers
└── database/                   ✅ SQLite Offline
```

---

## 📋 Prioridades de Implementación

### Sprint 1 (Semana 1-2) - CRÍTICO
1. ✏️ Migrar sistema Kanban completo
2. ✏️ Implementar `assignee-selector.tsx`
3. ✏️ Implementar `invite-member-dialog.tsx`
4. ✏️ Implementar `workspace-members-settings.tsx`

### Sprint 2 (Semana 3-4) - ALTO
5. ✏️ Implementar `activity-feed.tsx` (reemplazar stub)
6. ✏️ Implementar `attachment-list.tsx` (reemplazar stub)
7. ✏️ Implementar `comment-thread.tsx` (reemplazar stub)
8. ✏️ Implementar `file-upload.tsx` (reemplazar stub)

### Sprint 3 (Semana 5-6) - MEDIO
9. ✏️ Migrar `project-list.tsx`
10. ✏️ Migrar `project-settings.tsx`
11. ✏️ Implementar AI components faltantes
12. ✏️ Implementar `task-filters.tsx`

### Sprint 4 (Semana 7-8) - BAJO
13. ✏️ Componentes secundarios de workspace
14. ✏️ Mejoras de UI/UX
15. ✏️ Testing end-to-end

---

## 🔧 Pasos de Migración

Ver documento [migration-steps.md](./migration-steps.md) para instrucciones detalladas.
