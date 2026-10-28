# ODD: Tareas sin proyecto (tarea express)

Issue: #430

Objective: permitir crear tareas **sin proyecto** ("tarea express"): cosas que el usuario tiene que hacer y no están ligadas a ningún proyecto. Hoy `Task.projectId` es obligatorio en 3 capas (Prisma, DTO backend, zod del front) y la creación sin proyecto se bloquea además en `CreateTaskGuard`. Una tarea express es personal (owner/assignee), visible en todas las vistas globales y recuperable desde la papelera.
Branch: `feature/odd-021-express-tasks` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; una PR por T# (≤300 líneas ideal); test-first (RED/GREEN) en todo cambio de comportamiento; T1 (backend) antes que T2/T3.
Test runner: Jest (backend) · Jest (core, solo `packages/core/test/**`) · Vitest (web).

## Context (leer primero — presupuesto: estos paths, nada más)

Modelo y migraciones:

- `packages/db/prisma/schema.prisma` — `model Task` 1024-1139: relación requerida `project Project @relation(fields: [projectId]...)` + `projectId String` (1054-1055). `model Project` más arriba (workspace → projects → tasks). Migraciones en `packages/db/prisma/migrations/` (convención de nombre fecha_slug); comandos en `packages/db/package.json` (`db:migrate`). En producción corre `migrate deploy` del pipeline (memoria: Prisma 7 migrate desde packages/db).
- Convenios TZ-herméticos en specs backend (memoria): fechas timezoneless, nunca `setHours` locales.

Dominio (packages/core):

- `packages/core/src/tasks/model/task.entity.ts:20` — `projectId: string` obligatorio en TaskProps.
- `packages/core/src/tasks/usecase/create-task.usecase.ts:15` — `CreateTaskInput.projectId: string` obligatorio; pasa tal cual a `Task.create`.
- `packages/core/src/tasks/usecase/get-deleted-tasks.usecase.ts:7` — `execute(projectId: string)` requerido.
- `packages/core/src/tasks/provider/task.repository.ts:94,118,203` — `filters.projectId` ya opcional en find/findByWorkspace; `findDeleted(projectId: string)` requerido.

Contratos cliente compartidos:

- `packages/api-client/src/types/task.types.ts` — `Task.projectId: string` (27, obligatorio), `TaskDetails.project: {id,name,workspaceId}` NO nullable (81-85), `CreateTaskDto.projectId: string` (106, obligatorio). Ya nullable/optional: `PublicTaskResponse.project?` (153-157), `TimeBlock.project` (198-202), `GetTasksParams.projectId?` (214).
- `packages/api-client/src/client.ts` — `createTask` (1398) hereda obligatoriedad del DTO; `getTasks(projectId?, ...)` → `GET /tasks?projectId=` con query opcional (1414-1421); NINGÚN endpoint de tarea mete projectId en el path (todo por `:id` o query).
- `packages/hooks/src/hooks.ts` — `useTasks(projectId?, tags?, {assignedToMe})` ya opcional (612-617); `useCreateTask.onSuccess` invalida `queryKeys.tasks(task.projectId)` (641) → con null invalida clave inútil.
- `packages/hooks/src/schemas.ts:95` — `createTaskSchema`: `projectId: z.string().min(1, "Project is required")`.

Backend (apps/backend):

