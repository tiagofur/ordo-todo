# Migración a Packages - Estado de Fases

**Última actualización**: 2025-12-09

> **IMPORTANT**: See [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) for MANDATORY patterns.

---

## Resumen de Progreso

| Fase | Descripción | Componentes | Estado |
|------|-------------|-------------|--------|
| **Fase 1** | UI Base Components | 31 | ✅ Completada |
| **Fase 2** | Domain Components | 37 | ✅ Completada |
| **Fase 3** | Workspace, Tag, Auth, AI | 16 | ✅ Completada |
| **Fase 4** | Layout, Shared, Dashboard | 14 | ✅ Completada |
| **Fase 5** | Integración en Apps | - | 🚧 En Progreso |
| **Fase 6** | Funcionalidades Nuevas | - | ⏳ Pendiente |
| **Fase 7** | Testing | - | ⏳ Pendiente |
| **Fase 8** | Documentación | - | 🚧 En Progreso |

**Progreso total**: ~60% (91+ componentes migrados)

---

## ✅ Fase 1 COMPLETADA

### Objetivo
Migrar 31 componentes UI base desde apps/web al package compartido packages/ui

### Componentes Migrados

**Formularios y Entrada** (8):
- input, textarea, label, form, checkbox, switch, slider, select

**Diálogos y Modales** (6):
- dialog, sheet, alert-dialog, popover, dropdown-menu, command

**Visualización** (7):
- card, badge, avatar, table, tabs, calendar, date-picker

**Utilidades** (6):
- button, separator, scroll-area, progress, skeleton, sonner

**Especializados** (4):
- custom-icons, mention-textarea, empty-state, tooltip

### Métricas

| Métrica | Valor |
|---------|-------|
| Archivos migrados | 36 |
| Líneas agregadas | 2,561 |
| Componentes UI | 31 |
| Build status | ✅ Exitoso |

---

## ✅ Fase 2 COMPLETADA

### Objetivo
Migrar 37 componentes de dominio (Timer, Task, Project, Analytics)

### Componentes Migrados

**Timer Components (4)**:
- pomodoro-timer.tsx
- session-history.tsx
- task-selector.tsx
- timer-widget.tsx

**Task Components (15)**:
- activity-feed.tsx
- assignee-selector.tsx
- attachment-list.tsx
- comment-thread.tsx
- create-task-dialog.tsx
- file-upload.tsx
- recurrence-selector.tsx
- subtask-list.tsx
- task-card-compact.tsx
- task-card.tsx
- task-detail-panel.tsx
- task-detail-view.tsx
- task-filters.tsx
- task-form.tsx
- task-list.tsx

**Project Components (11)**:
- board-column.tsx
- create-project-dialog.tsx
- kanban-task-card.tsx
- project-board.tsx
- project-card.tsx
- project-files.tsx
- project-list.tsx
- project-settings-dialog.tsx
- project-settings.tsx
- project-timeline.tsx
- sortable-task.tsx

**Analytics Components (7)**:
- ai-weekly-report.tsx
- daily-metrics-card.tsx
- distribution-charts.tsx
- focus-score-gauge.tsx
- peak-hours-chart.tsx
- productivity-insights.tsx
- weekly-chart.tsx

### Métricas

| Métrica | Valor |
|---------|-------|
| Archivos migrados | 42 |
| Líneas agregadas | 8,377 |
| Total componentes | 67 (30 base + 37 dominio) |

---

## ✅ Fase 3 COMPLETADA

### Objetivo
Migrar Workspace, Tag, Auth, AI components

### Componentes Migrados

**Workspace (3)**:
- workspace-card.tsx
- workspace-selector.tsx
- create-workspace-dialog.tsx

**Tag (3)**:
- tag-badge.tsx
- tag-selector.tsx
- create-tag-dialog.tsx

**Auth (1)**:
- auth-form.tsx

**AI (2)**:
- generate-report-dialog.tsx
- report-card.tsx

### Métricas

| Métrica | Valor |
|---------|-------|
| Componentes migrados | 9 |
| Total acumulado | 76 componentes |

---

## ✅ Fase 4 COMPLETADA

### Objetivo
Migrar Layout, Shared, Dashboard components

### Componentes Migrados

**Layout (2)**:
- sidebar.tsx
- topbar.tsx

**Shared (7)**:
- breadcrumbs.tsx
- confirm-delete.tsx
- loading.tsx
- about-dialog.tsx
- shortcuts-dialog.tsx
- sync-status-indicator.tsx
- profile-tabs.tsx

**Dashboard (5)**:
- stats-card.tsx
- active-projects-widget.tsx
- productivity-streak-widget.tsx
- upcoming-tasks-widget.tsx
- weekly-activity-widget.tsx

### Métricas

| Métrica | Valor |
|---------|-------|
| Componentes migrados | 14 |
| Total acumulado | 91+ componentes |

---

## 🚧 Fase 5 EN PROGRESO

### Objetivo
Integración completa en apps - actualizar imports para usar @ordo-todo/ui

### Tareas Pendientes

- [ ] Actualizar imports en apps/web
- [ ] Actualizar imports en apps/desktop
- [ ] Eliminar componentes duplicados de apps
- [ ] Validar que todo funciona
- [ ] Ejecutar tests de regresión

### Componentes Adicionales a Migrar

**Desde apps/web** (pendientes):
- form/ (email-field, password-field, text-field, mini-form)
- notification-popover
- connection-status
- pwa-install-button

**Desde apps/desktop** (pendientes):
- voice-input
- hover-card
- templates

---

## ⏳ Fase 6 PENDIENTE

### Objetivo
Implementar funcionalidades faltantes cross-platform

### Web ← Desktop
- Task Health Score
- Templates system
- Voice Input
- Smart Capture
- Dependencies UI

### Desktop ← Web
- Workflows
- Recurrence Selector
- Task Sharing
- AI Assistant Chat

---

## ⏳ Fase 7 PENDIENTE

### Objetivo
Testing completo

### Tareas
- [ ] Tests unitarios para componentes (80% cobertura)
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Tests de regresión visual (Storybook)

---

## 🚧 Fase 8 EN PROGRESO

### Objetivo
Documentación completa

### Completado
- [x] README.md por package
- [x] COMPONENT_GUIDELINES.md
- [x] Actualización CLAUDE.md
- [x] Actualización docs/packages/README.md

### Pendiente
- [ ] Storybook interactivo
- [ ] Migration guide detallado
- [ ] Architecture docs

---

## Patrón de Componentes (MANDATORY)

Todos los componentes DEBEN seguir este patrón:

```typescript
// packages/ui/src/components/[domain]/component-name.tsx

// Imports: solo relativos con .js
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';

// Props: todo como props (data, callbacks, labels)
interface ComponentProps {
  data: Data;                    // Datos del padre
  onAction: () => void;          // Callbacks del padre
  labels?: { title?: string };   // i18n del padre
}

// Component: solo UI state local
export function Component({ data, onAction, labels }: ComponentProps) {
  // NO hooks externos
  // NO store access
  // NO API calls
  return (...);
}
```

Ver [Component Guidelines](/docs/COMPONENT_GUIDELINES.md) para documentación completa.

---

## Comandos Útiles

```bash
# Build packages/ui
npm run build --filter=@ordo-todo/ui

# Type check
npm run check-types --filter=@ordo-todo/ui

# Development
npm run dev

# Test
npm run test
```

---

**Última actualización**: 2025-12-09
