# Tareas — Especificación de diseño y funcionamiento

Última actualización: 2025-12-03

Este documento define cómo deben ser y comportarse las Tareas (Tasks) en Ordo-Todo: modelo de datos, reglas de negocio, integraciones, endpoints (NestJS), esquemas Prisma, pantallas UI/UX, micro-flujos, consideraciones de rendimiento, pruebas y criterios de aceptación. Está pensado como guía para desarrollo y diseño.

---

## 1. Propósito y alcance

- Una *Tarea* es la unidad atómica de trabajo que puede pertenecer a:
  - Un Project (recomendado y obligatorio por la jerarquía Workspace → Project → Task).
  - Un Workspace (si se permite tareas sueltas, deben etiquetarse como "Unassigned" o "Inbox").
- Objetivos:
  - Capturar trabajo, seguimiento de estado, asignación, tiempo, y progreso.
  - Soportar subtareas/checklists, comentarios, adjuntos y time-tracking.
  - Ofrecer múltiples vistas (lista, card, kanban, calendario) y permitir acciones rápidas.

---

## 2. Conceptos clave y estados

- Status / Estado:
  - TODO (pendiente)
  - IN_PROGRESS (en progreso)
  - BLOCKED (bloqueada)
  - REVIEW (en revisión) — opcional
  - COMPLETED (completada)
  - CANCELED (cancelada)
- Priority (prioridad):
  - LOW, MEDIUM, HIGH, URGENT
- Visibility:
  - private (solo miembros asignados / workspace), public (miembros del workspace)
- Types / Templates:
  - Task simple, Checklist, Bug, Story, Spike (para equipos engineering)

---

## 3. Información que debe contener una tarea (campos)

Campos principales:
- id (UUID/cuid)
- workspaceId (FK)
- projectId (FK) — preferible obligatorio
- parentId (nullable) — para subtareas
- title (string) — required
- description (text / rich text) — opcional
- status (enum)
- priority (enum)
- estimate (minutes) — tiempo estimado
- timeTracked (minutes) — acumulado desde timers
- dueDate (datetime, optional)
- startDate (datetime, optional)
- assigneeId (userId, optional) — responsable principal
- reporterId (userId) — quien creó/reportó (útil para bugs/requests)
- watchers [] (userId array) — usuarios que reciben notifs
- tags [] — many-to-many
- attachments [] — relationship to storage
- commentsCount (int) — counter cached
- attachmentsCount (int)
- subtasksCount (int), completedSubtasksCount (int)
- recurrence (json / recurrence rule) — para tareas recurrentes
- customFields (json) — flexible schema
- isArchived (bool) / isDeleted (soft delete)
- createdAt / updatedAt / completedAt

Metadatos:
- lockedBy (for edit-lock concurrency)
- externalReferences (e.g., GitHub issue id)
- aiSuggestions (optional)

---

## 4. Relaciones y modelado (resumen)

- Task belongsTo Project
- Task belongsTo Workspace (via project or directly)
- Task hasMany Subtasks (self-relation parentId)
- Task hasMany Comments, Attachments, TimeEntries
- Task many-to-many Tags
- Task many-to-many Watchers (or array of userIds)
- Counters maintained (tasksCount in Project, subtasksCount, etc.)

---

## 5. Regla de negocio importantes

- No permitir tareas huérfanas: si projectId obligatorio, bloquear creación sin project; si se muta project y target workspace diferente, validar permisos y migrar.
- Subtareas heredan workspace/project del padre.
- Completar tarea principal no necesariamente completa subtareas — opción configurable.
- Recurrencia: crear nueva tarea instanciada por job cuando vence; mantener link con origin (recurrenceId).
- Cambio de status a COMPLETED → registrar completedAt y sumar a métricas.
- Time tracking: cada sesión del timer se asocia a taskId; al parar, sumar a timeTracked y log en TimeEntries.
- Concurrency: edición simultánea debe soportar optimistic locking (updatedAt / version) o locks temporales.
- Permisos: workspace roles se aplican (OWNER/ADMIN/MEMBER/GUEST). Además TaskOwner (assignee) puede modificar ciertas propiedades.
- Bulk actions: permitir completar, cambiar prioridad, asignar por lotes.

---

## 6. Integraciones relevantes

- Timer (Pomodoro / Continuous):
  - Start/stop vinculado a taskId.
  - Auto-log de sesiones como TimeEntry.
- Calendar (Google/Outlook):
  - dueDate y scheduled sessions sincronizables.
- GitHub/GitLab:
  - link issue/PR ↔ task (bidireccional si se implementa).
- Slack/Teams:
  - Notificaciones on task assign, due soon, overdue, completed.
- Storage (S3/Drive):
  - Attachments, thumbnails.