- `apps/backend/src/tasks/dto/create-task.dto.ts` — `@IsString() @MinLength(1) projectId: string` (obligatorio). `dto/create-subtask.dto.ts:18` — `projectId?: string` ya opcional.
- `apps/backend/src/tasks/tasks.service.ts` — `create` 104-150 (llama `assertAssigneeIsWorkspaceMember(assigneeId, projectId)` 105-108 y fuerza `assigneeId ?? userId` 115); `assertAssigneeIsWorkspaceMember` 863-892 (busca project→workspace; `NotFoundException` si proyecto no existe — con projectId null hay que cortar antes); `findAll` 265-308 vía `findByWorkspaceMemberships(userId, {projectId, tags})`; `getDeleted(projectId)` 958-980 requerido; subtareas 1043-1063: `projectId` del hijo se ancla al del padre (`parentTask.props.projectId`) — con padre express hereda null.
- `apps/backend/src/common/guards/base-resource.guard.ts` — `canActivate`: `getWorkspaceId(request)` null → **return false** (403). Sin soporte de autorización alternativa.
- `apps/backend/src/common/guards/create-task.guard.ts` — `getWorkspaceId`: `if (!projectId) return null` → hoy 403 al crear sin proyecto; projectId de proyecto inexistente también null → false (mantener ese rechazo).
- `apps/backend/src/common/guards/task.guard.ts` — `getWorkspaceId`: tarea → `select: { project: { select: { workspaceId: true } } }` y devuelve `task.project.workspaceId` SIN guard de null → **crash (500) con proyecto null**: leer/completar/editar/borrar/restaurar una express sería imposible. Caso especial `/deleted` con `?projectId=` (líneas 13-44).
- `apps/backend/src/repositories/task.repository.ts` — `findByWorkspaceMemberships` 370-445: `where.OR = [{ownerId}, {assigneeId}, {project.workspace.members...}]` → una tarea sin proyecto YA es visible para su owner/assignee por las dos primeras ramas; `findDeleted(projectId)` 540+ filtra `where: { projectId, isDeleted: true }` sin scope de usuario (el acceso lo pone TaskGuard vía workspace del proyecto).
- `apps/backend/src/tasks/tasks.controller.ts` — `POST /tasks` con `CreateTaskGuard` (79-90); `GET /tasks/deleted` con `TaskGuard` + `@Query('projectId') projectId: string` (324-342); `GET /tasks` (421) pasa query a findAll.

Frontend (apps/web):

- Creación que EXIGE proyecto: `components/task/create-task-dialog.tsx` — zod `projectId: z.string().min(1)` (131), `watch('projectId')` + `useProject(watchedProjectId)` para assignee/custom fields (163-177), select obligatorio + empty state "You need a project to create tasks" (107, 216, 293-317); `components/task/quick-add-dialog.tsx:29-45` — resuelve proyecto por hint NLP o **fallback al primer proyecto** (`if (!projectId) return`); `components/task/task-form.tsx:14,61-62,79` — `onSubmit({title, projectId})` con botón `disabled` sin projectId; `components/task/custom-field-inputs.tsx:32,47,273-275` + `create-task-custom-fields-wrapper.tsx` — custom fields son POR PROYECTO (`useCustomFields(projectId)`).
- Filtro por workspace que EXCLUIRÍA express en silencio: `app/[locale]/(pages)/tasks/page.tsx:157-167`, `app/[locale]/(pages)/dashboard/page.tsx:181-193`, `components/planning/daily-ritual-dialog.tsx:111` — patrón `taskWsId = task.project?.workspace?.id || task.project?.workspaceId` + match contra proyectos del workspace → tarea sin proyecto no matchea y DESAPARECE cuando hay workspace seleccionado. (Desktop Eisenhower ya usa el patrón correcto: `!t.projectId || workspaceProjectIds.has(t.projectId)`.)
- Mostrar proyecto (ya con guard, solo tipos): `components/task/task-card-compact.tsx:279,473-480` (`showProject && task.project && ...`), `components/dashboard/upcoming-tasks-widget.tsx:133-140`, `packages/ui/src/components/task/task-card.tsx:100` (`task.project?.color || '#8b5cf6'`).
- `components/task/task-detail-panel.tsx:234,242` — `useWorkspaceMembers(task?.project?.workspaceId ?? '')` + `workspaceId: task?.project?.workspaceId` para comentarios/assignee; `:347` `apiClient.getTasks(task.projectId)`.
- Papelera: `lib/api-client.ts:784-786` `getDeletedTasks(projectId: string)` OBLIGATORIO → `GET /tasks/deleted?projectId=`; `lib/api-hooks.ts:375-379` `useDeletedTasks(projectId)` required (`enabled: !!projectId`); `components/trash/unified-trash-view.tsx:123,675,785` (dropdown de proyecto).
- Filtros: `components/tasks/quick-filters.tsx` (FilterPreset con `projectId?`), `lib/task-filters.ts:29-30,71-73` (URL `?project=` opcional), `app/[locale]/(pages)/tasks/tasks-view.tsx:41` (queryKey con `filters.projectId` opcional).
- No afectadas (verificado 2026-10-28): plan/day-plan y calendar (0 refs a proyecto de tarea), eisenhower web (tipo ya `project?: ... | null`), share/task (PublicTaskResponse ya nullable), offline-storage (`projectId?` opcional), `apps/mobile/src` (0 refs a projectId).
- Tests web con fixtures `projectId`: `components/task/__tests__/quick-add-dialog.test.tsx` (3 — asume fallback al primer proyecto: CAMBIO de comportamiento intencional), `lib/__tests__/use-tasks.test.tsx` (6), `components/task/__tests__/create-task-dialog-assignee.test.tsx` (2), `lib/__tests__/api-client.test.ts` (1).
- i18n: `packages/i18n/src/locales/{es,en,pt-br}.json` (solo claves nuevas; paridad 2393/2393/2393).

