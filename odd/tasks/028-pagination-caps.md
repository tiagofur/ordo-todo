# ODD 028 — Paginacion con take en listados (follow-up de 027 T6)

Objetivo: acotar los `findMany` sin `take` que sirven listados de API,
slice por slice, sin cambiar el comportamiento de llamadores internos
(estadisticas, IA, crons, API publica v1) que necesitan listas completas.

Convencion: `PaginationDto` en `apps/backend/src/common/dto` (limit
max 100, page base 0 — igual que `QueryNoteDto` de notas) + helper
`toTakeSkip()`. Opt-in estricto: sin `limit`/`page` en el query el helper
devuelve `undefined` y el endpoint conserva su comportamiento previo
(lista completa); con params explicitos aplica `take` (default 20, cap
100) y `skip = page*take`. Asi el web `api-client` (que pide listas
completas sin params) y los llamadores internos no se truncan en
silencio, y el abuso (`take=1000000`) queda capado. Cada endpoint con
filtros usa un DTO extendido (`QueryXxxDto extends PaginationDto`) para
no chocar con `forbidNonWhitelisted` del pipe global.

Runner: `npm run test --workspace=@ordo-todo/backend`.

## Specs

S1: "Listado de tareas acotado: GET /tasks y GET /v1/tasks aceptan
limit/page opt-in; sin params, /tasks sigue completo (compat con web
api-client) y /v1/tasks sigue ilimitado (API versionada estable).
parentTaskId y assignedToMe se filtran en DB para que la pagina sea
correcta".
S2: "Siguientes listados (pendiente): projects, notifications,
activities, habits, comments, tags, meetings, changelog, faq, kb".

## Tasks

- [x] T1 (S1, inline): PaginationDto + spec. Estado: done (4/4).
- [x] T2 (S1, inline): tasks repo/service/controllers + specs. Estado:
  done (full suite 1562, backend+web tsc limpios, 0 errores eslint).
  GET /tasks pagina con defaults (limit 20/max 100); /v1/tasks queda
  ilimitado a proposito. Recorte honesto: e2e no ejecutable aqui (sin
  PG) — correr `test:e2e` de tasks antes de mergear.
- [x] T3a (S2): projects + notifications. Estado: done en d3d78f8d
  (full suite 1567, backend+web tsc limpios, 0 errores eslint).
- [x] T3b (S2): faq + tags + meetings. Estado: done (full suite 1568,
  backend+web tsc limpios, 0 errores eslint). GET /faq, /tags y
  /meetings paginan con defaults; ordenes estables (id tiebreaker);
  `limit` de meetings queda como alias de take para el caller MCP.
  Quedan T3d+: activities(sin endpoint GET), habits(slice en memoria?),
  comments(solo v1 por task — estable, sin cambios), templates,
  newsletter, webhooks, api-tokens, search, workspaces, sessions
  (+ deleted-projects).
- [x] T3c (S2): kb + changelog + contact + roadmap. Estado: done (suite
  1576, backend+web tsc limpios, 0 errores nuevos eslint — 7
  preexistentes verificados en HEAD). GET /kb/articles gana
  limit/page; changelog/contact/roadmap migran de skip/take manual
  (sin cap) al DTO compartido (take cap 100); default de roadmap
  50→20. Ordenes con tiebreaker id. Sin cambios en el arbol de
  llamadas (/v1/comments se mantiene unbounded por API estable).
- [x] T3d (S2): templates + newsletter + search + habits. Estado: done.
  Templates gana limit/page (orden name+id); newsletter migra skip/take
  manual al DTO; search `limit` capa 1..100 (sin page: ranking
  semantico); habits pagina con slice post-sort + completions de la
  pagina. Webhooks es /v1 (estable, sin cambios); api-tokens user-scoped
  tiny (doc, sin cambios).
- [x] T3e/f (S2): correccion opt-in de todo 028. Hallazgo: defaults 20
  truncaban en silencio al web api-client (pide listas completas sin
  params) y `PaginationDto` pelado + filtros extra habria dado 400 por
  forbidNonWhitelisted. Fix: helper `toTakeSkip()` (undefined sin
  params = lista completa, como antes) en los 14 endpoints migrados;
  DTOs extendidos nuevos para habits, templates y kb. Search ya estaba
  capado a mano. Suite 1584 verde, backend+web tsc limpios, 0 errores
  eslint. Preexistentes OK sin cambios: timers history (@Max 100),
  notes (QueryNoteDto), admin users (clamp 100 en servicio),
  workspaces/sessions/agent-jobs/objectives (user-scoped chicos, doc).

## Log

L1: "continue" + eleccion "Paginacion con take" (2026-11-01). El usuario
elige este follow-up de los 4 propuestos. Rama feat/028-pagination-caps
(apilada sobre 027).