- AI:
  - NLP parsing de textos al crear (p. ej. "Llamar a Juan mañana 3pm" → title + dueDate).
  - Suggestions de estimación, priorización.
- Webhooks:
  - Emit events task.created/updated/completed.

---

## 7. API (NestJS) — Endpoints sugeridos

Base: `/api/workspaces/:workspaceId/projects/:projectId/tasks`

Operaciones (autenticadas + guards):
- GET    /.../tasks
  - Listar tasks del proyecto con filtros: status, assignee, priority, tags, dueRange, search, view (kanban/list), pagination.
- POST   /.../tasks
  - Crear task. Body: CreateTaskDto
- GET    /.../tasks/:taskId
  - Detalle task (incluye comments, attachments top N, subtasks summary)
- PATCH  /.../tasks/:taskId
  - Actualizar task (partial update)
- POST   /.../tasks/:taskId/complete
  - Marcar completa (opcional body: { markSubtasks: boolean })
- POST   /.../tasks/:taskId/assign
  - Assignar a user { assigneeId }
- POST   /.../tasks/:taskId/subtasks
  - Crear subtask
- GET    /.../tasks/:taskId/subtasks
- POST   /.../tasks/bulk (bulk actions)
  - Body: { action: 'complete'|'assign'|'move', ids:[], payload }
- POST   /.../tasks/:taskId/comments
  - Añadir comentario
- POST   /.../tasks/:taskId/attachments
  - Subir adjunto (multipart or presigned)
- POST   /.../tasks/:taskId/time-entries/start
  - Start timer
- POST   /.../tasks/:taskId/time-entries/stop
  - Stop timer
- POST   /.../tasks/:taskId/recurrence/skip|reschedule
  - Management for recurring tasks
- POST   /.../tasks/:taskId/lock|unlock
  - Optional edit locks

Seguridad y validaciones:
- Guardas JwtAuthGuard + WorkspaceRolesGuard + TaskPermissionGuard
- DTO validations con class-validator
- Rate limit endpoints sensibles (bulk, attachments)

---

## 8. Prisma model (ejemplo)

```prisma
model Task {
  id                    String       @id @default(cuid())
  projectId             String
  project               Project      @relation(fields: [projectId], references: [id])
  workspaceId           String
  workspace             Workspace    @relation(fields: [workspaceId], references: [id])
  parentId              String?      
  parent                Task?        @relation("Subtasks", fields: [parentId], references: [id])
  subtasks              Task[]       @relation("Subtasks")
  title                 String
  description           String?
  status                TaskStatus   @default(TODO)
  priority              Priority     @default(MEDIUM)
  estimate              Int?         // minutes
  timeTracked           Int          @default(0) // minutes
  dueDate               DateTime?
  startDate             DateTime?
  assigneeId            String?
  assignee              User?        @relation(fields: [assigneeId], references: [id])
  reporterId            String
  reporter              User         @relation(fields: [reporterId], references: [id])
  watchers              TaskWatcher[]
  tags                  TaskTag[]    @relation("TaskTags")
  commentsCount         Int          @default(0)
  attachmentsCount      Int          @default(0)
  subtasksCount         Int          @default(0)
  completedSubtasksCount Int         @default(0)
  recurrenceRule        Json?
  customFields          Json?
  isArchived            Boolean      @default(false)
  isDeleted             Boolean      @default(false)
  completedAt           DateTime?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  @@index([projectId])
  @@index([workspaceId])
  @@index([assigneeId])
  @@index([status])
}
```

Notas:
- TaskWatcher modelo simple para relación many-to-many con usuarios.
- Considerar tablas auxiliares: TimeEntry, Attachment, Comment.

---

## 9. UI / UX — pantallas y componentes

### 9.1 Task List / Board (dentro Project)
- Header con: Search, Filters (status, priority, assignee, tags, due range), View toggle (list/kanban/calendar), Quick Add input.
- Kanban:
  - Columns dinámicos (To Do, In Progress, Review, Done).
  - Card summary: title, assignee avatar, due date pill, priority color, tags, timeTracked.
  - Card actions on hover: quick complete, assign, add subtask, open detail.
  - Drag & drop con WIP visual indicator y undo snackbar.
- List:
  - Rows with columns: checkbox, title (expandable), assignee, dueDate, priority, timeTracked, actions.
  - Bulk select actions: complete, change assignee, move project, set priority.
- Search:
  - Live search with highlighting; support for "quick filters" (e.g., `@me`, `#urgent`, `due:today`).

### 9.2 Task Card / Task Row
- Compact footprint but with essential meta.
- Accessibility: button focus states and keyboard support.
- Tooltip with full description on hover (or preview in popover).

