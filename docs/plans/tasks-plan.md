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