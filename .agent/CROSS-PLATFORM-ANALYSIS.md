# ANÁLISIS CROSS-PLATFORM: WEB vs DESKTOP

Análisis exhaustivo de funcionalidades compartidas, únicas y código a compartir entre plataformas.

## TABLA DE CONTENIDO

1. [Comparación de Funcionalidades](#1-comparación-de-funcionalidades)
2. [Código Duplicado a Compartir](#2-código-duplicado-a-compartir)
3. [Funcionalidades Únicas por Plataforma](#3-funcionalidades-únicas-por-plataforma)
4. [Plan de Migración](#4-plan-de-migración)
5. [Arquitectura Objetivo](#5-arquitectura-objetivo)

---

## 1. COMPARACIÓN DE FUNCIONALIDADES

### MATRIZ DE FUNCIONALIDADES

| Funcionalidad | Web | Desktop | Package Actual | Debe Compartirse | Prioridad |
|---------------|-----|---------|----------------|------------------|-----------|
| **GESTIÓN DE TAREAS** |
| CRUD Tareas | ✅ | ✅ | ❌ | ✅ Hooks/Components | P0 |
| Subtareas | ✅ | ✅ | ✅ Core (Entity) | ✅ Components | P0 |
| Dependencias | ✅ | ✅ | ❌ | ✅ Hooks/Components | P1 |
| Task Health Score | ❌ | ✅ | ❌ | ✅ Utils/Components | P1 |
| Templates | ❌ | ✅ | ✅ DB Schema | ✅ Hooks/Components | P2 |
| Recurrencia | ✅ | ❌ | ✅ Core (Entity) | ✅ Components | P1 |
| Compartir Tarea | ✅ | ❌ | ✅ API | ✅ Hooks | P2 |
| Comentarios | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Adjuntos | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Filtros Avanzados | ✅ | ✅ | ❌ | ✅ Components | P1 |
| Activity Feed | ✅ | ✅ | ✅ DB Schema | ✅ Components | P2 |
| **VISTAS** |
| Lista Tareas | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Kanban Board | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Calendario | ✅ | ✅ | ❌ | ✅ Components | P1 |
| Timeline/Gantt | ✅ | ✅ | ❌ | ✅ Components | P2 |
| Focus Mode | ✅ | ✅ (separado) | ❌ | ✅ Components | P2 |
| **TIMER POMODORO** |
| Timer Core | ✅ | ✅ | ✅ Hooks/Stores | ✅ Components | P0 |
| Pomodoro Mode | ✅ | ✅ | ✅ Core | - | P0 |
| Continuous Mode | ✅ | ✅ | ✅ Core | - | P0 |
| Pause/Resume | ✅ | ✅ | ✅ Stores | - | P0 |
| Task Selector | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Session History | ✅ | ✅ | ✅ API/Hooks | ✅ Components | P1 |
| Timer Widget | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Floating Window | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| **ANALYTICS** |
| Daily Metrics | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Weekly Chart | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Focus Score Gauge | ✅ | ✅ | ✅ Core (cálculo) | ✅ Components | P0 |
| Peak Hours Heatmap | ✅ | ✅ | ❌ | ✅ Components | P1 |
| Distribution Charts | ✅ | ✅ | ❌ | ✅ Components | P1 |
| Dashboard Stats | ✅ | ✅ | ✅ API | ✅ Components | P1 |
| **AI** |
| AI Assistant Chat | ✅ | ❌ | ✅ API | ✅ Components | P1 |
| Weekly Reports | ✅ | ✅ | ✅ Core/API | ✅ Components | P1 |
| Productivity Insights | ✅ | ✅ | ✅ Core | ✅ Components | P1 |
| Task Duration Prediction | ✅ | ✅ | ✅ Core/API | - | P2 |
| Optimal Schedule | ✅ | ✅ | ✅ Core/API | - | P2 |
| **PROYECTOS** |
| CRUD Proyectos | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Project Card | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Kanban Board | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Timeline | ✅ | ✅ | ❌ | ✅ Components | P2 |
| Project Files | ✅ | ✅ | ✅ API | ✅ Components | P2 |
| Project Settings | ✅ | ✅ | ✅ DB | ✅ Components | P2 |
| **WORKSPACES** |
| CRUD Workspaces | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Workspace Selector | ✅ | ✅ | ✅ Stores | ✅ Components | P0 |
| Miembros/Invitaciones | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Workspace Settings | ✅ | ✅ | ✅ Core/API | ✅ Components | P1 |
| Activity Log | ✅ | ✅ | ✅ Core/API | ✅ Components | P2 |
| **WORKFLOWS** |
| CRUD Workflows | ✅ | ❌ | ✅ Core/API | ✅ Hooks/Components | P1 |
| **TAGS** |
| CRUD Tags | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Tag Selector | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Tag Badge | ✅ | ✅ | ❌ | ✅ Components | P0 |
| **AUTENTICACIÓN** |
| Login/Register | ✅ | ✅ | ✅ Core/API | ✅ Components | P0 |
| Auth Provider | ✅ | ✅ | ❌ | ✅ Components | P0 |
| Protected Routes | ✅ | ✅ | ❌ | ✅ Utils | P0 |
| **SINCRONIZACIÓN** |
| Offline Detection | ✅ | ✅ | ✅ Stores | - | P0 |
| Offline Queue | ✅ | ✅ (SQLite) | ❌ | ⚠️ Platform-specific | - |
| Sync Status Indicator | ✅ | ✅ | ❌ | ✅ Components | P1 |
| **UI COMPONENTS** |
| Button, Input, Select | ✅ | ✅ | ❌ | ✅ UI Package | P0 |
| Dialog, Modal, Sheet | ✅ | ✅ | ❌ | ✅ UI Package | P0 |
| Card, Badge, Avatar | ✅ | ✅ | ❌ | ✅ UI Package | P0 |
| Form Components | ✅ | ✅ | ❌ | ✅ UI Package | P0 |
| Toast/Sonner | ✅ | ✅ | ❌ | ✅ UI Package | P0 |
| Sidebar, Topbar | ✅ | ✅ | ❌ | ✅ Components | P0 |
| **UTILIDADES** |
| Date Utils | ✅ | ✅ | ✅ Core | - | P0 |
| Time Utils | ✅ | ✅ | ✅ Core | - | P0 |
| Smart Capture | ❌ | ✅ | ❌ | ✅ Utils | P2 |
| Voice Input | ❌ | ✅ | ❌ | ✅ Utils/Components | P2 |
| **PLATAFORMA-ESPECÍFICO** |
| PWA Features | ✅ | ❌ | ❌ | ❌ Web-only | - |
| System Tray | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| Global Shortcuts | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| Deep Links | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| Auto-Launch | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| Auto-Update | ❌ | ✅ | ❌ | ❌ Desktop-only | - |
| Notificaciones Push | ✅ | ✅ (nativas) | ❌ | ⚠️ Platform-specific | - |

**Leyenda:**
- ✅ Implementado
- ❌ No implementado
- ⚠️ Requiere implementación específica por plataforma
- P0: Crítico (compartir YA)
- P1: Alto (compartir pronto)
- P2: Medio (compartir después)

---

## 2. CÓDIGO DUPLICADO A COMPARTIR

### 2.1 COMPONENTES UI BASE (P0 - Crítico)

**Actualmente duplicados en ambas apps:**

```
apps/web/src/components/ui/          apps/desktop/src/components/ui/
├── button.tsx                    =  ├── button.tsx
├── input.tsx                     =  ├── input.tsx
├── textarea.tsx                  =  ├── textarea.tsx
├── select.tsx                    =  ├── select.tsx
├── checkbox.tsx                  =  ├── checkbox.tsx
├── switch.tsx                    =  ├── switch.tsx
├── slider.tsx                    =  ├── slider.tsx
├── card.tsx                      =  ├── card.tsx
├── badge.tsx                     =  ├── badge.tsx
├── avatar.tsx                    =  ├── avatar.tsx
├── dialog.tsx                    =  ├── dialog.tsx
├── sheet.tsx                     =  ├── sheet.tsx
├── dropdown-menu.tsx             =  ├── dropdown-menu.tsx
├── popover.tsx                   =  ├── popover.tsx
├── command.tsx                   =  ├── command.tsx
├── table.tsx                     =  ├── table.tsx
├── tabs.tsx                      =  ├── tabs.tsx
├── label.tsx                     =  ├── label.tsx
├── form.tsx                      =  ├── form.tsx
├── progress.tsx                  =  ├── progress.tsx
├── separator.tsx                 =  ├── separator.tsx
├── tooltip.tsx                   =  ├── tooltip.tsx
├── calendar.tsx                  =  ├── calendar.tsx
├── sonner.tsx                    =  ├── sonner.tsx
├── empty-state.tsx               =  ├── empty-state.tsx
└── scroll-area.tsx               ~  └── (otros)
```

**Acción:** Mover a `packages/ui/components/`

**Tamaño estimado:** ~25 componentes base × ~50 líneas promedio = **1,250 líneas**

---

### 2.2 COMPONENTES DE DOMINIO (P0-P1)

#### A. TIMER COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/timer/
├── pomodoro-timer.tsx           = apps/desktop/src/components/timer/pomodoro-timer.tsx
├── task-selector.tsx            = apps/desktop/src/components/timer/task-selector.tsx
├── timer-widget.tsx             = apps/desktop/src/components/timer/timer-widget.tsx
└── session-history.tsx          = apps/desktop/src/components/timer/session-history.tsx
```

**Acción:** Mover a `packages/ui/components/timer/`

**Tamaño:** ~600 líneas

#### B. ANALYTICS COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/analytics/
├── daily-metrics-card.tsx       = apps/desktop/src/components/analytics/ (no card, pero similar)
├── weekly-chart.tsx             = apps/desktop/src/components/analytics/WeeklyChart.tsx
├── focus-score-gauge.tsx        = apps/desktop/src/components/analytics/FocusScoreGauge.tsx
├── peak-hours-chart.tsx         ~ apps/desktop/src/components/analytics/PeakHoursHeatmap.tsx
└── distribution-charts.tsx      = apps/desktop/src/components/analytics/DistributionCharts.tsx
```

**Acción:** Mover a `packages/ui/components/analytics/`

**Tamaño:** ~800 líneas

#### C. TASK COMPONENTS

**Parcialmente duplicados:**
```typescript
apps/web/src/components/task/
├── task-list.tsx                = apps/desktop/src/components/task/task-list.tsx
├── task-card.tsx                = apps/desktop/src/components/task/task-card.tsx
├── task-detail-panel.tsx        = apps/desktop/src/components/task/task-detail-panel.tsx
├── create-task-dialog.tsx       = apps/desktop/src/components/task/create-task-dialog.tsx
├── subtask-list.tsx             = apps/desktop/src/components/task/subtask-list.tsx
├── comment-thread.tsx           = apps/desktop/src/components/task/comment-thread.tsx
├── attachment-list.tsx          = apps/desktop/src/components/task/attachment-list.tsx
├── file-upload.tsx              = apps/desktop/src/components/task/file-upload.tsx
├── task-filters.tsx             ~ similar
├── activity-feed.tsx            = apps/desktop/src/components/task/activity-feed.tsx
├── assignee-selector.tsx        ~ similar
├── recurrence-selector.tsx      [SOLO WEB]
└── task-calendar.tsx            = apps/desktop/src/components/calendar/task-calendar.tsx
```

**Acción:** Mover a `packages/ui/components/task/`

**Tamaño:** ~2,000 líneas

#### D. PROJECT COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/project/
├── project-list.tsx             ~ similar a desktop
├── project-card.tsx             = apps/desktop/src/components/project/project-card.tsx
├── project-board.tsx            = apps/desktop/src/components/project/project-board.tsx (Kanban)
├── kanban-task-card.tsx         = apps/desktop/src/components/project/kanban-task-card.tsx
├── board-column.tsx             = apps/desktop/src/components/project/board-column.tsx
├── sortable-task.tsx            = apps/desktop/src/components/project/sortable-task.tsx
├── create-project-dialog.tsx    = apps/desktop/src/components/project/create-project-dialog.tsx
└── project-timeline.tsx         ~ similar
```

**Acción:** Mover a `packages/ui/components/project/`

**Tamaño:** ~1,200 líneas

#### E. WORKSPACE COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/workspace/
├── workspace-selector.tsx                  = apps/desktop/src/components/workspace/WorkspaceSelector.tsx
├── workspace-card.tsx                      = apps/desktop/src/components/workspace/WorkspaceCard.tsx
├── create-workspace-dialog.tsx             = apps/desktop/src/components/workspace/CreateWorkspaceDialog.tsx
├── workspace-settings-dialog.tsx           = apps/desktop/src/components/workspace/WorkspaceSettingsDialog.tsx
├── workspace-members-settings.tsx          = apps/desktop/src/components/workspace/workspace-members-settings.tsx
├── invite-member-dialog.tsx                = apps/desktop/src/components/workspace/invite-member-dialog.tsx
├── workspace-configuration-settings.tsx    = apps/desktop/src/components/workspace/workspace-configuration-settings.tsx
└── workspace-activity-log.tsx              = apps/desktop/src/components/workspace/workspace-activity-log.tsx
```

**Acción:** Mover a `packages/ui/components/workspace/`

**Tamaño:** ~1,500 líneas

#### F. TAG COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/tag/
├── tag-badge.tsx                = apps/desktop/src/components/tag/tag-badge.tsx
├── tag-selector.tsx             = apps/desktop/src/components/tag/tag-selector.tsx
└── create-tag-dialog.tsx        = apps/desktop/src/components/tag/create-tag-dialog.tsx
```

**Acción:** Mover a `packages/ui/components/tag/`

**Tamaño:** ~300 líneas

#### G. AUTH COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/auth/
├── auth-form.component.tsx
└── force-authentication.component.tsx
```

**Acción:** Mover a `packages/ui/components/auth/`

**Tamaño:** ~200 líneas

#### H. SHARED/LAYOUT COMPONENTS

**Duplicados:**
```typescript
apps/web/src/components/shared/
├── sidebar.tsx                  ~ apps/desktop/src/components/layout/Sidebar.tsx
├── topbar.tsx                   ~ apps/desktop/src/components/layout/TopBar.tsx
├── app-layout.tsx               ~ apps/desktop/src/components/layout/AppLayout.tsx
├── breadcrumbs.tsx              ~ similar
├── notification-popover.tsx     ~ similar
├── sync-status-indicator.tsx    = apps/desktop/src/components/sync/SyncStatusIndicator.tsx
└── processing.component.tsx     ~ spinner
```

**Acción:** Mover a `packages/ui/components/layout/` y `packages/ui/components/shared/`

**Tamaño:** ~800 líneas

---

### 2.3 HOOKS (P0-P1)

#### Hooks Duplicados

```typescript
// API Hooks - YA compartidos vía @ordo-todo/hooks factory ✅
// Timer Hook - YA compartido vía @ordo-todo/hooks ✅

// Hooks que FALTAN compartir:
apps/web/src/hooks/
├── use-timer-backend.ts         ~ apps/desktop/src/hooks/api/use-timers.ts
├── use-timer-settings.ts        ~ (lógica similar en desktop)
├── use-timer-notifications.ts   ~ (lógica similar en desktop)
└── use-projects.ts              [DUPLICADO - mover a packages/hooks]
```

**Acción:**
- Consolidar hooks de timer en `packages/hooks/timer/`
- Mover `use-projects` a packages

---

### 2.4 UTILIDADES (P1-P2)

#### Utilidades Duplicadas

```typescript
// YA compartidas en @ordo-todo/core ✅
// - date.utils.ts
// - time.utils.ts
// - string.utils.ts
// - calculation.utils.ts

// FALTAN compartir:
apps/desktop/src/utils/
├── task-health.ts               [NUEVO - compartir en packages/ui/utils/]
└── smart-capture.ts             [NUEVO - compartir en packages/ui/utils/]

apps/web/src/lib/
├── offline-storage.ts           [Platform-specific - mantener]
├── logger.ts                    [COMPARTIR - packages/ui/utils/]
├── notify.tsx                   [COMPARTIR - packages/ui/utils/]
└── conflict-resolver.ts         [COMPARTIR - packages/ui/utils/]
```

**Acción:**
- Crear `packages/ui/utils/task-health.ts`
- Crear `packages/ui/utils/smart-capture.ts`
- Crear `packages/ui/utils/logger.ts`
- Crear `packages/ui/utils/notify.tsx`
- Crear `packages/ui/utils/conflict-resolver.ts`

---

### 2.5 PROVIDERS (P0)

```typescript
apps/web/src/components/providers/      apps/desktop/src/components/providers/
├── query-provider.tsx               =  [similar config]
├── auth-provider.tsx                =  [similar]
├── timer-provider.tsx               =  [similar]
└── timer-settings-provider.tsx      ~  [lógica similar]
```

**Acción:** Mover a `packages/ui/providers/`

---

## 3. FUNCIONALIDADES ÚNICAS POR PLATAFORMA

### 3.1 FUNCIONALIDADES SOLO EN WEB (Replicar en Desktop)

#### A. WORKFLOWS (P1 - Alto)
- **Descripción:** Agrupación de proyectos dentro de workspaces
- **Componentes Web:**
  - (No hay componentes específicos visibles, pero está en API/DB)
- **Estado:** ✅ Core existe, ✅ API existe, ❌ UI en Web, ❌ Desktop
- **Acción:**
  1. Crear componentes compartidos en `packages/ui/components/workflow/`
  2. Integrar en ambas plataformas

#### B. RECURRENCE SELECTOR (P1 - Alto)
- **Descripción:** Configurador de tareas recurrentes
- **Componentes Web:**
  - `apps/web/src/components/task/recurrence-selector.tsx`
- **Estado:** ✅ Core existe, ❌ Desktop UI
- **Acción:**
  1. Mover a `packages/ui/components/task/recurrence-selector.tsx`
  2. Integrar en Desktop

#### C. TASK SHARING (P2 - Medio)
- **Descripción:** Compartir tareas con token público
- **Componentes Web:**
  - Ruta: `/[locale]/share/task/[token]`
  - Hook: `usePublicTask(token)`
- **Estado:** ✅ API existe, ❌ Desktop
- **Acción:**
  1. Mover hook a packages
  2. Crear componente compartido
  3. Agregar ruta en Desktop

#### D. AI ASSISTANT SIDEBAR CHAT (P1 - Alto)
- **Descripción:** Chat conversacional con IA en sidebar
- **Componentes Web:**
  - `apps/web/src/components/ai/ai-assistant-sidebar.tsx`
- **Estado:** ❌ Desktop
- **Acción:**
  1. Mover a `packages/ui/components/ai/ai-assistant-sidebar.tsx`
  2. Integrar en Desktop

#### E. MODO FOCUS PÁGINA (P2 - Medio)
- **Descripción:** Página dedicada sin distracciones
- **Componentes Web:**
  - Ruta: `/[locale]/focus`
- **Estado:** Desktop tiene FocusMode page pero distinta
- **Acción:**
  1. Unificar lógica
  2. Componente compartido

#### F. PWA FEATURES (Web-only, no replicar)
- Install prompt
- Service Worker
- Offline cache con Service Worker
- **Mantener solo en Web**

---

### 3.2 FUNCIONALIDADES SOLO EN DESKTOP (Replicar en Web)

#### A. TASK HEALTH SCORE (P1 - Alto)
- **Descripción:** Sistema de scoring de tareas (0-100)
- **Archivos Desktop:**
  - `apps/desktop/src/utils/task-health.ts`
  - `apps/desktop/src/components/task/task-health-badge.tsx`
- **Estado:** ❌ Web
- **Acción:**
  1. Mover a `packages/ui/utils/task-health.ts`
  2. Mover badge a `packages/ui/components/task/task-health-badge.tsx`
  3. Integrar en Web

#### B. TASK TEMPLATES (P2 - Medio)
- **Descripción:** Plantillas reutilizables de tareas
- **Componentes Desktop:**
  - `apps/desktop/src/components/task/template-selector.tsx`
- **Estado:** ✅ DB schema existe, ❌ Web UI
- **Acción:**
  1. Crear hooks en packages
  2. Mover componente a packages
  3. Integrar en Web

#### C. VOICE INPUT (P2 - Medio)
- **Descripción:** Crear tareas por voz (Web Speech API)
- **Archivos Desktop:**
  - `apps/desktop/src/components/voice/voice-input.tsx`
  - `apps/desktop/src/hooks/use-speech-recognition.ts`
- **Estado:** ❌ Web
- **Acción:**
  1. Mover a `packages/ui/components/voice/`
  2. Mover hook a `packages/hooks/`
  3. Integrar en Web

#### D. SMART CAPTURE (P2 - Medio)
- **Descripción:** Parsing de entrada natural (duración, fecha)
- **Archivos Desktop:**
  - `apps/desktop/src/utils/smart-capture.ts` (usa chrono-node)
- **Estado:** ❌ Web
- **Acción:**
  1. Mover a `packages/ui/utils/smart-capture.ts`
  2. Integrar en Web

#### E. TASK DEPENDENCIES UI (P1 - Alto)
- **Descripción:** Gestión visual de dependencias bloqueantes
- **Componentes Desktop:**
  - `apps/desktop/src/components/task/dependency-list.tsx`
- **Estado:** ✅ DB existe, ❌ Web UI
- **Acción:**
  1. Mover a `packages/ui/components/task/`
  2. Integrar en Web

#### F. ELECTRON-SPECIFIC (Desktop-only, no replicar)
- System Tray
- Global Shortcuts
- Floating Timer Window
- Deep Links
- Auto-Launch
- Auto-Update
- **Mantener solo en Desktop**

---

## 4. PLAN DE MIGRACIÓN

### FASE 1: COMPONENTES UI BASE (Semana 1-2)

**Objetivo:** Mover 25 componentes base Radix UI a package compartido

**Pasos:**
1. Crear `packages/ui/components/` estructura
2. Mover componentes uno por uno:
   - button, input, textarea, select, checkbox, etc.
3. Actualizar imports en Web:
   ```typescript
   // Antes:
   import { Button } from "@/components/ui/button"

   // Después:
   import { Button } from "@ordo-todo/ui/components"
   ```
4. Actualizar imports en Desktop
5. Ejecutar tests de regresión
6. Eliminar archivos duplicados

**Componentes a mover (25):**
- button, input, textarea, select, checkbox, switch, slider
- card, badge, avatar, progress, separator, label
- dialog, sheet, dropdown-menu, popover, command
- table, tabs, tooltip, calendar, sonner
- empty-state, scroll-area, form

**Tests:**
- Unit tests para cada componente
- Visual regression tests (Storybook/Chromatic)
- Accessibility tests

---

### FASE 2: COMPONENTES DE DOMINIO (Semana 3-5)

**Objetivo:** Mover componentes de Timer, Tasks, Projects, Analytics

#### 2.1 Timer Components (Semana 3)
- pomodoro-timer
- task-selector
- timer-widget
- session-history

#### 2.2 Task Components (Semana 4)
- task-list, task-card, task-detail-panel
- create-task-dialog
- subtask-list
- comment-thread
- attachment-list, file-upload
- activity-feed
- task-filters
- assignee-selector
- recurrence-selector (solo web → compartir)
- task-calendar
- dependency-list (solo desktop → compartir)
- task-health-badge (solo desktop → compartir)
- template-selector (solo desktop → compartir)

#### 2.3 Project & Analytics Components (Semana 5)
- **Projects:** project-list, project-card, project-board, kanban-task-card, board-column, sortable-task, create-project-dialog, project-timeline
- **Analytics:** daily-metrics-card, weekly-chart, focus-score-gauge, peak-hours-chart, distribution-charts, productivity-insights

**Estructura target:**
```
packages/ui/components/
├── timer/
│   ├── pomodoro-timer.tsx
│   ├── task-selector.tsx
│   ├── timer-widget.tsx
│   └── session-history.tsx
├── task/
│   ├── task-list.tsx
│   ├── task-card.tsx
│   ├── task-detail-panel.tsx
│   ├── create-task-dialog.tsx
│   ├── subtask-list.tsx
│   ├── comment-thread.tsx
│   ├── attachment-list.tsx
│   ├── file-upload.tsx
│   ├── task-filters.tsx
│   ├── activity-feed.tsx
│   ├── assignee-selector.tsx
│   ├── recurrence-selector.tsx
│   ├── task-calendar.tsx
│   ├── dependency-list.tsx
│   ├── task-health-badge.tsx
│   └── template-selector.tsx
├── project/
│   ├── project-list.tsx
│   ├── project-card.tsx
│   ├── project-board.tsx
│   ├── kanban-task-card.tsx
│   ├── board-column.tsx
│   ├── sortable-task.tsx
│   ├── create-project-dialog.tsx
│   └── project-timeline.tsx
└── analytics/
    ├── daily-metrics-card.tsx
    ├── weekly-chart.tsx
    ├── focus-score-gauge.tsx
    ├── peak-hours-chart.tsx
    ├── distribution-charts.tsx
    └── productivity-insights.tsx
```

---

### FASE 3: WORKSPACE, TAG, AUTH, AI COMPONENTS (Semana 6)

**Objetivo:** Completar migración de componentes restantes

#### 3.1 Workspace Components
- workspace-selector
- workspace-card
- create-workspace-dialog
- workspace-settings-dialog
- workspace-members-settings
- invite-member-dialog
- workspace-configuration-settings
- workspace-activity-log

#### 3.2 Tag Components
- tag-badge
- tag-selector
- create-tag-dialog

#### 3.3 Auth Components
- auth-form
- force-authentication

#### 3.4 AI Components
- ai-assistant-sidebar (solo web → compartir)
- generate-report-dialog
- report-card
- report-detail
- ai-weekly-report

**Estructura target:**
```
packages/ui/components/
├── workspace/
│   ├── workspace-selector.tsx
│   ├── workspace-card.tsx
│   ├── create-workspace-dialog.tsx
│   ├── workspace-settings-dialog.tsx
│   ├── workspace-members-settings.tsx
│   ├── invite-member-dialog.tsx
│   ├── workspace-configuration-settings.tsx
│   └── workspace-activity-log.tsx
├── tag/
│   ├── tag-badge.tsx
│   ├── tag-selector.tsx
│   └── create-tag-dialog.tsx
├── auth/
│   ├── auth-form.tsx
│   └── force-authentication.tsx
└── ai/
    ├── ai-assistant-sidebar.tsx
    ├── generate-report-dialog.tsx
    ├── report-card.tsx
    ├── report-detail.tsx
    └── ai-weekly-report.tsx
```

---

### FASE 4: LAYOUT, SHARED, PROVIDERS (Semana 7)

**Objetivo:** Mover componentes de layout y providers

#### 4.1 Layout Components
- app-layout
- sidebar
- topbar
- breadcrumbs

#### 4.2 Shared Components
- notification-popover
- sync-status-indicator
- processing (spinner)
- confirm-delete
- date-input

#### 4.3 Providers
- query-provider
- auth-provider
- timer-provider
- timer-settings-provider
- theme-provider

**Estructura target:**
```
packages/ui/
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── breadcrumbs.tsx
│   └── shared/
│       ├── notification-popover.tsx
│       ├── sync-status-indicator.tsx
│       ├── processing.tsx
│       ├── confirm-delete.tsx
│       └── date-input.tsx
└── providers/
    ├── query-provider.tsx
    ├── auth-provider.tsx
    ├── timer-provider.tsx
    ├── timer-settings-provider.tsx
    └── theme-provider.tsx
```

---

### FASE 5: UTILIDADES Y HOOKS (Semana 8)

**Objetivo:** Compartir utilidades y hooks restantes

#### 5.1 Utilidades
- task-health.ts (desktop → compartir)
- smart-capture.ts (desktop → compartir)
- logger.ts
- notify.tsx
- conflict-resolver.ts

#### 5.2 Hooks
- use-timer-backend.ts (consolidar)
- use-timer-settings.ts (consolidar)
- use-timer-notifications.ts (consolidar)
- use-projects.ts (mover a packages)
- use-speech-recognition.ts (desktop → compartir)
- use-route-color.ts
- use-task-navigation.ts
- useReducedMotion.ts

**Estructura target:**
```
packages/ui/utils/
├── task-health.ts
├── smart-capture.ts
├── logger.ts
├── notify.tsx
└── conflict-resolver.ts

packages/hooks/
├── timer/
│   ├── use-timer-backend.ts
│   ├── use-timer-settings.ts
│   └── use-timer-notifications.ts
├── use-projects.ts
├── use-speech-recognition.ts
├── use-route-color.ts
├── use-task-navigation.ts
└── use-reduced-motion.ts
```

---

### FASE 6: FUNCIONALIDADES NUEVAS (Semana 9-10)

**Objetivo:** Implementar funcionalidades faltantes en cada plataforma

#### 6.1 Web ← Desktop

**Implementar en Web:**
1. **Task Health Score** (P1)
   - Usar `packages/ui/utils/task-health.ts`
   - Mostrar badge en task-card
   - Panel de detalles con métricas

2. **Task Templates** (P2)
   - UI para crear/editar templates
   - Selector en create-task-dialog
   - Hooks ya compartidos

3. **Voice Input** (P2)
   - Agregar botón en create-task-dialog
   - Usar `packages/ui/components/voice/voice-input.tsx`

4. **Smart Capture** (P2)
   - Parsing automático en task-form
   - Sugerencias de duración/fecha

5. **Task Dependencies UI** (P1)
   - Agregar tab en task-detail-panel
   - Usar `packages/ui/components/task/dependency-list.tsx`

#### 6.2 Desktop ← Web

**Implementar en Desktop:**
1. **Workflows** (P1)
   - Crear página de workflows
   - Selector en project-form
   - Integrar en sidebar

2. **Recurrence Selector** (P1)
   - Agregar en create/edit task
   - Usar `packages/ui/components/task/recurrence-selector.tsx`

3. **Task Sharing** (P2)
   - Botón "Share" en task-detail
   - Modal con link público
   - Página pública en Electron (webview?)

4. **AI Assistant Sidebar Chat** (P1)
   - Agregar panel lateral
   - Usar `packages/ui/components/ai/ai-assistant-sidebar.tsx`
   - Shortcuts para abrir/cerrar

---

### FASE 7: TESTING (Semana 11-12)

**Objetivo:** Crear y ejecutar tests exhaustivos

#### 7.1 Tests Unitarios (packages/)
```typescript
// packages/ui/components/timer/__tests__/pomodoro-timer.test.tsx
// packages/ui/components/task/__tests__/task-list.test.tsx
// packages/ui/utils/__tests__/task-health.test.ts
// packages/hooks/__tests__/use-timer.test.ts
```

**Cobertura mínima:** 80% en packages

#### 7.2 Tests de Integración (apps/)
- Flujos completos (crear tarea, pomodoro, analytics)
- Sincronización offline
- Navegación entre páginas

#### 7.3 Tests E2E
- Playwright para Web
- Spectron/WebdriverIO para Desktop
- Escenarios críticos:
  - Login → Crear workspace → Crear proyecto → Crear tarea → Iniciar timer → Completar
  - Offline → Crear tarea → Online → Sync

#### 7.4 Tests de Regresión Visual
- Storybook + Chromatic
- Todos los componentes compartidos
- Temas claro/oscuro

---

### FASE 8: DOCUMENTACIÓN (Semana 13)

**Objetivo:** Documentar arquitectura compartida

#### 8.1 README por Package
```markdown
# @ordo-todo/ui

Shared UI components and utilities for Ordo-Todo

## Components

### Timer
- `PomodoroTimer` - Main timer component
- `TaskSelector` - Task selection dialog
- ...

## Usage

\`\`\`tsx
import { PomodoroTimer } from '@ordo-todo/ui/components/timer';

function TimerPage() {
  return <PomodoroTimer />;
}
\`\`\`
```

#### 8.2 Storybook
- Documentación interactiva de componentes
- Props tables
- Ejemplos de uso

#### 8.3 Migration Guide
```markdown
# Migration Guide: UI Components

## Before
\`\`\`tsx
import { Button } from '@/components/ui/button';
\`\`\`

## After
\`\`\`tsx
import { Button } from '@ordo-todo/ui/components';
\`\`\`
```

#### 8.4 Architecture Docs
- Actualizar CLAUDE.md
- Crear ARCHITECTURE.md
- Diagrams (mermaid)

---

## 5. ARQUITECTURA OBJETIVO

### ESTRUCTURA FINAL DE PACKAGES

```
packages/
├── core/                         # Domain logic (DDD)
│   ├── src/
│   │   ├── users/
│   │   ├── workspaces/
│   │   ├── workflows/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── tags/
│   │   ├── timer/
│   │   ├── analytics/
│   │   ├── ai/
│   │   └── shared/
│   └── package.json
│
├── db/                           # Prisma schema
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── api-client/                   # REST client
│   ├── src/
│   │   ├── client.ts
│   │   ├── types/
│   │   └── storage/
│   └── package.json
│
├── hooks/                        # React Query hooks
│   ├── src/
│   │   ├── factory.ts
│   │   ├── timer/
│   │   │   ├── use-timer.ts
│   │   │   ├── use-timer-backend.ts
│   │   │   ├── use-timer-settings.ts
│   │   │   └── use-timer-notifications.ts
│   │   ├── use-projects.ts
│   │   ├── use-speech-recognition.ts
│   │   ├── use-route-color.ts
│   │   ├── use-task-navigation.ts
│   │   └── use-reduced-motion.ts
│   └── package.json
│
├── stores/                       # Zustand stores
│   ├── src/
│   │   ├── workspace-store.ts
│   │   ├── ui-store.ts
│   │   ├── timer-store.ts
│   │   └── sync-store.ts
│   └── package.json
│
├── ui/                           # 🆕 SHARED UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Base components (25)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── ...
│   │   │   │   └── index.ts
│   │   │   ├── timer/            # Timer components (4)
│   │   │   │   ├── pomodoro-timer.tsx
│   │   │   │   ├── task-selector.tsx
│   │   │   │   ├── timer-widget.tsx
│   │   │   │   └── session-history.tsx
│   │   │   ├── task/             # Task components (15)
│   │   │   │   ├── task-list.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-detail-panel.tsx
│   │   │   │   ├── create-task-dialog.tsx
│   │   │   │   ├── subtask-list.tsx
│   │   │   │   ├── comment-thread.tsx
│   │   │   │   ├── attachment-list.tsx
│   │   │   │   ├── file-upload.tsx
│   │   │   │   ├── task-filters.tsx
│   │   │   │   ├── activity-feed.tsx
│   │   │   │   ├── assignee-selector.tsx
│   │   │   │   ├── recurrence-selector.tsx
│   │   │   │   ├── task-calendar.tsx
│   │   │   │   ├── dependency-list.tsx
│   │   │   │   ├── task-health-badge.tsx
│   │   │   │   └── template-selector.tsx
│   │   │   ├── project/          # Project components (8)
│   │   │   │   ├── project-list.tsx
│   │   │   │   ├── project-card.tsx
│   │   │   │   ├── project-board.tsx
│   │   │   │   ├── kanban-task-card.tsx
│   │   │   │   ├── board-column.tsx
│   │   │   │   ├── sortable-task.tsx
│   │   │   │   ├── create-project-dialog.tsx
│   │   │   │   └── project-timeline.tsx
│   │   │   ├── workspace/        # Workspace components (8)
│   │   │   │   ├── workspace-selector.tsx
│   │   │   │   ├── workspace-card.tsx
│   │   │   │   ├── create-workspace-dialog.tsx
│   │   │   │   ├── workspace-settings-dialog.tsx
│   │   │   │   ├── workspace-members-settings.tsx
│   │   │   │   ├── invite-member-dialog.tsx
│   │   │   │   ├── workspace-configuration-settings.tsx
│   │   │   │   └── workspace-activity-log.tsx
│   │   │   ├── workflow/         # 🆕 Workflow components
│   │   │   │   ├── workflow-list.tsx
│   │   │   │   ├── workflow-card.tsx
│   │   │   │   └── create-workflow-dialog.tsx
│   │   │   ├── tag/              # Tag components (3)
│   │   │   │   ├── tag-badge.tsx
│   │   │   │   ├── tag-selector.tsx
│   │   │   │   └── create-tag-dialog.tsx
│   │   │   ├── analytics/        # Analytics components (5)
│   │   │   │   ├── daily-metrics-card.tsx
│   │   │   │   ├── weekly-chart.tsx
│   │   │   │   ├── focus-score-gauge.tsx
│   │   │   │   ├── peak-hours-chart.tsx
│   │   │   │   └── distribution-charts.tsx
│   │   │   ├── ai/               # AI components (5)
│   │   │   │   ├── ai-assistant-sidebar.tsx
│   │   │   │   ├── generate-report-dialog.tsx
│   │   │   │   ├── report-card.tsx
│   │   │   │   ├── report-detail.tsx
│   │   │   │   └── ai-weekly-report.tsx
│   │   │   ├── auth/             # Auth components (2)
│   │   │   │   ├── auth-form.tsx
│   │   │   │   └── force-authentication.tsx
│   │   │   ├── layout/           # Layout components (4)
│   │   │   │   ├── app-layout.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── topbar.tsx
│   │   │   │   └── breadcrumbs.tsx
│   │   │   ├── shared/           # Shared components (5)
│   │   │   │   ├── notification-popover.tsx
│   │   │   │   ├── sync-status-indicator.tsx
│   │   │   │   ├── processing.tsx
│   │   │   │   ├── confirm-delete.tsx
│   │   │   │   └── date-input.tsx
│   │   │   ├── voice/            # 🆕 Voice components
│   │   │   │   └── voice-input.tsx
│   │   │   └── index.ts
│   │   ├── providers/            # 🆕 Shared providers
│   │   │   ├── query-provider.tsx
│   │   │   ├── auth-provider.tsx
│   │   │   ├── timer-provider.tsx
│   │   │   ├── timer-settings-provider.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── index.ts
│   │   ├── utils/                # 🆕 Utilities
│   │   │   ├── cn.ts             # (ya existe)
│   │   │   ├── colors.ts         # (ya existe)
│   │   │   ├── task-health.ts    # 🆕
│   │   │   ├── smart-capture.ts  # 🆕
│   │   │   ├── logger.ts         # 🆕
│   │   │   ├── notify.tsx        # 🆕
│   │   │   └── conflict-resolver.ts # 🆕
│   │   └── index.ts
│   └── package.json
│
├── i18n/                         # Internationalization
│   └── ...
│
├── config/                       # Shared config
│   └── ...
│
├── eslint-config/
│   └── ...
│
└── typescript-config/
    └── ...
```

---

### IMPORTS FINALES

#### Apps (Web/Desktop)

```typescript
// UI Components
import {
  Button,
  Input,
  Dialog,
  Card,
  // ... todos los base components
} from '@ordo-todo/ui/components/ui';

import {
  PomodoroTimer,
  TaskSelector,
  TimerWidget,
} from '@ordo-todo/ui/components/timer';

import {
  TaskList,
  TaskCard,
  TaskDetailPanel,
  CreateTaskDialog,
  // ... todos los task components
} from '@ordo-todo/ui/components/task';

// Providers
import {
  QueryProvider,
  AuthProvider,
  TimerProvider,
} from '@ordo-todo/ui/providers';

// Utilities
import { cn, PROJECT_COLORS } from '@ordo-todo/ui/utils';
import { calculateTaskHealth } from '@ordo-todo/ui/utils/task-health';
import { smartCapture } from '@ordo-todo/ui/utils/smart-capture';

// Hooks
import {
  useTimer,
  useTimerBackend,
  useProjects,
} from '@ordo-todo/hooks';

// Stores
import {
  useWorkspaceStore,
  useUIStore,
  useTimerStore,
} from '@ordo-todo/stores';

// Core
import {
  Task,
  CreateTaskUseCase,
  CompleteTaskUseCase,
} from '@ordo-todo/core';

// API Client
import {
  OrdoApiClient,
  CreateTaskDto,
} from '@ordo-todo/api-client';

// i18n
import { locales } from '@ordo-todo/i18n';
```

---

### DEPENDENCIAS DE PACKAGES

```typescript
// packages/ui/package.json
{
  "name": "@ordo-todo/ui",
  "dependencies": {
    "@ordo-todo/core": "*",
    "@ordo-todo/api-client": "*",
    "@ordo-todo/hooks": "*",
    "@ordo-todo/stores": "*",
    "@ordo-todo/i18n": "*",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@radix-ui/react-dialog": "...",
    "@radix-ui/react-dropdown-menu": "...",
    // ... otros Radix UI
    "class-variance-authority": "...",
    "clsx": "...",
    "tailwind-merge": "...",
    "framer-motion": "...",
    "recharts": "...",
    "@dnd-kit/core": "...",
    "react-big-calendar": "...",
    "sonner": "...",
    "lucide-react": "...",
    "date-fns": "...",
    "chrono-node": "...", // para smart-capture
    "@tanstack/react-query": "..." // peer
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

### FLUJO DE DATOS FINAL

```
┌─────────────────────────────────────────────────────────┐
│                    APPS (Web/Desktop)                    │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Pages    │  │  Platform   │  │  App-specific   │  │
│  │  /routes   │  │  -specific  │  │    logic        │  │
│  └────────────┘  └─────────────┘  └─────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              @ordo-todo/UI (COMPONENTS)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Timer   │ │   Task   │ │ Project  │ │Analytics │  │
│  │Components│ │Components│ │Components│ │Components│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Providers (Query, Auth, Timer)           │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ @ordo-todo/  │ │ @ordo-todo/  │ │ @ordo-todo/  │
│    HOOKS     │ │   STORES     │ │     I18N     │
│              │ │              │ │              │
│ React Query  │ │   Zustand    │ │ Translations │
└──────┬───────┘ └──────────────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│ @ordo-todo/  │
│ API-CLIENT   │
│              │
│ Axios + DTOs │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│       Backend REST API            │
│  (NestJS - apps/backend)          │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│     @ordo-todo/CORE (Domain)      │
│  Use Cases + Entities + Repos    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│      @ordo-todo/DB (Prisma)       │
│        PostgreSQL Schema          │
└──────────────────────────────────┘
```

---

## RESUMEN EJECUTIVO

### ESTADÍSTICAS DEL PLAN

| Métrica | Valor |
|---------|-------|
| **Componentes a compartir** | 88+ |
| **Hooks a compartir** | 10+ |
| **Utilidades a compartir** | 8+ |
| **Providers a compartir** | 5 |
| **Líneas de código a mover** | ~10,000+ |
| **Funcionalidades nuevas (Web)** | 5 |
| **Funcionalidades nuevas (Desktop)** | 4 |
| **Duración estimada** | 13 semanas |
| **Tests a crear** | 100+ |

### BENEFICIOS ESPERADOS

1. **Reducción de duplicación:** ~40% menos código duplicado
2. **Consistencia:** UI y lógica 100% consistente entre plataformas
3. **Mantenibilidad:** 1 fix = ambas plataformas
4. **Velocidad de desarrollo:** Nuevas features → automáticamente en ambas
5. **Testing:** Tests compartidos → mejor cobertura
6. **Type Safety:** TypeScript end-to-end

### RIESGOS Y MITIGACIÓN

| Riesgo | Mitigación |
|--------|------------|
| Breaking changes durante migración | Feature flags, migración gradual |
| Divergencia de APIs plataforma | Abstracciones, interfaces |
| Tests rotos | CI/CD con tests automáticos |
| Performance | Code splitting, lazy loading |
| Bundle size | Tree shaking, análisis de bundle |

---

**PRÓXIMOS PASOS:** Iniciar Fase 1 - Componentes UI Base
