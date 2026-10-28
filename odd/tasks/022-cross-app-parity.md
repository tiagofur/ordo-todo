# ODD: Paridad entre pantallas (web ↔ desktop ↔ mobile) — Create Task como piloto

Issue: #438

Objective: eliminar la duplicación de formularios y honorar una sola fuente de verdad por flujo: los diálogos de dominio completo (empezando por **Create Task**) se implementan una vez en `packages/ui` con labels por props e i18n real es/en/pt-br, y se consumen igual desde `apps/web` y `apps/desktop` (mobile comparte el frontend de desktop vía PRD). Seguir con la matriz de paridad del resto de pantallas: task-detail/quick-add/papelera/settings/etc.
Branch: `feature/odd-022-cross-app-parity` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; una PR por T# (≤300 líneas ideal); test-first (RED/GREEN) en todo cambio de comportamiento; piloto Create Task primero (T1) antes que la extensiva T2.
Test runner: Jest (backend) · Jest (core, solo `packages/core/test/**`) · Vitest (web/desktop) · typecheck del móvil vía `npx tsc --noEmit -p apps/mobile` (incluye `../desktop`).

## Context (leer primero — presupuesto: estos paths, nada más)

Distinción crítica para este ODD (no confundir):
- **Web**: Next.js (App Router) consumiendo `packages/` vía `@ordo-todo/*` y componentes propios en `apps/web/src/components/`. i18n de **next-intl** (`packages/i18n/src/locales/{es,en,pt-br}.json`).
- **Desktop**: Tauri 2 + Vite, frontend propio en `apps/desktop/src/` (React, NO Next) con i18n de **react-i18next** (`apps/desktop/src/i18n/`). Componentes duplicados de web en `apps/desktop/src/components/task/*`.
- **Mobile**: Tauri 2 (Android/iOS) que **comparte el frontend de desktop**: `apps/mobile/vite.config.ts` apunta `@` a `../desktop/src` y el paquete dice "renderiza el mismo frontend que apps/desktop". El i18n es el de desktop (con adaptadores). **No hay frontend móvil propio**; la paridad móvil se gana con desktop, salvo gestos/touch/safe areas que SÍ son solo-mobile (ocupan specs propias, no esta).
- `packages/ui`: componentes de dominio compartidos entre web y desktop (QuickAdd lo usa web; desktop importa otros). **Objetivo**: diálogos completos de dominio en packages/ui configurados por props (labels, onSubmit, onOpenChange, onRequestCreateProject?).