### 9.3 Task Detail Modal / Page
- Header: title (editable inline), status badge, priority, assignee avatars, dueDate, timeTracked with Start/Stop timer.
- Left column (primary):
  - Description (rich text) with edit history.
  - Subtasks checklist (inline add, reorder, bulk complete).
  - Comments feed (realtime), attachments.
- Right column (sidebar):
  - Meta: project, tags, watchers, estimates, recurrence, custom fields.
  - Activity: audit events for the task.
  - Quick actions: duplicate task, move to project, change assignee, add watcher, set reminder.
- Behavior:
  - Auto-save drafts, optimistic UI, conflict warning if another user edits same field.
  - "Apply AI suggestions" CTA (if AI available) to set estimate, tags, or rewrite description.

### 9.4 Create / Edit Task dialog
- Minimal required fields: title, project (auto if from project context), assignee, dueDate.
- Advanced section (collapsible): description, estimation, tags, recurring options, attachments.
- Smart capture input: parse natural language (via AI or simple parsing library).

### 9.5 Quick Capture / Command Palette
- Global quick-add with NLP: supports `title #project @assignee due:tomorrow p:high`.
- Shortcut (Cmd/Ctrl+K or N) to open and create quickly.

### 9.6 Mobile
- Bottom sheet for task detail.
- Swipe gestures in kanban/list to complete or snooze.
- Deep-link for notifications to open task detail.

---

## 10. Micro-flows y casos de uso

1. Crear tarea desde inbox (quick capture)
   - Parseo NLP → pre-llenar fields → crear y mostrar toast + undo.
2. Asignar y notificar
   - Al assignar, notificar a user (push/email/Slack si activado).
3. Completar con subtareas pendientes
   - Opciones: force complete (mark subtasks complete), prevent complete (show modal).
4. Recurrence tick
   - Job crea next instance y copia fields relevantes; original marked completed if recurring pattern requires.
5. Move task between projects
   - Validate user has write permissions in target space; update counters atomically.
6. Bulk complete
   - Long operation processed server-side with progress UI if > N tasks; allow undo within grace period.

---

## 11. Notificaciones y reglas (alerts)

- Events to notify:
  - Assigned to task
  - Task due in X hours (configurable): reminders
  - Task overdue
  - Task commented
  - Task completed
- Notification channels: in-app, email (digest or immediate), push, Slack.
- Allow workspace-level notification policies and user overrides.

---

## 12. Recurrencia y tareas programadas

- Implementar con RFC 5545 or simple recurrence rules (RRULE).
- Store rule in recurrenceRule (json) and maintain masterRecurringId for traceability.
- Worker picks due tasks per schedule and creates instances; ensure idempotency (dedupe by recurrence instance id).

---

## 13. Rendimiento, índices y counters

- Indexes: projectId, workspaceId, assigneeId, status, dueDate.
- Counters: update tasksCount and completedTasksCount in Project via transaction or via async job (preferred for large scale).
- Pagination & search: use full-text search for title/description, with priority to title.
- Cache: query results for list views per user + ws/project; invalidate on writes.

---

## 14. Seguridad y gobernanza

- Input sanitization: description rich text sanitized to prevent XSS.
- Attachments: presigned uploads + virus scanning (optional).
- Permissions: server-enforced checks for every write.
- Soft delete + retention policies.
- Audit logs: TASK_CREATED, TASK_UPDATED, TASK_ASSIGNED, TASK_COMPLETED, TASK_DELETED with actor & payload.

---

## 15. Testing y QA

- Unit tests:
  - Services: create, update, complete, assign, move, recurrence create.
- Integration tests:
  - End-to-end flows: create task -> assign -> complete -> time entry.
  - Permission enforcement tests (members vs guests).
- E2E:
  - Kanban move, bulk actions, attachments upload.
- Load tests:
  - List tasks with large paginated sets and many concurrent edits.

---

## 16. Observabilidad y métricas

- Logs structured for events with taskId, actorId, workspaceId, projectId.
- Metrics:
  - Tasks created/day, tasks completed/day, average time to complete, overdue count.
- Tracing for long operations (clone, bulk actions).
- Alerting: spikes in failed job queue (recurrence/job workers), high error rate in attachments.

---

## 17. Migración y seeds

- Seed: create sample tasks in sample project (To Do, In Progress, Done).
- Migration notes:
  - If actualmente hay tareas sin project, migrarlas a Project "Inbox" por workspace.
  - Compute counters in migration script.

---

## 18. Criterios de aceptación (MVP Tasks)

1. Crear/editar/eliminar (soft delete) tarea con los campos base.
2. Asignación funcional con notificación in-app.
3. Subtareas checklist con contador y completado parcial.
4. Timer start/stop atribuye tiempo a task y se refleja en timeTracked.
5. Vistas Kanban y List básicas con drag & drop y bulk actions.
6. Permisos respetados por roles.
7. API con endpoints documentados y tests básicos.

