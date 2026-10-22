# ODD: Collab hardening multiusuario (asignación, menciones, roles) — prerrequisito de #240

Issue: #333

Objective: que un equipo real pueda trabajar en Ordo hoy: asignar tareas desde la UI, mencionar a compañeros con fiabilidad, y administrar el ciclo de vida de miembros (roles, salir, cancelar invitaciones, invitación segura). Es el prerrequisito funcional de 012-S4 (cobrar por asientos sin poder gestionarlos no tiene sentido).
Branch: `feature/collab-hardening` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; una PR por T# (≤300 líneas ideal; T2/T3 en slices encadenados backend→frontend si superan 400); test-first (RED/GREEN) en todo cambio de comportamiento; P0 (T1–T2) primero.
Test runner: Jest (backend, core) · Vitest (web) · e2e Jest (`apps/backend/test/jest-e2e.json`).

## Context (leer primero — presupuesto: estos paths, nada más)

Auditoría de referencia (hallazgos con file:line): memoria `collab-multiuser-audit-oct-2026` + `docs/vision/promises-audit.md` §B.

Modelo:
- `packages/db/prisma/schema.prisma` — `WorkspaceMember` 834-849 + `MemberRole` (OWNER/ADMIN/MEMBER/VIEWER) 851-856; `WorkspaceInvitation` 783-806 + `InviteStatus` (CANCELLED nunca asignado) 808-813; `WorkspaceAuditLog` 816-832; `Comment.mentions` 1333 (el comentario del schema dice "user IDs" pero el backend guarda usernames); `NotificationType` 291-300 (`MENTIONED` y `TASK_ASSIGNED` se emiten hoy; `INVITATION_RECEIVED` nunca emitido); `Task.assigneeId` 1066-1068.

Backend workspaces:
- `apps/backend/src/workspaces/workspaces.controller.ts` (members 276-368, invitations 397-479, accept 479) + `workspaces.service.ts` (`inviteMember` 423, `acceptInvitation` 492 — sin validar email, `getMembers` 566) + ambos `.spec.ts`
- `apps/backend/src/repositories/prisma-workspace-member.repository.ts:78` (`updateRole()` huérfano — nadie lo llama) · `workspace-invitation.repository.ts` · `workspace-audit-log.repository.ts`
- `packages/core/src/workspaces/usecase/` (invite-member, accept-invitation, remove-member-from-workspace, add-member-to-workspace). Sin tests de core para workspaces hoy. OJO: los tests de comments en core (`src/comments/tests/`) NO corren con jest — el `testMatch` de `packages/core/jest.config.js` solo ejecuta `**/test/**`; los tests nuevos de core van en `packages/core/test/{workspaces,comments}/` (convención de `test/users`, `test/tasks`).
- `apps/backend/src/common/guards/workspace.guard.ts` (contextos direct/from-project/from-task 125-174)

Backend tasks/comments:
- `apps/backend/src/tasks/tasks.service.ts` (create auto-asigna creador 110; update assignee → `TASK_ASSIGNED` 717-735; **nunca valida que assignee sea miembro**) + `dto/create-task.dto.ts:101`
- `apps/backend/src/comments/comments.service.ts` (`create` 102-178; `handleCommentNotifications` 344-411; `detectMentions` 451-455 regex `/@(\w+)/g` rompe nombres con espacios; `getUsersByName` 529-552 matching `contains` fuzzy; `update` 202-235 no re-parsea) + `.spec.ts`
- `apps/backend/src/repositories/prisma-comment.repository.ts:110-150` (`findMentionsForUser*` buscan por userId — hoy nunca matchean)
- `apps/backend/src/notifications/notifications.service.ts` + `notifications.gateway.ts` (evento `notification:new`)
- `apps/backend/src/slack/slack-notifier.service.ts:21-27` (espera `TASK_MENTIONED`; el backend emite `MENTIONED` → menciones nunca llegan a Slack)

