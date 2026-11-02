# ODD 028 — Paginacion con take en listados (follow-up de 027 T6)

Objetivo: acotar los `findMany` sin `take` que sirven listados de API,
slice por slice, sin cambiar el comportamiento de llamadores internos
(estadisticas, IA, crons, API publica v1) que necesitan listas completas.

Convencion: `PaginationDto` en `apps/backend/src/common/dto` (limit
default 20, max 100, page default 0 — igual que `QueryNoteDto` de notas).
Cada endpoint migrado acepta `@Query() pagination: PaginationDto` y lo
pasa al repositorio como `take`/`skip`. Sin paginacion explicita, el
repositorio sigue ilimitado (opt-in por endpoint, no cap global que
trunque estadisticas en silencio).

Runner: `npm run test --workspace=@ordo-todo/backend`.

## Specs

S1: "Listado de tareas acotado: GET /tasks y GET /v1/tasks aceptan
limit/page; sin params, /tasks pagina con defaults y /v1/tasks sigue
ilimitado (API versionada estable). parentTaskId y assignedToMe se
filtran en DB para que la pagina sea correcta".
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

## Log

L1: "continue" + eleccion "Paginacion con take" (2026-11-01). El usuario
elige este follow-up de los 4 propuestos. Rama feat/028-pagination-caps
(apilada sobre 027).