---

## 19. DTOs de ejemplo (NestJS)

```ts
// create-task.dto.ts
import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsEnum(['TODO','IN_PROGRESS','BLOCKED','REVIEW','COMPLETED','CANCELED'])
  status?: string;

  @IsOptional()
  @IsEnum(['LOW','MEDIUM','HIGH','URGENT'])
  priority?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimate?: number; // minutes
}
```

```ts
// complete-task.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';

export class CompleteTaskDto {
  @IsOptional()
  @IsBoolean()
  markSubtasks?: boolean = false;
}
```

---

## 20. Ejemplo service skeleton (pseudo-code)

```ts
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private events: EventEmitter2) {}

  async create(userId, dto: CreateTaskDto) {
    // validate project membership & permissions
    const task = await this.prisma.task.create({ data: { ...dto, reporterId: userId }});
    await this.prisma.project.update({ where: { id: dto.projectId }, data: { tasksCount: { increment: 1 } }});
    this.events.emit('task.created', { taskId: task.id, userId });
    return task;
  }

  async complete(userId, taskId, opts: CompleteTaskDto) {
    // permission checks
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.task.update({ where: { id: taskId }, data: { status: 'COMPLETED', completedAt: now }});
      await tx.project.update({ where: { id: projectId }, data: { completedTasksCount: { increment: 1 } }});
      if (opts.markSubtasks) { ... mark subtasks ... }
      await tx.taskAudit.create({ data: { taskId, actorId: userId, action: 'COMPLETED' }});
    });
    this.events.emit('task.completed', { taskId, userId });
  }
}
```

---

## 21. Recomendaciones y mejoras UX (sugerencias)

- Smart Capture + NLP: reduce fricción en creación de tasks.
- Templates y "quick add" con presets de campos.
- "Focus Mode" task (similar a Pomodoro): single task view minimalista.
- Health indicator por task (e.g., "At risk" si overdue y alto prioridad).
- Auto-snooze/remind: posponer reminders si el usuario marca snooze.
- Inline edit everywhere (title, dueDate, priority) para acelerar flujos.
- Offline support (crear tasks offline y sync) para mobile PWA.

---

## 22. Roadmap futuro (ideas avanzadas)

- Dependencias entre tareas + recalculo automático de fechas.
- Estimaciones automáticas con IA.
- Predictions: probabilidad de atraso, tiempo real de completion.
- Task templates marketplace, integraciones deeper (Jira, Asana import).
- Cross-project bulk actions and move with conflict resolution.
- SLA and escalation policies (para tareas críticas/cliente).

---

Si quieres, en el próximo paso puedo:
- Generar el PR con modelos Prisma + migration para Task + TimeEntry + Comment + Attachment; o
- Crear wireframes detallados para Task List / Task Detail / Quick Capture; o
- Generar los controllers y servicios NestJS completos (esqueleto con DTOs y pruebas unitarias básicas).

Dime cuál prefieres y procedo.
---

---

## 23. Plan de Mejoras y Roadmap de Implementación

**Última actualización:** 2025-12-05

### 📊 Resumen de Progreso

**Completadas (12/15):**
- ✅ P1: Captura Inteligente con NLP
- ✅ P2: Vista de Calendario Completa
- ✅ P3: Templates de Tareas
- ✅ P4: Keyboard Shortcuts Mejorados
- ✅ P5: Task Health Indicators
- ✅ P6: Dependencias entre Tareas
- ✅ P7: Estimaciones Automáticas con IA
- ✅ P8: Modo Focus y Deep Work
- ✅ P9: Dashboard de Productividad Mejorado
- ✅ P10: Smart Notifications con ML
- ✅ P14: Voice Input
- ✅ P15: Collaborative Editing Real-time

**Pendientes:**
- ⏭️ P11: Offline-First Support (Mobile específico)
- ⏭️ P12: Gestos y Swipe Actions (Mobile específico)
- ✅ P13: Time Tracking Automático (Ya implementado - Pomodoro)


### ⚠️ NOTA IMPORTANTE
Algunas de las funcionalidades propuestas en este plan **YA ESTÁN IMPLEMENTADAS** en la aplicación actual. Antes de implementar cualquier mejora:
1. **REVISAR** la implementación existente
2. **PROPONER** mejoras específicas para aprobación
3. **ESPERAR APROBACIÓN** antes de realizar cambios
4. **NO implementar** mejoras por cuenta propia sin consultar

---

### 23.1 Mejoras de Alta Prioridad (Sprint 1-2)

#### 🎯 P1: Captura Inteligente con NLP
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Parseo inteligente de texto al crear tareas.
Ejemplo: `"Llamar a Juan mañana 3pm #MyProject !high"`