Frontend:
- `packages/ui/src/components/ui/mention-textarea.tsx` (popover @, inserta texto plano 77, `onMention(userId)` 93-95 sin usar)
- `apps/web/src/components/task/task-detail-panel.tsx` (`useWorkspaceMembers` 233, `mentionUsers` 254-261, prop opcional `renderAssigneeSelector` 834 sin call sites, `users` 897) — call sites del panel: `dashboard/page.tsx`, `calendar/page.tsx`, `task-calendar.tsx`, `project-list.tsx`, `task-card.tsx`, `task-card-compact.tsx`
- `apps/web/src/components/task/assignee-selector.tsx` (código muerto) · `task-form.tsx` (crear tarea, sin assignee) · `comment-thread.tsx` (autor `comment.user` 179 — backend devuelve `author`; render markdown sin highlight 257-261; `MentionTextarea` 278-289)
- `apps/web/src/components/workspace/workspace-members-settings.tsx` (dropdown solo "Remove" 173-181; botón borrar invitación sin `onClick` 237-239) · `invite-member-dialog.tsx`
- `apps/web/src/hooks/use-workspace-permissions.ts` (canInvite/canManageMembers 119-122) · `apps/web/src/components/shared/notification-popover.tsx` (click solo marca leída, no navega)
- `packages/api-client/src/types/comment.types.ts:5-18` (sin `author`/`mentions`/`parentCommentId`/`isEdited`)
- Paridad: `apps/desktop/src/components/task/comment-thread.tsx` (Textarea plana, sin @) · `apps/desktop/src/components/workspace/workspace-members-settings.tsx` · `apps/mobile/app/screens/(internal)/notifications.tsx:74,89` (icono `TASK_MENTIONED`, backend manda `MENTIONED`)

E2E: `apps/backend/test/collaboration.e2e-spec.ts` (mention test 189-209 solo asserta 201) · `test/workspaces-security.e2e-spec.ts`.
Predecesor comercial: `odd/tasks/012-billing-stripe.md` (hasta `## Log` — S4 enforcement de seats consume lo que aquí se construye).

## Specs

S1. **Asignación de tareas end-to-end (P0)**. Backend: `tasks.service` valida en create/update que `assigneeId` (si ≠ null) es miembro del workspace de la tarea (vía project→workspace) → `400` con mensaje claro; `null` permitido (desasignar); usar la misma vía que `comments.service` 127-140 o el guard (from-task). Frontend web: el panel de detalle renderiza `AssigneeSelector` por defecto cuando el workspace tiene >1 miembro (eliminar la prop opcional muerta o cablearla en los 6 call sites — decisión del slice, documentada en Log); `task-form.tsx` añade campo opcional "Asignar a". La notificación `TASK_ASSIGNED` ya existe — verificar entrega websocket. Check: spec backend RED→GREEN (no-miembro rechazado, miembro OK, null desasigna) + e2e (A asigna a B → B recibe `TASK_ASSIGNED`) + test UI selector montado.

S2. **Menciones correctas (P0)**. Fuente primaria de verdad: el cliente envía `mentionedUserIds` en el DTO (cablear `onMention` de `MentionTextarea` → `comment-thread`); el backend valida que cada ID es miembro del workspace y hace fallback de parseo exacto por nombre (case-insensitive, nombre completo con espacios) contra la lista real de miembros para clientes API/agentes — adiós regex `\w+` y matching `contains` fuzzy. `Comment.mentions` pasa a guardar **user IDs** (como dice el schema); migración que resetea `mentions = []` en filas existentes (datos beta; ningún lector depende — documentar en Log). `update()` re-parsea y notifica solo a mencionados **nuevos**. Frontend: fix autor (`comment.author`, no `comment.user`) + actualizar `comment.types.ts` del api-client (`author`, `mentions`, `parentCommentId`, `isEdited`, `editedAt`). Check: specs backend (nombre con espacio notifica al correcto; "ann" NO notifica a "Joanne"; edit no re-notifica; ID no-miembro ignorado/rechazado) + e2e extendido que asserta la notificación `MENTIONED` creada para B + test UI autor visible.

S3. **Ciclo de vida de miembros completo (P1)**. Backend: `PATCH /workspaces/:id/members/:userId/role` (OWNER/ADMIN; prohibido asignar OWNER, tocar al OWNER, y auto-escalarse; consume el `updateRole` huérfano); `DELETE /workspaces/:id/invitations/:invitationId` (OWNER/ADMIN; solo PENDING → `CANCELLED`); `POST /workspaces/:id/leave` (no-OWNER; OWNER recibe 400 "transfiere la propiedad primero"). Use cases core nuevos (`change-member-role`, `cancel-invitation`, `leave-workspace`) + audit log de las 3 acciones. Frontend web+desktop: dropdown de rol (ADMIN/MEMBER/VIEWER), botón cancelar invitación con `onClick`, botón "Salir del workspace" con confirmación. Check: specs service/controller + e2e security (MEMBER cambia roles → 403; ADMIN degrada OWNER → 403; leave del OWNER → 400) + tests UI.