Proceso: `odd/README.md` (plantilla), `docs/planning/roadmap.md` (tabla ODD ↔ issue). Gates raíz: `npm run build` → `check-types` → `test` (turbo; task `test` depende de `^build`). Gotcha: dists de paquetes antes de medir tsc/vitest (`turbo run build --force` si raro); tests de core SOLO en `packages/core/test/**`; menús Radix en jsdom: pointerDown→pointerUp→click.

## Specs

S1. **Modelo: projectId nullable (P0)**. Prisma: `project Project?` + `projectId String?` (relación opcional, onDelete Cascade se mantiene para el caso con proyecto). Migración aditiva (`ALTER TABLE "Task" ALTER COLUMN "projectId" DROP NOT NULL`; sin backfill necesario — ninguna fila existente cambia). Core: `TaskProps.projectId: string | null` + `CreateTaskInput.projectId?` (create-task.usecase) + `GetDeletedTasksUseCase.execute(projectId | null)` (el proveedor `findDeleted` firma en S4). api-client: `Task.projectId: string | null`, `TaskDetails.project: {...} | null`, `CreateTaskDto.projectId?: string`. Check: `prisma migrate dev` limpio en local (y `migrate deploy` en el pipeline de staging/prod al merge); check-types verdes en db/core/api-client/hooks.

S2. **Backend: crear sin proyecto (P0)**. `CreateTaskDto.projectId` → `@IsOptional()`. `CreateTaskGuard`: body SIN `projectId` → autorizar (true; JWT ya autentica; tarea personal); body CON `projectId` inexistente → sigue denegado (false), como hoy. Servicio `create`: si no hay projectId → forzar `assigneeId = userId` (si el DTO trae un assignee distinto → `BadRequestException` con código de máquina `EXPRESS_TASK_NO_FOREIGN_ASSIGNEE`); `assertAssigneeIsWorkspaceMember` solo se invoca con projectId presente. Subtareas: hijo de tarea express hereda `projectId null` (repo Prisma acepta null; la validación 1043-1048 que rechaza projectId ajeno se mantiene para no-null y no debe reventar con null). Check: specs RED→GREEN (crear sin proyecto feliz → prop `projectId === null`; assignee ajeno sin proyecto → 400; con projectId el flujo actual NO cambia; subtarea de express hereda null).

S3. **Backend: acceso a tareas express (P0)**. `BaseResourceGuard`: extraer hook `protected authorizeWithoutWorkspace(request, user): Promise<boolean> { return false; }` invocado cuando `getWorkspaceId` devuelve null (comportamiento de TODOS los guards existentes sin cambio — default false). `TaskGuard`: cuando la tarea existe pero `project` es null → `authorizeWithoutWorkspace` = owner o assignee del task (si no: false/403, sin revelar existencia); NUNCA `task.project.workspaceId` sobre null. `CreateTaskGuard`: override → true solo cuando el body no trae projectId. Check: specs RED→GREEN (GET/PATCH/DELETE/restore de express por owner 200; por tercer usuario 403; tarea inexistente sigue 404; rutas con proyecto intactas — specs previos verdes).

S4. **Backend: listar y papelera (P1)**. `findAll` (+controller `GET /tasks`): nuevo query `withoutProject: boolean` → filtro `projectId: null` (si llegan `projectId` y `withoutProject` a la vez → 400). `getDeleted(projectId?)`: sin projectId → tareas borradas del usuario (owner/assignee) con `projectId null`; con projectId → comportamiento actual intacto. Repo: `findDeleted(projectId | null, userId)` — con null scopea por usuario en lugar de por proyecto. `TaskGuard` endpoint `/deleted` SIN `?projectId=` → autoriza por JWT (true) — el scopeo de seguridad lo hace el servicio (nunca devuelve borradas de otros usuarios); CON projectId sigue el camino actual. Check: specs RED→GREEN (withoutProject devuelve solo express; deleted sin projectId devuelve solo las propias express borradas; deleted con projectId no cambia).

