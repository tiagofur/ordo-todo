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

- [x] T1 (S1, inline): CustomFieldGuard + spec. Estado: done en 3d8ac07d
  (guard spec 8/8, guards 74/74, tsc sin errores en archivos tocados).
- [x] T2 (S1, inline): Changelog/FAQ/KB tras AdminGuard. Estado: done
  en a2e092d1 (faq+kb+changelog+admin 54/54, tsc limpio). Decision: no se
  puebla `role` en el JWT porque los roles son por workspace; el contenido
  global (changelog/FAQ/KB) usa AdminGuard (ODD 019); el @Roles/
  RolesGuard queda solo para membership via WorkspaceGuard.
- [x] T3 (S1, inline): WS authz por evento. Estado: done en 1d5f074f
  (gateways 32/32, tsc limpio).
- [x] T4 (S2, inline): CSRF + uploads + magic bytes. Estado: done en
  ee12f4e1 (csrf/file-signature/upload/attachments 41/41, tsc limpio).
  Alcance recortado: la descarga de /uploads/ sigue publica (nombres
  aleatorios); URLs firmadas o endpoint con auth requieren coordinacion
  con clientes -> follow-up, no se finge cerrado.
- [x] T5 (S3, inline): Plataforma. Estado: done (full suite 145/1548,
  tsc limpio). Dockerfile a Node 24, start:prod a dist/src/main.js,
  compose dev con REDIS_URL/JWT_EXPIRATION, fuera csurf/ioredis +
  src/redis/ muerto, 16 logs fuera del indice.
- [x] T6 (S4, inline): Datos. Estado: done en 94e0935c (N+1 batch +
  tx atomicas: 281 tests) y bf24809d (duration batch + 11 indices FK con
  migracion). Recorte honesto: paginacion con take en los 154 findMany
  queda follow-up (cambia comportamiento y exige e2e + decision de
  producto sobre tamanos); migracion SQL sin DB para `migrate diff`,
  revisar antes de desplegar.
- [x] T7 (S4, inline): Crons. Estado: done (full suite 147/1560,
  tsc limpio). Decorador @SkipOnOverlap en 9 ticks (risk, 6 smart,
  ritual, webhook, plan, executeJob por jobId) + escaneo paginado en los
  6 barridos por usuario. Recorte honesto: lock distribuido entre
  replicas queda follow-up (requiere Redis obligatorio).
- [ ] T8 (S5, inline): Cache/ops + CI gates. Estado: pending.

Lineas acumuladas: 0. Commits: ninguno aun.

## Log

L1: "hagamos todo que puedas, un tras otra con commits en cada paso"
(2026-11-01). El usuario pide implementar todos los hallazgos del review
completo del backend, en cadena, un commit por paso. Se trabaja inline
siguiendo este logbook; cada tarea cierra con work-unit commit en
feat/027-backend-hardening con test y verificacion observada.