**Implementación realizada:**
- ✅ Utilidad `parseTaskInput` en `apps/desktop/src/utils/smart-capture.ts`.
- ✅ Integración con `chrono-node` (ES/EN) para detección de fechas.
- ✅ Regex para Prioridad (`!high`, `p:1`).
- ✅ Detección de Proyectos (`#Nombre`) y Miembros (`@Nombre`).
- ✅ Integración en `CreateTaskDialog` vía botón "AI Magic".

**Archivos creados/modificados:**
- `apps/desktop/src/utils/smart-capture.ts` (nuevo)
- `apps/desktop/src/components/task/create-task-dialog.tsx` (modificado)

---

---

#### 📅 P2: Vista de Calendario Completa
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Vista mensual interactiva de tareas.

**Implementación realizada:**
- ✅ Página `/calendar` con ruta y lazy loading.
- ✅ Componente `CalendarView` (Grid mensual) usando `date-fns`.
- ✅ Visualización de tareas en el día correspondiente.
- ✅ HoverCard para detalles rápidos de tareas.
- ✅ Enlace en Sidebar.

**Archivos creados/modificados:**
- `apps/desktop/src/pages/Calendar.tsx` (nueva página)
- `apps/desktop/src/components/calendar/calendar-view.tsx` (nuevo componente)
- `apps/desktop/src/components/ui/hover-card.tsx` (nuevo componente UI)
- `apps/desktop/src/routes/index.tsx` (ruta)
- `apps/desktop/src/components/layout/Sidebar.tsx` (nav)

---

#### 📋 P3: Templates de Tareas
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Plantillas predefinidas (Bug Report, Weekly Review, etc.)

**Implementación realizada:**
- ✅ Modelo `TaskTemplate` en Prisma asociado al Workspace
- ✅ Endpoints Backend (CRUD) en `TemplatesController`
- ✅ UI `TemplateManager` para crear, editar y eliminar templates
- ✅ Integración en `CreateTaskDialog` con `TemplateSelector`
- ✅ Soporte para pre-llenar: Título (con patrones de fecha), Descripción, Prioridad

**Archivos creados/modificados:**
- `packages/db/prisma/schema.prisma` (modelo)
- `apps/backend/src/templates/` (módulo completo)
- `apps/desktop/src/components/templates/` (componentes UI)
- `apps/desktop/src/hooks/api/use-templates.ts` (hooks)
- `apps/desktop/src/components/task/create-task-dialog.tsx` (modificado)

---

---

#### ⌨️ P4: Keyboard Shortcuts Mejorados
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Sistema completo de atajos (j/k navigation, x to complete).

**Implementación realizada:**
- ✅ Hook `useTaskNavigation` para lógica de navegación en listas.
- ✅ Soporte para teclas `j` (abajo) y `k` (arriba) para navegar.
- ✅ Soporte para tecla `x` para completar tarea.
- ✅ Soporte para tecla `Enter` para abrir detalles.
- ✅ Integración en `TaskList` y `TaskCard` con estilos de foco visual.
- ✅ Actualización de `ShortcutsDialog`.

**Archivos creados/modificados:**
- `apps/desktop/src/hooks/use-task-navigation.ts` (nuevo hook)
- `apps/desktop/src/components/task/task-list.tsx` (integración)
- `apps/desktop/src/components/task/task-card.tsx` (estilos e interacción)
- `apps/desktop/src/components/dialogs/ShortcutsDialog.tsx` (doc)

---

#### 💊 P5: Task Health Indicators
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Indicadores visuales del estado de salud (🟢🟡🔴)

**Implementación realizada:**
- ✅ Función `calculateTaskHealth()` con 6 factores ponderados:
  - Due Date (25%): Verifica si tiene fecha y no está vencida
  - Assignee (20%): Verifica si tiene asignado
  - Estimate (15%): Verifica si tiene estimación de tiempo
  - Description (10%): Verifica si tiene descripción
  - Activity (15%): Verifica actividad reciente (< 7 días)
  - Subtasks (15%): Verifica progreso de subtareas (≥ 50%)
- ✅ Sistema de scoring 0-100 con estados:
  - 🟢 Healthy (≥ 70 puntos)
  - 🟡 At Risk (40-69 puntos)
  - 🔴 Critical (< 40 puntos o overdue)
- ✅ Componente `TaskHealthBadge` con tooltip detallado
- ✅ Integrado en `KanbanTaskCard` y `TaskCard`
- ✅ Recomendaciones automáticas basadas en factores no cumplidos

**Archivos creados/modificados:**
- `apps/desktop/src/utils/task-health.ts` (nuevo)
- `apps/desktop/src/components/task/task-health-badge.tsx` (nuevo)
- `apps/desktop/src/components/project/kanban-task-card.tsx` (modificado)
- `apps/desktop/src/components/task/task-card.tsx` (modificado)