S4. **Invitación segura (P1, pequeño)**. `acceptInvitation` exige email del usuario autenticado == `invitation.email` (case-insensitive); si no → 403 "esta invitación es para otro email". Idempotencia intacta. Check: spec RED→GREEN + e2e (User C usa link de B → 403).

S5. **Menciones visibles y navegables (P2)**. Web: post-proceso del markdown que resalta `@Nombre` coincidente con un miembro (chip, no link roto); click en notificación `MENTIONED`/`COMMENT_ADDED`/`TASK_ASSIGNED` navega a la tarea (`resourceType`/`resourceId`) y abre el panel. Desktop: `comment-thread` usa `MentionTextarea` con `users` (paridad web). Mobile: mapa de iconos añade `MENTIONED`/`TASK_ASSIGNED`. Slack: `slack-notifier.service` enruta `MENTIONED` (hoy espera `TASK_MENTIONED` que nadie emite). Check: tests UI render chip + navegación; `tsc` mobile/desktop verde.

S6. **Sin regresiones + verdad pública (P1)**. Suites backend/core/web verdes; `tsc`/eslint 0 nuevos en superficies; e2e verdes; `docs/vision/promises-audit.md` §B actualizado SOLO con lo ya mergeado en main (asignación/menciones/roles pasan a verificables); guía pública (`apps/webpage`) solo si afirma algo que este ODD convierte en verdadero/falso — sin ampliar claims.

Fuera de alcance: límites de seats/tier TEAM (012-S4), transferencia de propiedad del workspace, compartir un proyecto suelto con externos (`ProjectMember` — decisión de producto pendiente, issue aparte si se quiere), email/push por mención, comentarios en mobile, emitir `INVITATION_RECEIVED` in-app, cambios en `publicToken` de tareas.

## Contrato de colaboración (invariantes nuevas, independientes de I1–I14)

- W1. El `assigneeId` de una tarea siempre es miembro del workspace de la tarea (o null).
- W2. Una mención notifica solo al usuario exactamente mencionado y miembro del workspace; `Comment.mentions` guarda user IDs.
- W3. Editar un comentario notifica únicamente a mencionados nuevos.
- W4. Nadie entra a un workspace con un token de invitación emitido para otro email.
- W5. Solo OWNER/ADMIN cambian roles; nadie se auto-escala; el OWNER no es degradable ni asignable por esta vía.
- W6. Un miembro no-OWNER puede salir cuando quiera; el OWNER no puede salir (hasta que exista transferencia de propiedad).

## Allowed edit surfaces

