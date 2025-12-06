# Proyectos — Especificación de Diseño y Funcionamiento

**Última actualización:** 3 de Diciembre, 2025  
**Estado:** ✅ **COMPLETADO** (100%)

Este documento define la implementación del módulo de Proyectos en Ordo-Todo, alineado con la arquitectura de Workspaces basada en slugs y el nuevo sistema de diseño.

---

## 📊 Estado Actual

| Funcionalidad                  | Estado | Notas                                           |
| ------------------------------ | ------ | ----------------------------------------------- |
| CRUD de Proyectos              | ✅     | Crear, editar, archivar, eliminar               |
| Slug-based Routing             | ✅     | `/workspaces/:slug/projects/:projectSlug`       |
| Project Cards                  | ✅     | Diseño moderno con colores y progress bar       |
| Project Detail Page            | ✅     | Tabs: Overview, List, Board, Timeline, Settings |
| Vista Lista                    | ✅     | `ProjectList` con toggle de status              |
| Vista Kanban                   | ✅     | `ProjectBoard` con drag & drop funcional        |
| Vista Timeline                 | ✅     | `ProjectTimeline` con fechas                    |
| Project Templates (UI)         | ✅     | 6 templates con selección en modal              |
| Project Templates (Seed Tasks) | ✅     | Crea tareas iniciales automáticamente           |
| Project Settings (inline)      | ✅     | Configuración completa en detail page           |
| Progress Bar                   | ✅     | Barra de progreso visual en ProjectCard         |

**Progreso Total**: 100% ✅

---

## 1. Visión General y UX

Los proyectos son el corazón de la productividad en Ordo. Deben sentirse **vibrantes, rápidos y organizados**.

### Principios de Diseño

- **Visualmente Ricos**: Cada proyecto tiene color e icono distintivo
- **Estilo Plano y Sólido**: **NO USAR degradados ni transparencias**
- **Navegación Fluida**: Rutas amigables `/workspaces/:slug/projects/:projectSlug`
- **Vistas Flexibles**: Lista, Tablero (Kanban), Timeline
- **Interacciones Vivas**: Drag & drop suave, actualizaciones optimistas

---

## 2. Arquitectura Implementada

### Rutas Frontend

```
/workspaces/:slug/projects/:projectSlug
  → ProjectDetailPage
    → Tabs: Overview, List, Board, Timeline, Settings
```

### Componentes

```
apps/web/src/components/project/
├── board-column.tsx         # Columna del Kanban
├── create-project-dialog.tsx # Modal de creación con templates y seed tasks
├── kanban-task-card.tsx      # Tarjeta de tarea en Kanban
├── project-board.tsx         # Vista Kanban con dnd-kit
├── project-card.tsx          # Tarjeta en dashboard con progress bar
├── project-list.tsx          # Vista lista de tareas
├── project-settings.tsx      # Settings inline en detail page (NEW)
├── project-settings-dialog.tsx # Dialog de configuración
├── project-timeline.tsx      # Vista timeline
└── sortable-task.tsx         # Tarea sorteable (dnd-kit)
```

### API Endpoints Implementados

| Método | Ruta                                            | Descripción       |
| ------ | ----------------------------------------------- | ----------------- |
| GET    | `/workspaces/:id/projects`                      | Listar proyectos  |
| POST   | `/workspaces/:id/projects`                      | Crear proyecto    |
| GET    | `/projects/:id`                                 | Obtener por ID    |
| GET    | `/projects/by-slug/:workspaceSlug/:projectSlug` | Obtener por slugs |
| PUT    | `/projects/:id`                                 | Actualizar        |
| DELETE | `/projects/:id`                                 | Eliminar          |
| PATCH  | `/projects/:id/archive`                         | Archivar          |

---

## 3. Templates con Seed Tasks

Los templates están definidos en `apps/web/src/data/project-templates.ts`:

```typescript
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "software-dev",
    name: "Software Development",
    description: "Track bugs, features, and sprints",
    icon: Code,
    color: "#3b82f6",
    tasks: [
      { title: "Define project scope and requirements", priority: "HIGH" },
      { title: "Set up development environment", priority: "MEDIUM" },
      // ... más tareas
    ],
  },
  // ... otros templates (Marketing, Personal Goals, Home Renovation, Study Plan, Product Launch)
];
```

**Funcionalidad Implementada**:

- ✅ Al seleccionar un template, se rellena nombre, descripción y color
- ✅ Al crear el proyecto, se crean automáticamente las tareas del template
- ✅ Toast informativo con cantidad de tareas creadas

---

## 4. Project Settings Inline

El componente `ProjectSettings` (`apps/web/src/components/project/project-settings.tsx`) incluye:

### Sección General

- Selector de color
- Campo de nombre
- Campo de descripción
- Botón de guardar (deshabilitado si no hay cambios)

### Zona de Peligro

- **Archivar/Desarchivar**: Con feedback visual del estado actual
- **Eliminar**: Con diálogo de confirmación usando AlertDialog

---

## 5. Progress Bar en ProjectCard

El componente `ProjectCard` ahora muestra:

- Barra de progreso visual con color del proyecto
- Porcentaje de completado
- Contador de tareas completadas/total

---

## 6. Consideraciones Técnicas

### Drag & Drop (Implementado)

- Usando `@dnd-kit/core` y `@dnd-kit/sortable`
- Actualización optimista de UI
- Persistencia en backend con `useUpdateTask`

### Contadores Denormalizados

El schema tiene `tasksCount` y `completedTasksCount` en `Project`.

- **Opciones**: Actualizar con triggers de DB o recalcular en queries
- **Estado actual**: Se calcula en frontend desde array de tareas

---

## 7. Internacionalización (i18n)

El proyecto soporta **3 idiomas** con traducciones completas:

| Idioma         | Archivo                        | Estado      |
| -------------- | ------------------------------ | ----------- |
| English        | `apps/web/messages/en.json`    | ✅ Completo |
| Español        | `apps/web/messages/es.json`    | ✅ Completo |
| Português (BR) | `apps/web/messages/pt-br.json` | ✅ Completo |

**Secciones traducidas para Proyectos**:

- `ProjectDetail.*` - Página de detalle del proyecto
- `ProjectBoard.*` - Vista Kanban
- `ProjectCard.*` - Tarjetas de proyecto
- `ProjectSettingsDialog.*` - Configuración
- `CreateProjectDialog.*` - Dialog de creación

---

## 8. Próximos Pasos (Opcionales)

El módulo de Proyectos está **COMPLETO**. Mejoras futuras opcionales:

- [ ] **Keyboard Shortcuts**: Atajos para acciones rápidas
- [ ] **Better Empty States**: Ilustraciones cuando no hay tareas
- [ ] **Bulk Actions**: Seleccionar y mover múltiples tareas
- [ ] **Task Dependencies**: Bloquear tareas hasta completar dependencias

---

**Este módulo está COMPLETO y listo para producción.**