---

### 23.2 Mejoras de Funcionalidad Core (Sprint 3-4)

#### 🔗 P6: Dependencias entre Tareas
#### ⛓️ P6: Dependencias entre Tareas
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Sistema de dependencias (BLOCKS, BLOCKED_BY) para controlar el flujo de trabajo.

**Implementación realizada:**
- ✅ Modelo `TaskDependency` en Prisma (ya existía).
- ✅ Backend: Endpoints en `TasksController` para añadir/quitar dependencias.
- ✅ Lógica en `TasksService`: Prevención de dependencias circulares directas.
- ✅ Frontend: Hook `useTaskDependencies`.
- ✅ UI: Pestaña "Bloqueos" en `TaskDetailPanel` con lista de bloqueos y opción para añadir (búsqueda).

**Archivos creados/modificados:**
- `apps/backend/src/tasks/tasks.service.ts` (lógica)
- `apps/backend/src/tasks/tasks.controller.ts` (endpoints)
- `apps/desktop/src/lib/api-client.ts` (métodos)
- `apps/desktop/src/hooks/api/use-tasks.ts` (hooks)
- `apps/desktop/src/components/task/dependency-list.tsx` (nuevo componente UI)
- `apps/desktop/src/components/task/task-detail-panel.tsx` (integración)

---

#### 🧠 P7: Estimaciones Automáticas con IA
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Sugerencias automáticas de duración basadas en tareas similares (Local ML) con fallback a Gemini AI.

**Implementación realizada:**
- ✅ Documentada estrategia "Local-First AI" en `docs/plans/ai-optimization-strategy.md`.
- ✅ Backend: `AIService` implementa estrategia Híbrida (Usa heurísticas locales primero, si la confianza es baja, consulta a Gemini).
- ✅ Backend: `GeminiAIService` añadido método `estimateTaskDuration` con prompt JSON optimizado.
- ✅ Frontend: Botón "Auto Estimate" en `CreateTaskDialog`.
- ✅ DTO: Añadido soporte para `estimatedMinutes` en creación de tareas.

**Archivos creados/modificados:**
- `docs/plans/ai-optimization-strategy.md` (Nuevo)
- `apps/backend/src/ai/ai.service.ts` (Lógica híbrida)
- `apps/backend/src/ai/gemini-ai.service.ts` (Integración LLM)
- `apps/desktop/src/components/task/create-task-dialog.tsx` (UI)

---

#### 🎯 P8: Modo Focus y Deep Work
**Estado:** ✅ COMPLETADO (2025-12-05)

**Descripción:** Vista minimalista para concentración máxima, sincronizada con el Pomodoro global.

**Implementación realizada:**
- ✅ Arquitectura: Implementado `TimerContext` para estado global del temporizador.
- ✅ UI: Página `/focus` con diseño minimalista, ambient lights y controles grandes.
- ✅ Integración: Refactorizado `PomodoroTimer` para usar el contexto global.
- ✅ Navegación: Botón maximizar en el widget del timer para entrar al modo focus.
- ✅ Sincronización: El estado persiste al navegar entre Dashboard, Timer y Focus Mode.

**Archivos creados/modificados:**
- `apps/desktop/src/contexts/timer-context.tsx` (Nuevo)
- `apps/desktop/src/pages/FocusMode.tsx` (Nuevo)
- `apps/desktop/src/components/timer/pomodoro-timer.tsx` (Refactor)
- `apps/desktop/src/components/providers/index.tsx` (Provider)

---

#### 📊 P9: Dashboard de Productividad Mejorado
**Estado:** ✅ COMPLETADO

**Descripción:** Implementación de dashboard completo con múltiples visualizaciones de datos reales.

**Implementación realizada:**
- ✅ Backend: Endpoints `getDashboardStats` (Totales/Tendencias), `getHeatmapData`, `getProjectTimeDistribution` (agregación por proyecto), y `getTaskStatusDistribution`.
- ✅ Backend: Inyección de `PrismaService` en `AnalyticsService` para consultas de agregación complejas.
- ✅ Frontend: Hooks React Query para todas las métricas (`useDashboardStats`, `useProjectDistribution`, etc.).
- ✅ Frontend: Componentes de gráficos implementados (`WeeklyChart`, `PeakHoursHeatmap`, `ProjectTimeChart` (Pie), `TaskStatusChart` (Donut)).
- ✅ Frontend: Integración completa en `Analytics.tsx` con soporte i18n y transiciones.

**Archivos creados/modificados:**
- `apps/backend/src/analytics/analytics.service.ts` & `.controller.ts`
- `apps/desktop/src/components/analytics/DistributionCharts.tsx`
- `apps/desktop/src/pages/Analytics.tsx`
- `apps/desktop/src/lib/api-client.ts`

