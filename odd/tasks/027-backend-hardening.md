# ODD 027 — Backend hardening (review completo)

Objetivo: cerrar los hallazgos CRITICAL/HIGH del review completo del backend
(ver `git log` del workflow de review en esta sesion). Rama:
`feat/027-backend-hardening`. Estrategia de entrega: `ask-on-risk`
(default); conteo acumulado abajo. Pregunta de cadena (stacked vs
feature-branch) pendiente para cuando el primer slice este listo.
Runner: `npm run test --workspace=@ordo-todo/backend`
(jest, `NODE_OPTIONS=--experimental-vm`).

## Specs

S1: "Cerrar IDOR y autorizacion: WorkspaceGuard/BaseResourceGuard +
ownership en custom-fields, AdminGuard real en changelog, poblar role en
JWT, re-verificar membership/ownership por-evento en WS, y specs
(custom-fields/focus hoy 0)". Cobertura: cada guard nuevo con spec que
prueba miembro OK, no-miembro 403 y recurso inexistente 404.
S2: "Hacer CSRF real o eliminarlo: validar token de csrf.service en
mutaciones con cookie y proteger /uploads/ con auth/ownership o URLs
firmadas, validando magic bytes ademas de extension".
S3: "Corregir plataforma de despliegue: Dockerfile a Node >=22 alineado
con engines/CI, unificar env (JWT_EXPIRATION, REDIS_URL), validar las 21
vars faltantes, arreglar start:prod, purgar logs del indice y eliminar
csurf/ioredis muertos con src/redis/ huerfano".
S4: "Acotar datos y crons: PaginationDto unico + take/skip/cursor en
task.repository y los 154 findMany sin take, select en vez de
subTasks:true/comments sin limite, indices FK faltantes, batch/include
contra los N+1, $transaction atomico en credits/habits, y paginacion por
lotes + lock distribuido/anti-solape en crons".
S5: "Unificar cache/ops y endurecer CI: una sola implementacion Redis con
SCAN, CacheService sobre Redis compartido, readiness 503 real en
health.controller, timeouts en Gemini/email/Stripe/Slack, colas para
webhooks/emails/AI en vez de inline, y gates bloqueantes: strict
progresivo, lint sin continue-on-error, check-types y coverageThreshold en
CI con tests para los 11 modulos en cero".

## Tasks

- [ ] T1 (S1, inline): CustomFieldGuard + spec. Estado: pending.
- [ ] T2 (S1, inline): Changelog AdminGuard + poblar role en JWT. Estado: pending.
- [ ] T3 (S1, inline): WS authz por evento. Estado: pending.
- [ ] T4 (S2, inline): CSRF + uploads + magic bytes. Estado: pending.
- [ ] T5 (S3, inline): Plataforma (Dockerfile, env, start:prod, dead deps, logs). Estado: pending.
- [ ] T6 (S4, inline): Datos (paginacion, N+1, tx, indices). Estado: pending.
- [ ] T7 (S4, inline): Crons con batch + anti-solape. Estado: pending.
- [ ] T8 (S5, inline): Cache/ops + CI gates. Estado: pending.

Lineas acumuladas: 0. Commits: ninguno aun.

## Log

L1: "hagamos todo que puedas, un tras otra con commits en cada paso"
(2026-11-01). El usuario pide implementar todos los hallazgos del review
completo del backend, en cadena, un commit por paso. Se trabaja inline
siguiendo este logbook; cada tarea cierra con work-unit commit en
feat/027-backend-hardening con test y verificacion observada.