S5. **Web: crear sin proyecto (P0)**. `packages/hooks` `createTaskSchema`: `projectId` opcional-nullable; `useCreateTask.onSuccess`: con `task.projectId` null invalidar `['tasks']` genérica (y sin-project), no `['tasks', {projectId: null}]`. `create-task-dialog`: select con opción explícita **"Sin proyecto"** (vacío→undefined al enviar) y, si no hay proyectos, sin bloqueo (hoy: empty state "necesitas un proyecto"); custom fields solo se montan con proyecto seleccionado (son por proyecto); assignee: para express solo "asignarme a mí" (coherente con S2 — ocultar picker de miembros). `quick-add-dialog`: SIN hint NLP de proyecto → crea express (se elimina el fallback al primer proyecto — cambio de comportamiento intencional, actualizar su test). `task-form`: prop projectId opcional (los boards de proyecto siguen pasándolo). i18n es/en/pt-br: "Sin proyecto"/"No project"/"Sem projeto" + textos de empty state. Check: Vitest RED→GREEN (quick-add sin hint crea express — test previo de fallback invertido; dialog crea sin proyecto y con proyecto; custom fields ausentes sin proyecto), tsc, eslint.

S6. **Web: visibilidad y filtros (P1)**. Filtro workspace (tasks/page.tsx, dashboard/page.tsx, daily-ritual-dialog): tarea con `projectId` null SIEMPRE incluida en el workspace activo (patrón `!projectId || workspaceProjectIds.has(projectId)`). `/tasks`: QuickFilters añade chip **"Sin proyecto"** que manda `withoutProject=true` (extender firma de `useTasks`/`apiClient.getTasks` para el flag). `task-detail-panel`: con project null — sin crash; ocultar picker de assignee/miembros de workspace (express no los soporta, S2); `getTasks(task.projectId)` solo cuando haya projectId. Papelera: `getDeletedTasks(projectId?)` opcional en `lib/api-client.ts` + `api-hooks.ts`; `unified-trash-view` añade entrada "Sin proyecto" en el dropdown que llama sin projectId. Check: Vitest (filtro workspace incluye express; chip sin-projecto manda el flag; papelera lista express), tsc.

S7. **Sin regresiones (P1)**. Suites backend/core/web verdes; gates raíz `npm run build` → `check-types` → `test`; flujos CON proyecto sin cambios (crear en proyecto, papelera por proyecto, dashboard, day-plan); fila 021 en roadmap al merge final; e2e solo si se toca flujo completo de auth/collab (no esperado).

Fuera de alcance: **desktop** (formularios duplicados en `apps/desktop/src` — follow-up propio, incluye el bug latente `subtask-list.tsx:39` con `projectId: "default"` hardcodeado); mover express→proyecto (no existe update de projectId hoy — follow-up); MCP/API pública; plantillas; mobile (0 refs — sin cambios); proyectos-fantasma tipo "Inbox" (descartado, ver D1 en Log).

## Contrato de colaboración (invariantes nuevas)

- A1. Una tarea sin proyecto es personal: visible SOLO para su owner y assignee (nunca hereda miembros de workspace).
- A2. Sin projectId, el assignee es siempre el creador (400 `EXPRESS_TASK_NO_FOREIGN_ASSIGNEE` si se intenta asignar a otro).
- A3. Ninguna ruta existente con projectId cambia de semántica: proyecto válido ⇒ comportamiento idéntico al actual (specs previos verdes).
- A4. Toda tarea express borrada es recuperable desde la papelera (opción "Sin proyecto"); nadie ve la papelera de otro.

## Allowed edit surfaces