---

#### 🔔 P10: Smart Notifications con ML
**Estado:** ✅ COMPLETADO

**Descripción:** Sistema inteligente de notificaciones con recordatorios contextuales y predicción de necesidades.

**Implementación realizada:**
- ✅ Backend: Instalado `@nestjs/schedule` para tareas programadas (cron jobs).
- ✅ Backend: Implementado `SmartNotificationsService` con tres tipos de notificaciones inteligentes:
  - **Tareas próximas a vencer**: Revisa cada 10 minutos las tareas que vencen en la próxima hora.
  - **Recordatorios de descanso**: Detecta sesiones de trabajo > 2 horas y sugiere pausas cada 30 minutos.
  - **Planificación diaria**: Envía recordatorio a las 9 AM (lunes-viernes) si el usuario no ha creado tareas.
- ✅ Backend: Sistema anti-spam que evita notificaciones duplicadas verificando el historial reciente.
- ✅ Backend: Logging detallado para monitoreo de notificaciones enviadas.

**Archivos creados/modificados:**
- `apps/backend/src/notifications/smart-notifications.service.ts` (nuevo)
- `apps/backend/src/notifications/notifications.module.ts`
- `apps/backend/src/app.module.ts`
- `apps/backend/package.json`

**Próximas mejoras sugeridas:**
- Personalización de horarios según preferencias del usuario
- ML para predecir mejor momento de envío
- Notificaciones basadas en patrones de productividad

---

### 23.3 Mejoras de UX/UI (Sprint 5-6)

#### 📱 P11: Offline-First Support
**Estado:** ⚠️ Crítico para mobile

**Descripción:** Service Workers, IndexedDB, sync queue, conflict resolution.

**Antes de implementar:** Verificar soporte offline y proponer estrategia.

---

#### 🎨 P12: Gestos y Swipe Actions
**Estado:** ⚠️ Verificar mobile app

**Descripción:** Swipe to complete/snooze, long press, pull to refresh.

**Antes de implementar:** Verificar app mobile y proponer gestos.

---

#### ⏱️ P13: Time Tracking Automático
**Estado:** ✅ Pomodoro implementado

**Descripción:** Detección de actividad, auto-pause, smart suggestions.

**Antes de implementar:** Revisar timer y proponer auto-tracking.

---

#### 🎤 P14: Voice Input
**Estado:** ✅ COMPLETADO

**Descripción:** Captura de tareas por voz usando Web Speech API del navegador.

**Implementación realizada:**
- ✅ Frontend: Hook `useSpeechRecognition` con soporte para Web Speech API.
- ✅ Frontend: Componente `VoiceInputButton` con feedback visual en tiempo real.
- ✅ Frontend: Integración con `parseTaskInput` para procesamiento inteligente de voz.
- ✅ Frontend: Transcripción en tiempo real (interim results) mientras el usuario habla.
- ✅ Frontend: Detección automática de navegadores compatibles.
- ✅ Frontend: Soporte para español (es-ES) con opción de configurar otros idiomas.
- ✅ Frontend: Integrado en `CreateTaskDialog` junto a Smart Parse.

**Características:**
- Transcripción en tiempo real con preview
- Procesamiento automático de fechas, prioridades y proyectos
- Feedback visual durante la grabación (animación de pulso)
- Manejo de errores y estados de carga
- Compatible con Chrome, Edge y navegadores basados en Chromium

**Archivos creados/modificados:**
- `apps/desktop/src/hooks/use-speech-recognition.ts` (nuevo)
- `apps/desktop/src/components/voice/voice-input.tsx` (nuevo)
- `apps/desktop/src/components/task/create-task-dialog.tsx`

**Limitaciones:**
- Requiere navegador compatible con Web Speech API (Chrome, Edge)
- No funciona en Firefox o Safari (se oculta el botón automáticamente)
- Requiere permisos de micrófono del usuario

---

#### 🤝 P15: Collaborative Editing Real-time
**Estado:** ✅ COMPLETADO

**Descripción:** Sistema de colaboración en tiempo real con WebSockets para presencia de usuarios y actualizaciones sincronizadas.

**Implementación realizada:**
- ✅ Backend: Instalado `@nestjs/websockets`, `@nestjs/platform-socket.io` y `socket.io`.
- ✅ Backend: Implementado `CollaborationGateway` con autenticación JWT.
- ✅ Backend: Sistema de presencia de usuarios por workspace y task.
- ✅ Backend: Eventos en tiempo real:
  - `join-workspace` / `leave-workspace`: Gestión de presencia en workspace
  - `join-task` / `leave-task`: Tracking de usuarios viendo una tarea
  - `task-update`: Broadcast de cambios a usuarios conectados
  - `presence-update`: Actualización de usuarios activos
  - `task-presence`: Lista de usuarios viendo una tarea específica