- `apps/backend/src/tasks/` (service + dto + spec: solo validación assignee de S1)
- `apps/backend/src/comments/` (controller, service, dto, spec)
- `apps/backend/src/workspaces/` (controller, service, dto, specs)
- `apps/backend/src/repositories/` (prisma-comment, prisma-workspace-member, workspace-invitation, workspace-audit-log + specs)
- `apps/backend/src/slack/slack-notifier.service.ts` (solo línea `MENTIONED` de S5)
- `apps/backend/test/collaboration.e2e-spec.ts` + `workspaces-security.e2e-spec.ts`
- `packages/core/src/workspaces/` (usecases) · `packages/core/src/comments/` (si el parser exacto vive en core) · `packages/core/test/{workspaces,comments}/` (tests nuevos de core — ver nota de `testMatch` en Context)
- `packages/db/prisma/schema.prisma` + `migrations/` (solo reset `mentions`; sin columnas nuevas salvo justificación en Log)
- `packages/api-client/src/types/comment.types.ts` + `client.ts` (3 métodos nuevos) · `packages/hooks/` (hooks de los endpoints nuevos)
- `packages/ui/src/components/ui/mention-textarea.tsx` (solo lo que S2/S5 exijan)
- `apps/web/src/components/task/` (panel, comment-thread, assignee-selector, task-form, call sites) · `apps/web/src/components/workspace/` · `apps/web/src/components/shared/notification-popover.tsx` + `apps/web/src/app/[locale]/(pages)/notifications/`
- `apps/desktop/src/components/task/` + `apps/desktop/src/components/workspace/` (paridad S3/S5)
- `apps/mobile/app/screens/(internal)/notifications.tsx` (solo mapa de iconos S5)
- `packages/i18n/src/locales/{es,en,pt-br}.json` (solo claves nuevas)
- `docs/vision/promises-audit.md` (solo §B, S6) · `docs/planning/roadmap.md` (fila 018) · `odd/tasks/018-collab-hardening.md` (estados T# + `## Log`)

## Verification

- `cd apps/backend && npx jest src/tasks src/comments src/workspaces src/repositories src/slack` → verde
- `cd apps/backend && npm run test:e2e -- collaboration workspaces-security` → verde (requiere DB local; ver memoria docker-dev-env)
- `cd packages/core && npx jest test/workspaces test/comments` → verde (tests nuevos bajo `packages/core/test/`; `src/**/tests/` no lo ejecuta jest)
- `cd apps/web && npx vitest run src/components/task src/components/shared src/components/__tests__ src/components/workspace` → verde (requiere dists de paquetes construidos; los tests de workspace existentes viven en `src/components/__tests__/`)
- `npx tsc --noEmit` en backend/web/desktop/mobile/api-client/hooks → 0 (tras rebuild dists locales, nunca commiteados)
- `npx eslint` en archivos tocados → 0 errores
- Gates raíz (padre, CI-sim): `npm run build` → `npm run check-types` → `npm run test`
- Prueba humana (2 cuentas en local :3100): A invita a B → B acepta → A asigna tarea a B desde el panel → B ve `TASK_ASSIGNED`; A comenta "@Nombre Apellido" → B recibe toast `MENTIONED`; A cambia rol de B, cancela una invitación; B sale del workspace; C intenta el link de B → rechazado.

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Asignación: validación backend + selector montado + campo en crear + tests + e2e | delegada | done | commit feat(018) `e5f4b783` — spec 43/43 (9 nuevos), e2e collaboration 10/10 (4 nuevos), workspaces-security 10/10, web 6 UI nuevos (230 pasan; fallo preexistente habit-detail-panel en main), build+check-types 0, eslint 0 errores en tocados |
| T1b | Hallazgos de T1 (autorizados por el usuario antes de T2) | `npm run test` raíz operativo + suites con drift arregladas + subtask fijada al proyecto del padre | inline | done | commits de esta PR — raíz `turbo run test` 22/22 exit 0 (ver L4) |
| T2 | S2 | Menciones: IDs + matching exacto + re-parse edit + fix autor + tipos api-client + migración reset + tests + e2e | delegada | pending | — |
| T3 | S4 | Invitación segura (validación email al aceptar) + tests + e2e | inline | pending | — |
| T4 | S3 | Roles: PATCH role + DELETE invitation + POST leave + usecases + audit + UI web/desktop + tests | delegada | pending | — |
| T5 | S5 | Menciones visibles: chip render + navegación notificación + desktop autocomplete + mobile iconos + Slack `MENTIONED` | delegada | pending | — |
| T6 | S6 | Cierre: gates, prueba humana, promises-audit §B, roadmap, memoria | inline | pending | — |

Orden: T1 → T2 → T3 → T4 → T5 → T6 (P0 primero; T3 antes que T4 por ser seguridad y pequeño).

## Log

L1. Origen (2026-10-21): auditoría de multiusuario pedida por el usuario ("¿cómo funciona el multiuser y todo, está bien de verdad? tenemos funciones para plan business?"). Hallazgos: base real y testeada (roles, invitaciones, guards, presencia, @mentions con notificación), pero sin asignación en UI, menciones frágiles (`\w+` + fuzzy + usernames-vs-IDs), sin cambiar rol/leave/cancelar invitación, accept sin validar email, y plan TEAM sin ningún enforcement (solo marketing). Usuario aprobó crear este ODD con prioridades P0 asignación+menciones / P1 roles+leave+cancel+email / P2 visibilidad y paridad ("si", 2026-10-21).
L2. Revisión #334 REQUEST CHANGES → fix round (2026-10-22): B1 Context — `MENTIONED`/`TASK_ASSIGNED` SÍ se emiten (solo `INVITATION_RECEIVED` nunca); B2 comando core corregido a `npx jest test/workspaces test/comments` con tests nuevos bajo `packages/core/test/` — hallazgo del revisor: el `testMatch` de `packages/core/jest.config.js` solo ejecuta `**/test/**`, así que los 8 tests de `src/comments/tests/` son muertos hoy (se reporta; arreglarlos NO es alcance de este ODD); B3 eliminada referencia a tests de workspaces inexistentes en core; nits: dto 101, slack 21-27, permissions 119-122, NotificationType 291-300, vitest con `src/components/__tests__` + nota de dists.
L3. T1 done (2026-10-22): decisión de slice — el selector se renderiza por defecto en el panel (condición >1 miembro, prop `renderAssigneeSelector` se mantiene como override) y el diálogo de crear resuelve members él mismo vía `useProject`→`useWorkspaceMembers` (sin cambios en call sites). El OWNER del workspace se acepta como assignee sin fila de membresía (workspaces legacy, misma regla que WorkspaceGuard). E2E con Postgres efímero `pgvector/pgvector:pg15`. El e2e asserta creación+listado de la notificación TASK_ASSIGNED (GET /notifications); la entrega websocket (`notification:new`) se cubre en T5. Revisor #337 APPROVE (5 nits aplicadas). Corrección de una afirmación previa de este Log: `packages/api-client/tsconfig.tsbuildinfo` NO está comiteado (gitignoreado); el mecanismo es real solo en checkouts locales longevos — un buildinfo obsoleto hace que tsc incremental no emita exports nuevos (reproducido por el revisor; el sintomático `dist/client.d.ts` sin ritual/parseTask se arregla con `rm tsconfig.tsbuildinfo && rebuild`). Hallazgos fuera de alcance: (a) `npm run test` raíz no ejecutable — `turbo.json` no define la task `test`; (b) hueco de autorización PREEXISTENTE: `createSubtask` honra `dto.projectId` por encima del proyecto del padre mientras el TaskGuard autoriza por el padre → un miembro podría colocar una subtask en un proyecto de otro workspace (W1 queda igualmente cumplido para la fila creada). Corrección de lint preexistente en fichero tocado: 2 `await-thenable` en Calendar tests del spec.
L4. T1b done (2026-10-22, autorizado por el usuario: "podemos solucionar estos 2 puntos que encontraste antes de ir al T2"). Corrección adicional de la atribución de L3(a): la CI roja de main NO viene del `npm run test` raíz — el step "Unit tests" de `ci.yml` corre con `working-directory: apps/backend` (el jest del backend, verde); el job que falla en main es **Web Docker Build & Push** ("Build and push image", fallo preexistente conocido desde ODD 007: `@ordo-todo/auth-provider` no resuelve en el build docker). Fix 1 — `npm run test` raíz operativo: task `test` en `turbo.json` (dependsOn ^build), scripts de test no-interactivos (core `jest --coverage` + `test:watch`; hooks/stores/ui `vitest run` + `test:watch`; desktop `vitest run`), ui-shared `--passWithNoTests` (0 ficheros de test), y exclusión explícita de mobile en el script raíz (`--filter=!@ordo-todo/mobile`) — deuda registrada: 16/18 suites mobile fallan por drift (`useTheme` sin ThemeProvider wrapper desde que existía el tema; infra ya marcada rota en ODD 007; arreglarla es tarea aparte). Drift arreglado para que el raíz quede verde: web habit-detail-panel (mock de `useConfirm`, el componente migró del viejo `window.confirm`), stores (localStorage mock en vitest.setup — Node 22+jsdom, mismo patrón que apps/web; zustand persist lo exige), db seed-marketing (los tests esperaban el changelog falso v2.1.0/v2.0.0 que ODD 013 T3 retiró → ahora fijan el estado honesto: 1 entrada "unreleased"), styles tokens (paleta violeta→cyan vigente, 12 asserts), ui workspace-card (el color vive en el icon-box desde el redesign, no en border-left; asserts vía atributo style en rgb normalizado por jsdom), desktop file-upload (carrera: la promesa de upload se auto-resolvía a los 100ms y podía desmontar el estado 50%/100% a mitad de assert → promesa pendiente hasta el final; 3/3 corridas estables). Gotcha nuevo registrado: el cache de turbo reempló un dist VIEJO de api-client en un worktree recién clonado (`cache hit, replaying logs` → web build falla con exports fantasma) → `npx turbo run build --force` lo arregla. Fix 2 — `createSubtask` fija la subtask al proyecto del padre: `dto.projectId` distinto del del padre → 400 (RED→GREEN con 2 tests de spec + 1 e2e "smuggled subtask" con proyecto de otro workspace). Hallazgo adicional registrado (NO tocado): desktop crea subtasks por `POST /tasks` con `projectId: "default"` literal en `subtask-list.tsx` (placeholder con `as any`) — flujo dudoso por ruta distinta, follow-up aparte. Evidencia: raíz 22/22 exit 0 (db 256, styles 120, ui 121, stores, hooks, desktop 97, web 231, core 469, backend 45/45 spec + e2e 11/11), check-types 0, eslint 0 errores en tocados.