- `packages/db/prisma/schema.prisma` + `packages/db/prisma/migrations/<fecha>_task_project_nullable/` (nueva)
- `packages/core/src/tasks/**` (entity, create-task.usecase, get-deleted-tasks.usecase, task.repository) + `packages/core/test/tasks/**`
- `packages/api-client/src/types/task.types.ts`, `packages/api-client/src/client.ts` (solo firma createTask/getTasks si aplica)
- `packages/hooks/src/{schemas.ts,hooks.ts,query-keys.ts}`
- `packages/i18n/src/locales/{es,en,pt-br}.json`
- `apps/backend/src/tasks/**` (dto, service, controller, specs)
- `apps/backend/src/common/guards/{base-resource.guard.ts,task.guard.ts,create-task.guard.ts,attachment.guard.ts,comment.guard.ts}` + sus specs (attachment/comment: mismo fallback owner/assignee, hallazgo L2)
- `apps/backend/src/attachments/attachments.controller.ts`, `apps/backend/src/comments/comments.service.ts` (autorización de express, hallazgo L2)
- `apps/backend/src/billing/plan-limits.service.ts`, `apps/backend/src/calendar-sync/calendar-push.service.ts`, `apps/backend/src/mcp/mcp-catalog.service.ts` (null-safety + decisiones D6/D7/D8, hallazgo L2)
- `apps/backend/src/repositories/task.repository.ts` + spec
- `apps/web/src/components/task/**`, `apps/web/src/components/tasks/quick-filters.tsx`, `apps/web/src/components/planning/daily-ritual-dialog.tsx`, `apps/web/src/components/trash/unified-trash-view.tsx`
- `apps/web/src/app/[locale]/(pages)/tasks/**`, `apps/web/src/app/[locale]/(pages)/dashboard/page.tsx`
- `apps/web/src/lib/{api-client.ts,api-hooks.ts}` (getDeletedTasks), tests: `apps/web/src/components/task/__tests__/**`, `apps/web/src/lib/__tests__/**`
- `odd/tasks/021-express-tasks.md`, `docs/planning/roadmap.md` (fila 021)

## Verification

```bash
# migración local
cd packages/db && npx prisma migrate dev --name task_project_nullable
# gates raíz
npm run build && npm run check-types
# tests por paquete
npm run test --filter=@ordo-todo/core
cd apps/backend && npx jest tasks.service.spec task.guard.spec create-task.guard.spec task.repository.spec
cd apps/web && npx vitest run src/components/task src/lib/__tests__
```

Esperado: migración aplica sin datos tocados; specs nuevos RED antes de implementar y GREEN después; suites completas verdes; 0 errores nuevos de tsc/eslint.

## Tasks

| T#  | Specs | Entrega                                                                                           | Ruta sugerida                                                                  | Estado                       |
| --- | ----- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| T1  | S1–S4 | PR 1: schema + core + api-client + backend (guards/servicio/repo) con tests                       | bottom-up: Prisma → core → api-client/hooks → guards → service/repo → specs    | COMPLETADO (evidencia en L2) |
| T2  | S5    | PR 2: web creación sin proyecto (dialog, quick-add, hooks, i18n) + tests                          | schemas.ts → create-task-dialog → quick-add-dialog → i18n → tests              | COMPLETADO (evidencia en L3) |
| T3  | S6–S7 | PR 3: web visibilidad (workspace/ritual/dashboard), chip "Sin proyecto", papelera + tests + gates | tasks/page → dashboard → ritual → detail-panel → quick-filters → trash → gates | pendiente                    |

## Log

L1. Pedido original (2026-10-28): "debemos de dar la opcion de crear una tarea fuera de un proyecto, que sea una 'tarea express' o algo que el usuario tiene que hacer pero no esta ligado a un proyecto"

Decisiones de diseño del padre (2026-10-28):

- D1: `projectId` nullable en vez de proyecto-fantasma "Inbox": el pedido es explícito ("no está ligado a un proyecto"); un proyecto oculto se filtraría en listas de proyectos, analytics por proyecto y permisos de collab para siempre.
- D2: express = personal (owner/assignee). Sin proyecto no hay workspace que amplíe visibilidad ni valide miembros → assignee forzado al creador (A1/A2).
- D3: una express aparece en TODAS las vistas globales con independencia del workspace seleccionado (es "del usuario"), patrón que desktop Eisenhower ya usa (`!projectId || has(...)`).
- D4: etiqueta UI "Sin proyecto" (descriptiva del estado); "tarea express" queda como nombre del feature en docs/issue.
- D5: desktop fuera de alcance esta ODD (formularios duplicados + bug latente `subtask-list.tsx:39` con `projectId: "default"`); mobile no necesita cambios (0 refs).

L2. Cierre de T1 (2026-10-28, padre). Evidencia: `npx prisma migrate deploy` aplicó `20261028100000_task_project_nullable` en local; `npx jest` backend 140 suites / 1487 tests verdes (incluye specs nuevos: tasks.service express create/subtask/getDeleted/findAll-withoutProject, task.guard.spec y create-task.guard.spec nuevos); `npx turbo run build` 17/17; `npx turbo run test` 3/3; `tsc --noEmit` backend diff vs main = 0 errores nuevos. Hallazgos que AMPLIARON superficies (aprobado por el padre editando este doc, regla 6 del README):

