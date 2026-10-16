# Plan de Refactorización - packages/ui

## Categorización de Archivos (37 totales)

### Categoría A: CONTAINER (Mover a apps/web) - 25 archivos
Componentes con lógica de estado (useState, useEffect, useForm):

**task/** (15 archivos):
- create-task-dialog.tsx ✅ useState + useForm
- task-form.tsx ✅ useState
- task-list.tsx ✅ useState
- task-detail-panel.tsx
- task-detail-view.tsx
- task-filters.tsx
- activity-feed.tsx
- assignee-selector.tsx
- attachment-list.tsx
- comment-thread.tsx
- file-upload.tsx
- recurrence-selector.tsx
- subtask-list.tsx
- task-card-compact.tsx

**project/** (11 archivos):
- project-list.tsx
- project-settings.tsx
- create-project-dialog.tsx
- project-settings-dialog.tsx
- project-files.tsx

**dashboard/** (5 archivos):
- dashboard-timer-widget.tsx
- habits-widget.tsx
- productivity-streak-widget.tsx
- stats-card.tsx ⚠️ Solo onClick, puede refactorizarse
- upcoming-tasks-widget.tsx
- weekly-activity-widget.tsx
- active-projects-widget.tsx

**ai/** (2 archivos):
- generate-report-dialog.tsx
- report-card.tsx

**workspace/** (3 archivos):
- workspace-selector.tsx
- create-workspace-dialog.tsx

**shared/** (7 archivos):
- shortcuts-dialog.tsx
- about-dialog.tsx
- breadcrumbs.tsx

**tag/** (3 archivos):
- create-tag-dialog.tsx
- tag-badge.tsx
- tag-selector.tsx

### Categoría B: PRESENTACIONAL (Remover 'use client') - 10 archivos
Componentes sin hooks, 'use client' innecesario:

- stats-card.tsx ⚠️ Ya analizado - NO tiene hooks
- [Analizar resto...]

### Categoría C: YA CORRECTOS - 2 archivos
- task-card.tsx ✅ No tiene 'use client'
- progress-ring.tsx ✅ No tiene 'use client', SVG puro

## Estrategia de Migración

### Fase 1: Remover 'use client' innecesario (Categoría B)
- Buscar componentes con 'use client' pero sin hooks
- Remover la primera línea
- Verificar que compile

### Fase 2: Crear Contenedores en apps/web (Categoría A)
- Crear `apps/web/src/components/task/` (y otros dominios)
- Mover componentes con estado
- Actualizar imports en apps/web

### Fase 3: Refactorizar packages/ui
- Mantener SOLO componentes presentacionales
- Asegurar platform-agnostic (no hooks de plataforma)
- Pasar estado/acciones vía props

### Fase 4: Actualizar exports
- Actualizar barrel files
- Verificar que no haya referencias rotas

## Comenzando con Fase 1
