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
- [ ] T3 (S2): resto de listados. Estado: pending (requiere su propio slice).

## Log

L1: "continue" + eleccion "Paginacion con take" (2026-11-01). El usuario
elige este follow-up de los 4 propuestos. Rama feat/028-pagination-caps
(apilada sobre 027).