- (a) `attachment.guard.ts` / `comment.guard.ts` derivaban workspace de `task.project.workspaceId` → crash/403 con express; mismo fallback owner/assignee que TaskGuard (S3 ampliado a estos guards; `attachments.controller.ts` y `comments.service.ts` tenían el patrón duplicado en el servicio).
- (b) `comments.service.ts`: @menciones requieren workspace → en express devuelven [] (no hay members que mencionar).
- (c) `plan-limits.service.ts` (D6): el límite de storage es por workspace; los adjuntos de tareas express quedan FUERA del cómputo (check temprano return). Follow-up: límite personal para express.
- (d) `calendar-push.service.ts` (D7): las express NO se sincronizan a calendarios externos (los ajustes resuelven desde `project.settings.calendar`). Follow-up si el usuario lo pide.
- (e) `mcp-catalog.service.ts` (D8): en `ordo_task_list` las express aparecen con projectName/workspaceId null y quedan fuera del filtro por workspace; `ordo_task_assign` rechaza asignar otros sobre una express ('Task has no resolvable workspace') — coherente con A2.
- Nota de proceso: el cambio de tipos (Prisma/client) obligó a implementar antes que los specs; specs nuevos verificados GREEN y suites previas PRESERVE (1487). RED explícito no aplicable sin romper el build completo.
- Nota de entorno: migración local creada vía directorio manual + `migrate deploy` porque `migrate dev` pedía RESET por checksum de `20261027204750_billing_t4_trial_grace` modificado tras aplicarse (solo local, el fichero está intacto en git; NO se tocó).

L3. Cierre de T2 (2026-10-28, padre). Cambios: `createTaskSchema` opcional en packages/hooks Y en `packages/core/src/shared/validation/task.validation.ts` (superficie ampliada, mismo contrato — el de core estaba exportado y habría quedado contradictorio); `create-task-dialog`: select con opción "No project (express)" por defecto y SIN empty state bloqueante (eliminar rama `showEmptyState`; props `isLoadingProjects`/`onRequestCreateProject` quedan en la interfaz por compat con llamadores pero sin uso); `quick-add-dialog`: sin hint → express (eliminado fallback al primer proyecto y el toast `noProject`, clave i18n conservada por paridad); `task-form`: projectId opcional en submit. i18n: sin claves nuevas (el diálogo usa DEFAULT_LABELS en inglés en TODOS los llamadores — deuda pre-existente de localización, no de este ODD). Evidencia: `npx vitest run` (apps/web) 299/299, incluidos 5 nuevos/actualizados de express; `npx turbo run build` 17/17. Rebase sobre main post-#431: delta reconstruido sin el ruido de formateo (97+/55-).

L4. Revisión independiente de PR #431 (2026-10-28): veredicto inicial NO APTO con 1 P0 + 1 P1, ambos corregidos en esta rama.
  - P0 (introducido por T1): `TaskGuard.authorizeWithoutWorkspace` detectaba el endpoint de papelera con `request.url?.includes('/deleted')` — `request.url` incluye la query string, así que `GET /tasks/<id>?x=/deleted` devolvía true sin owner/assignee (lectura/edición/borrado permanente de tareas ajenas). Fix: detección SOLO por patrón de ruta (`request.route.path` termina en `/deleted` y sin `params.id`); nunca `request.url`. Specs de regresión añadidos (tercero con `?x=/deleted` → false; owner con `?x=/deleted` → true).
  - P1 (pre-existente en main, se corrige aquí porque anula A1): `TaskGuard.getWorkspaceId` clasificaba CUALQUIER petición con `?projectId=` como "deleted endpoint" y autorizaba por membresía del workspace de ESE proyecto sin verificar que la tarea perteneciera a él → `GET /tasks/<cualquier-id>?projectId=<mi-proyecto>` = IDOR cross-workspace. Fix: la rama de papelera solo aplica a la ruta de lista (`/deleted` sin `params.id`); las rutas de tarea resuelven SIEMPRE por la tarea (su projectId/workspace o fallback express). Spec de regresión añadido (miembro de otro proyecto + `?projectId=` → Forbidden por el workspace de la tarea).
  - P2 aceptados/documentados: adjuntos de express fuera del límite de storage por workspace (D6, follow-up límite personal); merge atómico de las 3 PRs recomendado por el revisor (se hará en cadena inmediata #431→#432→#433 para minimizar la ventana sin UI).
  - Evidencia post-fix: `npx jest` backend 140 suites / 1490 tests verdes (3 specs de seguridad nuevos).