- ✅ Backend: Método público `broadcastTaskChange()` para integración con REST API.
- ✅ Backend: Logging detallado de conexiones y eventos.

**Archivos creados/modificados:**
- `apps/backend/src/collaboration/collaboration.gateway.ts` (nuevo)
- `apps/backend/src/collaboration/collaboration.module.ts` (nuevo)
- `apps/backend/src/app.module.ts`
- `apps/backend/package.json`

**Próximos pasos sugeridos:**
- Frontend: Implementar cliente Socket.IO en desktop app
- Frontend: Componente de presencia de usuarios
- Frontend: Indicadores visuales de edición concurrente
- Backend: Implementar CRDT o Operational Transformation para resolución de conflictos
- Backend: Persistencia de eventos para replay

---

### 23.4 Features Avanzadas (Roadmap Futuro)

- 🔮 **F1:** Predicciones con ML (probabilidad de atraso, burnout detection)
- 🌐 **F2:** Integraciones avanzadas (Jira, Asana, GitHub bidireccional)
- 📈 **F3:** SLA y Escalation Policies
- 🏪 **F4:** Marketplace de Templates

---

## 24. Matriz de Priorización

| ID | Mejora | Impacto | Esfuerzo | ROI | Sprint |
|----|--------|---------|----------|-----|--------|
| P3 | Templates | 🔥 Alto | Bajo | ⭐⭐⭐⭐⭐ | 1 |
| P4 | Shortcuts | Medio | Bajo | ⭐⭐⭐⭐ | 1 |
| P5 | Health Indicators | Medio | Bajo | ⭐⭐⭐⭐ | 2 |
| P1 | NLP Quick Capture | 🔥 Alto | Medio | ⭐⭐⭐⭐⭐ | 1-2 |
| P8 | Modo Focus | Medio | Bajo | ⭐⭐⭐⭐ | 2 |
| P2 | Vista Calendario | 🔥 Alto | Alto | ⭐⭐⭐⭐ | 2-3 |
| P6 | Dependencias | Medio | Medio | ⭐⭐⭐ | 3-4 |
| P9 | Dashboard Mejorado | Alto | Medio | ⭐⭐⭐⭐ | 3 |
| P13 | Auto Time Tracking | Medio | Medio | ⭐⭐⭐⭐ | 3 |
| P7 | IA Estimaciones | Medio | Alto | ⭐⭐⭐ | 4 |
| P10 | Smart Notifications | Medio | Alto | ⭐⭐⭐ | 4 |
| P12 | Gestos Mobile | Medio | Medio | ⭐⭐⭐ | 5 |
| P11 | Offline-First | 🔥 Alto | Alto | ⭐⭐⭐⭐⭐ | 5-6 |
| P14 | Voice Input | Bajo | Alto | ⭐⭐ | 6+ |
| P15 | Collaborative Edit | Alto | Alto | ⭐⭐⭐⭐ | 6+ |

---

## 25. Proceso de Implementación

### Workflow para cada mejora:

1. **REVISAR** implementación actual
   - Buscar código relacionado
   - Documentar funcionalidad existente
   - Identificar gaps

2. **PROPONER** mejoras específicas
   - Diseño técnico detallado
   - Mockups/wireframes si aplica
   - Estimación de esfuerzo

3. **ESPERAR APROBACIÓN**
   - Presentar propuesta
   - Discutir alternativas
   - Obtener go/no-go

4. **IMPLEMENTAR** (solo si aprobado)
   - Desarrollo incremental
   - Tests unitarios e integración
   - Documentación

5. **VALIDAR**
   - Code review
   - Testing manual
   - Deploy a staging

---

## 26. Próximos Pasos Sugeridos

### Opción A: Quick Wins (Sprint 1)
1. **P3: Templates de Tareas** (ROI máximo, esfuerzo bajo)
2. **P4: Keyboard Shortcuts** (mejora UX inmediata)
3. **P5: Task Health Indicators** (valor visual alto)

### Opción B: Core Features (Sprint 2-3)
1. **P1: NLP Quick Capture** (diferenciador clave)
2. **P2: Vista Calendario** (feature muy solicitada)
3. **P8: Modo Focus** (complementa Pomodoro existente)

### Opción C: Audit y Mejoras Incrementales
1. Revisar todas las funcionalidades ya implementadas
2. Documentar estado actual vs plan
3. Proponer mejoras específicas por feature
4. Priorizar según feedback de usuarios

---

**¿Qué opción prefieres para comenzar?** O si tienes otra prioridad específica, podemos ajustar el plan.