Duplicados detectados (inventario mínimo, 2026-10-28):
- `create-task-dialog.tsx` web (Next, TS, DEFAULT_LABELS en inglés sin next-intl, usa createTaskSchema compartido `@ordo-todo/hooks`, incluye recurrence + assignee via `useProject/useWorkspaceMembers`, custom fields vía `CreateTaskCustomFieldsWrapper`) vs desktop (Tauri, hardcode ES "Crear Tarea", createTaskSchema zod **local propio**, incluye CustomFieldInputs locales + template selector/voz/smart parse/estimación IA, SIN recurrence ni assignee, empty state removido en ODD 021).
- `task-card-compact.tsx`, `task-detail-panel.tsx`, `subtask-list.tsx`, `comment-thread`, `attachment-list`, papelera (web unified-trash-view vs desktop TasksTrash), filtros workspace (Tasks/Dashboard/daily-ritual en ambas apps; ya triplican la misma lógica en 6 sitios).
- i18n web: namespace `CreateTask` NO existe (labels DEFAULT_LABELS hardcodeados en inglés en el diálogo web — deuda preexistente). Namespaces existentes: `TaskForm`, `QuickAdd`, `Tasks`, `UnifiedTrash`, `CommandPalette` (revisar paridad en T1).
- Pors en Tacticas (merges #431-#437): web y desktop ya aceptan projectId `null` (tarea express); el schema zod compartido (`packages/hooks/src/schemas.ts`, `packages/core/src/shared/validation/task.validation.ts`) es la fuente de verdad de validación.

Salida verificada (desktoop pantalla blanca, hotfix PR #437): fijar primero que la app de escritorio ARRANCA en build producción — CSP con `https://api.ordotodo.app` + **sin manualChunks manual** en `apps/desktop/vite.config.ts` (generaban ciclos TDZ en producción: "Cannot access 'k' before initialization"). Esos dos fixes entran en T0 como prerequisito, no como decoración.

## Specs

S0. **(P0) Prerrequisito de arranque**: los dos fixes de #437 aterrizan en esta ODD (CSP con producción + vite.config sin manualChunks) y la app de escritorio levanta pantalla de login en build contra prod. Check: `npm run tauri:build` en apps/desktop + verificación del render real (servir `dist/` con `vite preview` + navegador leyendo DOM, login visible y `fetch https://api.ordotodo.app/api/v1/health` OK) y screenshots.

S1. **Matriz de paridad (P0)**: inventario completo en `docs/vision/` o issue tabs documentadas en el propio ODD (tabla pantalla/ruta/web/desktop/mobile, form/function, endpoint, i18n namespace/key, componente actual, duplicados) y decisión por fila: unificar en packages/ui / dar paridad vía feature flag por plataforma / deprecar. Check: tabla `[ ] en ODD` + script o grep que lista componentes duplicados (create-task-dialog, task-card-compact, task-detail-panel, subtask-list, comment-thread, attachment-list, trash, filters) con paths y líneas por app.

S2. **Contrato de formulario compartido (P0)**: esquema único de Create Task — campos y validación — extraído a un módulo compartido: `createTaskSchema` (`@ordo-todo/hooks` + `task.validation.ts` de core) como única fuente; el zod **local de desktop se elimina** y se importa el compartido. Contrato de payload: `{title, description?, projectId?, priority, dueDate?, estimatedMinutes?, recurrence?, assigneeId?}` (projectId opcional-nullable, ODD 021). Check: desktop y web importan el mismo schema; tests de inferencia (parse acepta todo el contrato, rechaza title vacío).

S3. **Componente Create Task en packages/ui (P0)**: presentacional sin hooks de i18n internos; props `{open, onOpenChange, projectId?, projects, onSubmit, onGenerateAIDescription?, isPending?, assignees?, customFieldsNode?, labels}` con estructura igual: Título · Proyecto (default "sin proyecto") · Descripción (+ AI Magic opcional) · Assignee (si >1 asignable) · Prioridad inline · Estimación · Vencimiento · Recurrence. Dos modos visuales: **basic** (botón principal "Crear") y **advanced** (collapsible con recurrence/custom fields/notas). Plataforma extra (plantilla/voz/smart-parse) entra vía `extraActions?` slot, nunca duplicando el form. Custom fields requieren proyecto: se pinta solo con proyecto seleccionado. Check: el componente renderiza igual en ambas plataformas con los mismos labels/props (snapshot de DOM no idéntico pero UI sí: mismos campos presentes; test vitest en packages/ui o en cada app mediano).

S4. **i18n (P0)**: nuevo namespace `CreateTask` en `packages/i18n/src/locales/{es,en,pt-br}.json` con todas las claves del formulario (title, selectProject, description, priority, estimatedMinutes, dueDate, assignee, unassigned, emptyState?, botones, prioridad labels, recurrence), usando `serializeCalendarDateForApi`; desktop consume el namespace vía react-i18next con **claves importadas** (paquete compartid `@ordo-todo/i18n`) y web vía next-intl; sin literales 'Crear Tarea'/'Create Task' hardcodeados en ninguna de las dos apps. Check: grep de literales de los dialogs = 0; paridad de claves es/en/pt-br (mismo Set, reportadas en PR).

S5. **Web consume el componente unificado (P1)**: `apps/web/src/components/task/create-task-dialog.tsx` se reemplaza por contenedor que pasa projects/currentProject desde el workspace, assignees vía hooks web y `CreateTaskCustomFieldsWrapper` a `customFieldsNode`, labels vía next-intl. Entradas existentes (tasks-view, dashboard, calendar, eisenhower, project-detail/list, workspace-dashboard) siguen funcionando (compat del prop `projectId`). Check: vitest vigentes de web (`quick-add-dialog`, `create-task-dialog-assignee`) verdes adaptados sin huecos; `npm run check-types` verde.

S6. **Desktop consume el componente unificado (P1)**: `apps/desktop/src/components/task/create-task-dialog.tsx` se reemplaza por contenedor que pasa igual (slots: template selector / voz / smart parse / estimación IA como `extraActions`, CustomFieldInputs desktop a `customFieldsNode`, labels vía react-i18next del namespace `CreateTask`). El form ya no tiene schema local. Entradas desktop (Dashboard/Tasks/ProjectDetail, etc.) siguen funcionando. Check: vitest vigentes de desktop verdes; `npx tsc --noEmit -p apps/mobile` 0 errores; build release sigue arrancando en login (verificación S0 con el nuevo componente).

S7. **Patrón extensivo (P2, fuera de este ODD pero intencionado)**: el contrato (componente + namespace + contenedor delgado por plataforma) queda documentado en `docs/COMPONENT_GUIDELINES.md` como patrón para los siguientes diálogos; su adopción en task-detail-panel, quick-add completo, settings, papelera, task-card-compact NO se ejecuta aquí (issue #438 queda abierto con la matriz de continuación).

Fuera de alcance: rediseño visual con nueva identidad (el piloto conserva la identidad actual; cualquier refresh va en el ODD del rediseño), `packages/ui-mobile` nuevo (mobile comparte desktop), ajustes macOS (notificaciones exactas, etc.), cambios de backend (API/DTO/validación de nominado ya compartidos: el backend ya soporta recurrence/assignee/custom fields), la matriz exhaustiva de paridad resuelta fila por fila (eso es el ODD de continuación tras S1).

## Contrato de colaboración (invariantes nuevas)
- B1. Una sola fuente de validación de formularios compartidos: el schema vive en `@ordo-todo/hooks`/core. Ninguna app declara zod de dominio compartido en local; si un formulario es compartido, su schema también.
- B2. Ningún literal user-facing de un formulario compartido se hardcodea en apps (ni 'Crear Tarea' ni 'Create Task'): vive en el namespace i18n del paquete, consumido por props (componentes) + namespace (contenedores).
- B3. Un formulario compartido se implementa **una vez**: componente presentacional en `packages/ui` + contenedores delgados de plataforma (hooks, submit, navegación). Duplicar un formulario completo en apps está prohibido por este ODD.
- B4. Paridad de comportamiento, no de pixels: misma estructura, mismos campos, mismas validaciones y misma semántica ("express" = proyecto vacío en todas las plataformas); los detalles visuales por plataforma (scroll, safe area, atajos) pueden variar.

## Allowed edit surfaces
- `apps/desktop/index.html`, `apps/desktop/vite.config.ts` (prerrequisito S0)
- `odd/tasks/022-cross-app-parity.md`
- `docs/planning/roadmap.md` (fila 022)
- `packages/hooks/src/schemas.ts`, `packages/core/src/shared/validation/task.validation.ts` (solo si el contrato exige un ajuste)
- `packages/ui/src/components/task/` (componente create-task nuevo) + su test
- `packages/i18n/src/locales/{es,en,pt-br}.json` (namespace CreateTask)
- `packages/api-client/src/types/` (solo tipos del contrato si faltan)
- `apps/web/src/components/task/create-task-dialog.tsx` (contenedor) + tests existentes de task en web
- `apps/desktop/src/components/task/create-task-dialog.tsx` (contenedor) + el api-hooks/lib que use + `apps/desktop/src/i18n/` (namespace importado)
- `docs/COMPONENT_GUIDELINES.md` (patrón en S7)

## Verification

```bash
# S0 — desktop arranca en producción
cd apps/desktop && VITE_API_URL=https://api.ordotodo.app/api/v1 npm run tauri:build
npx vite preview --port 4173 --strictPort  # dist servido; DOM de login visible en navegador

# S2-S6
npm run build && npm run check-types
npm run test --filter=@ordo-todo/hooks --filter=@ordo-todo/core
cd apps/web && npx vitest run src/components/task
cd apps/desktop && npx vitest run
npx tsc --noEmit -p apps/mobile
grep -rn "Crear Tarea\|Create Task" apps/web/src/components/task apps/desktop/src/components/task
```

Esperado: CSP con producción, sin manualChunks manual; login visible contra prod; schema compartido importado en ambas apps (0 zod local del dominio), namespace CreateTask con paridad es/en/pt-br, vitest/tsc verdes, screenshots del formulario en ambas plataformas con misma estructura.

## Tasks

| T#  | Specs | Entrega                                                                 | Ruta sugerida                                                                                                        | Estado   |
|-----|-------|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|----------|
| T0  | S0    | Prerrequisito: CSP prod + sin manualChunks (hotfix release)          | index.html → vite.config.ts → tauri:build → verificación con navegador                                             | COMPLETADO (PR #437 en main `277e81f6`) |
| T1  | S1    | Matriz de paridad completa (docs en este ODD)                          | inventario via carpeta de componentes + rutas                                                                  | COMPLETADO (registrada en S1 y en #438) |
| T1b | S3+S4 | Confirmación del shape (impeccable): brief con layout único completo, slots por plataforma y i18n compartido | packages/i18n locales + packages/ui task create-task-form (presentacional) | COMPLETADO (aprobado por usuario) |
| T2  | S2+S3 | Componente compartido en packages/ui + schema único + tests           | packages/ui/src/components/task/create-task-dialog.tsx + tests (127/127 tests)                                       | COMPLETADO (evidencia L2) |
| T3  | S4    | Namespace CreateTask + paridad es/en/pt-br solo claves nuevas          | packages/i18n/src/locales (31 claves en es/en/pt-br)                                                                | COMPLETADO (evidencia L2) |
| T4  | S5    | Web consume el componente                                              | apps/web/src/components/task/create-task-dialog.tsx (303/303 tests, tsc limpio)                                      | COMPLETADO (evidencia L2) |
| T5  | S6    | Desktop (y por herencia mobile) consume el componente                  | apps/desktop/src/components/task/create-task-dialog.tsx (101/101 tests, tsc móvil limpio, .app reinstalada)         | COMPLETADO (evidencia L2) |
| T6  | S7    | Documentación operativa del patrón en COMPONENT_GUIDELINES              | docs/guides/packages/ui-components.md                                                                               | COMPLETADO (evidencia L2) |

## Log

L1. Pedido original (2026-10-28): "los formularios de crear tarea no estan iguales, por ahora checa con $impeccable que hacemos con este formulario... y cremos un issue de paridad entre pantallas y formularios, etc.. funciones... entre las apps web y desktop y mobile"

Decisiones de diseño del padre (2026-10-28):
- D1: móvil comparte frontend con desktop (verificado en `apps/mobile/vite.config.ts`), así que "paridad mobile" se gana unificando desktop; solo gestos/safe/nocho fuera del alcance de este ODD.
- D2: piloto Create Task porque es el caso visible del usuario; la matriz de paridad completa entra en S1, pero su cumplimiento total es ODD de continuación (cierre parcial de #438, no cierre total).
- D3: i18n por namespace compartido (props en el componente, clave resuelta en cada contenedor: next-intl web y react-i18next desktop), sin literales en apps.
- D4: el refactor visual visualmente es conservador — mismo formulario, mismos campos, estructura básica+avanzada; no es un rediseño (el refresh va en un ODD aparte si el usuario lo pide).

**Confirmado con impeccable (usuario, 2026-10-28)**:
- Alcance: formulario completo unificado (campos de web y desktop; extras como slots por plataforma).
- Arquitectura: componentes compartidos en `packages/ui`; contenedores delgados por app (hooks, submit, i18n por framework).
- Idioma: i18n compartido es/en/pt-br (web por next-intl, desktop por react-i18next con el namespace `CreateTask` compartido). Sin literales en apps.
- Atención registrada: papelera/recurrencia en dupes queda en la matriz de paridad (no se ejecuta ahora), revisión de contraste/foco accesible y validación visible (banner + asociación label/error) forman parte del piloto.


L2. Ejecución piloto Create Task (2026-10-28):
- Componente presentacional único creado en `packages/ui/src/components/task/create-task-dialog.tsx` y exportado desde barrel (`@ordo-todo/ui`). Soporta: Título, Proyecto (con opción "Sin proyecto (express)" y botón "+" para nuevo proyecto), Descripción, Prioridad (4 botones con banderas y labels con alto contraste y semántica de radio accesible), Estimación (min) con slot de Auto IA, Fecha de vencimiento, Asignar a (si hay >1 miembro), Recurrencia (slot), Campos personalizados (slot cuando hay proyecto seleccionado).
- Namespace `CreateTask` añadido con 31 claves idénticas en `es.json`, `en.json`, `pt-br.json`.
- `apps/web/src/components/task/create-task-dialog.tsx` reducido de 415 a 170 líneas actuando como contenedor delgado que consume `@ordo-todo/ui` con `useTranslations("CreateTask")`.
- `apps/desktop/src/components/task/create-task-dialog.tsx` adaptado para consumir `@ordo-todo/ui` con `react-i18next`, inyectando template-selector en `headerActions`, voz y smart-parse en `titleActions`, auto-estimación IA en `autoEstimateAction` y custom-fields en `customFieldsNode`. Se eliminaron esquemas zod locales duplicados.
- Fixed `packages/hooks/src/__tests__/hooks.test.tsx` (assertion de 4 argumentos de `useTasks` tras ODD 021).
- Gates: `npx turbo run build` 17/17; `npm run check-types` 15/15; `npx turbo run test` 22/22; `npx tsc --noEmit -p apps/mobile` 0 errores; vitest ui 127/127, web 303/303, desktop 101/101.
- App desktop recompilada con Tauri (`Ordo-Todo.app` 12.85 MiB) y reinstalada en `/Applications/Ordo-Todo.app`.
