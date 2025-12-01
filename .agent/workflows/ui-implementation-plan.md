# Phase 4: Web UI Implementation Plan

## Objetivo
Implementar la interfaz de usuario completa para Ordo-Todo, conectando con el backend tRPC ya implementado.

## Estructura de Componentes

### 1. Layout & Navigation ⏳
- [ ] `Sidebar` - Navegación principal con workspaces/projects
- [ ] `TopBar` - Barra superior con búsqueda, notificaciones, perfil
- [ ] `PageContainer` - Contenedor principal con breadcrumbs

### 2. Authentication ✅ (Ya existe)
- [x] `LoginForm` 
- [x] `SignupForm`
- [x] OAuth buttons

### 3. Dashboard 🔜
- [ ] `DashboardView` - Vista principal "Today"
- [ ] `QuickStats` - Métricas rápidas (tareas completadas, tiempo trabajado)
- [ ] `UpcomingTasks` - Tareas próximas

### 4. Workspaces 🔜
- [ ] `WorkspaceSelector` - Dropdown para cambiar workspace
- [ ] `WorkspaceCard` - Card para mostrar workspace
- [ ] `CreateWorkspaceDialog` - Modal para crear workspace
- [ ] `WorkspaceSettings` - Configuración de workspace
- [ ] `MemberList` - Lista de miembros
- [ ] `InviteMemberDialog` - Modal para invitar

### 5. Projects 🔜
- [ ] `ProjectList` - Lista de proyectos
- [ ] `ProjectCard` - Card individual de proyecto
- [ ] `CreateProjectDialog` - Modal para crear proyecto
- [ ] `ProjectSettings` - Configuración de proyecto
- [ ] `ArchiveProjectButton` - Botón para archivar

### 6. Tasks ✅ (Básico existe)
- [x] `TaskList` - Lista de tareas
- [x] `TaskForm` - Formulario de tarea
- [ ] `TaskDetail` - Vista detallada de tarea
- [ ] `TaskFilters` - Filtros (status, priority, tags)
- [ ] `TaskViews` - Switcher entre List/Kanban/Calendar
- [ ] `KanbanBoard` - Vista Kanban
- [ ] `CalendarView` - Vista de calendario
- [ ] `SubTaskList` - Lista de sub-tareas

### 7. Tags 🔜
- [ ] `TagList` - Lista de tags
- [ ] `TagBadge` - Badge de tag
- [ ] `CreateTagDialog` - Modal para crear tag
- [ ] `TagSelector` - Selector multi-tag

### 8. Timer/Pomodoro 🔜
- [ ] `PomodoroTimer` - Timer principal
- [ ] `TimerWidget` - Widget compacto en sidebar
- [ ] `TimerSettings` - Configuración de timer
- [ ] `SessionHistory` - Historial de sesiones

### 9. Analytics 🔜
- [ ] `DailyMetricsCard` - Card con métricas del día
- [ ] `WeeklyChart` - Gráfico semanal
- [ ] `ProductivityInsights` - Insights de productividad

### 10. Settings 🔜
- [ ] `ProfileSettings` - Configuración de perfil
- [ ] `ThemeSettings` - Tema y apariencia
- [ ] `NotificationSettings` - Configuración de notificaciones
- [ ] `PreferencesSettings` - Preferencias generales

## Orden de Implementación Recomendado

### Sprint 1: Core Layout & Navigation (2-3 días)
1. Sidebar con navegación básica
2. TopBar con perfil
3. PageContainer
4. Integrar con rutas existentes

### Sprint 2: Workspaces & Projects (2-3 días)
1. WorkspaceSelector
2. CreateWorkspaceDialog
3. ProjectList & ProjectCard
4. CreateProjectDialog
5. Conectar con tRPC endpoints

### Sprint 3: Enhanced Tasks (3-4 días)
1. TaskDetail view
2. TaskFilters
3. Tag integration
4. Sub-tasks
5. Task dependencies

### Sprint 4: Timer & Analytics (2-3 días)
1. PomodoroTimer
2. TimerWidget
3. DailyMetricsCard
4. Session tracking

### Sprint 5: Advanced Features (2-3 días)
1. KanbanBoard
2. CalendarView
3. Settings pages
4. Polish & UX improvements

## Tecnologías a Usar

- **UI Components**: Radix UI (ya instalado)
- **Styling**: Tailwind CSS v4 (ya configurado)
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query (vía tRPC)
- **Icons**: Lucide React (ya instalado)
- **Notifications**: Sonner (ya instalado)
- **Drag & Drop**: @dnd-kit (para Kanban)
- **Calendar**: react-day-picker (ya instalado)
- **Charts**: recharts o tremor

## Próximos Pasos Inmediatos

1. ✅ Crear este plan de implementación
2. 🔜 Implementar Sidebar básico
3. 🔜 Implementar TopBar
4. 🔜 Crear layout principal
5. 🔜 Dashboard "Today" view
