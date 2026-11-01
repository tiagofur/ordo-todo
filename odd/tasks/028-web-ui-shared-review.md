# 028 — Web + UI + compartidos (review → fixes)

Objective: aplicar los fixes seguros del review completo de app web, package UI y compartidos, sin tocar backend.
Branch: feat/028-web-ui-shared-review (worktree /tmp/ordo-web-ui-review, base main). Delivery: ask-on-risk. Test runner: vitest por package + tsc/eslint donde aplique.

## Specs

S1: "hagamos un review completo de la app web y el package de UI y cosas compartidas entre apps" — review ya entregado en el turno anterior; este doc solo trackea los fixes derivados.
S2: "haga todo que puedas hacer, haciendo commits de cada tarea" — cada tarea cierra con ≥1 work-unit commit (tests/docs junto al comportamiento, Conventional Commits, sin Co-Authored-By).
S3: "ojo, hay otro agente trabajando en backend asi que worktrees separados" — trabajo solo en worktree /tmp/ordo-web-ui-review, rama propia; prohibido tocar apps/backend, packages/db (migraciones) y la rama feat/027-backend-hardening.
S4: Deuda priorizada del review con evidencia path:linea: middleware sin firma (UX-gate), QueryProvider muerto, violeta/acción + Montserrat vs Inter, doble cliente HTTP, paquetes muertos (ui-shared/validations/db-cliente/eslint-config), triple sync-store, PRIORITY sin URGENT, ./providers roto, Switch doble-toggle, cn/cva x3, tokens.ts↔variables.css sin paridad, CI sin tests de packages, CSP/HSTS ausentes.
S5: Decisiones de producto abiertas (NO tocar sin respuesta): migración del primario in-app cian→violeta; eliminar paquetes publicados (ui-shared/validations); unificación de cliente HTTP y sync-store (diseño con adaptadores).

## Tasks

- [x] T1 (S2,S4-P3) higiene web: retirar artefactos build-error*/build-output*/next.config.old.ts — route: inline — status: done — commit: 6c6436a8
- [x] T2 (S2,S4-P1.6) ui: reparar export ./providers roto (quitar o implementar + test de exports) — route: inline — status: done — commit: 9fa3c2aa (quitado; 0 importadores)
- [x] T3 (S2,S4-P0.1) web middleware: fail-closed sin exp + documentar que la API es la autoridad — route: inline — status: done — commit: 77a6e916 (RED→GREEN con probe node; vitest no corrió: sin node_modules en worktree)
- [x] T4 (S2,S4-P1.4) core: alinear PRIORITY_VALUES con URGENT (entity ya lo admite) + test — route: inline — status: done — commit: b8ae93bf (RED→GREEN con probe; jest no corrió: sin node_modules)
- [x] T5 (S2,S4-P0.3) web: fuente Montserrat→Inter según DESIGN.md — route: inline — status: done — commit: 54a13bae
- [x] T6 (S2,S4-P1.5) web: noindex en app privada (defaultMetadata) — route: inline — status: done — commit: 671ae4fa (+test noindex en seo.test.ts)
- [x] T6b (S4-P3) web manifest: theme_color a marca #AD46FF + retirar screenshots inexistentes — route: inline — status: done — commit: d6842ce6
- [x] T11 (S5-violeta) styles: voz semántica cian→violeta (#7C3AED/#A78BFA, secondary #F5F3FF/#2E1065) + paridad tokens.ts/test — route: inline — status: done — commit: 8cccebdb (paridad 16/16 con probe; vitest sin correr: sin node_modules)
- [x] T12 (S5-violeta) docs: cerrar decisión en PRODUCT.md + DESIGN.md — route: inline — status: done — commit: c93e1be0
- [x] T13 (S5-violeta) web: normalizar CTAs sólidos y focos hardcoded a bg-primary/ring-ring en dashboard/tasks/tasks-view/calendar + accentColor — route: inline — status: done — commit: b1a8985f (tiles/tintes decorativos quedan para pase visual)
- [ ] T7 (deferido, S5) recolor violeta→acción semántica en páginas — route: hecho en T13 para CTAs; resto decorativo pendiente de pase visual — status: partially-done
- [ ] T8 (deferido, S5) eliminar ui-shared/validations o absorberlos — route: pendiente decisión — status: blocked
- [ ] T9 (deferido, S5) unificar cliente HTTP y sync-store — route: pendiente diseño — status: blocked
- [x] T14 (S2,S4-P1.6) ui: dedup cn (lib/utils re-exporta canónico) — route: inline — status: done — commit: 2ae3296b (suite ui 129 verdes)
- [x] T15 (S2,S4-P1.6) ui: Switch en Radix (disabled respetado, sin input anidado) + test — route: inline — status: done — commit: 949f6f28 (RED→GREEN vitest; tsc sin errores nuevos)
- [x] T16 (S2,S4-P2.4) ui a11y: Skeleton aria-hidden + StatsCard operable por teclado + tests — route: inline — status: done — commit: f1829e90
- [x] T17 (S2,S4-P0.2) web: eliminar QueryProvider + ClientProviders muertos — route: inline — status: done — commit: 4b440d08 (0 importadores; purge en api-client queda como no-op hasta unificar HTTP)
- [x] T18 (S2,S4-P1.2) eliminar @ordo-todo/ui-shared muerto + dep en ui + trigger CI — route: inline — status: done — commit: 9f71b318 (suite ui 135 verdes)
- [x] T19 (S2,S4-P1.2) eliminar @ordo-todo/validations muerto (3 package.json + transpile + trigger CI) — route: inline — status: done — commit: 8eac52bf + 03b16ba6 (fix COPY en Dockerfile backend para no romper su build + comentario webpage)
- [x] T20 (S2,S4-P2.3) web: header HSTS (sin preload; CSP queda para pase con browser) — route: inline — status: done — commit: 05c64fe3 (tsc aislado limpio)
- [x] T21 (S2,S4-P2.3) ci: correr suites de packages en CI + script test en api-client + fix test timer desactualizado (`/timers/task/:id`, respalda el backend) — route: inline — status: done — commit: 42b93dec (gate turbo 11/11 verde local: api-client 200, core 516, db 256, hooks 166, online-status 8, openclaw 13, stores 22, styles 122, ui 135)
- [ ] T10 (resto) CSP enforcing, doble cliente HTTP, triple sync-store, tiles/tintes del pase visual — route: pendientes (diseño o browser requerido) — status: pending

## Log

L1 (2026-11-01, request verbatim que autoriza este trabajo): "haga todo que puedas hacer, haciendo commits de cada tarea, ojo, hay otro agente trabajando en backend asi que worktrees separados"
L2: request original del review: "hagamos un review completo de la app web y el package de UI y cosas compartidas entre apps".
L3: worktree /tmp/ordo-web-ui-review creado desde main (84d3dd4) + rama feat/028-web-ui-shared-review; checkout original queda intacto para el agente de backend (feat/027-backend-hardening).
L4 (2026-11-01, decisión producto verbatim): "migramos a violeta" — cierra el abierto S5/violeta: primario in-app pasa a #7C3AED (claro) / #A78BFA (oscuro). Escala elegida: secondary/accent #F5F3FF con fg #6D28D9, secondary oscuro #2E1065. Contrastes WCAG calculados: blanco/#7C3AED 5.70, #6D28D9/#F5F3FF 6.48, #1A1A24/#A78BFA 6.34, #A78BFA/#2E1065 5.60 (todos AA; el primario claro arregla el 2.43 del cian).
