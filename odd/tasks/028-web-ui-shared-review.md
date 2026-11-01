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
- [ ] T7 (deferido, S5) recolor violeta→acción semántica en páginas — route: pendiente decisión producto — status: blocked
- [ ] T8 (deferido, S5) eliminar ui-shared/validations o absorberlos — route: pendiente decisión — status: blocked
- [ ] T9 (deferido, S5) unificar cliente HTTP y sync-store — route: pendiente diseño — status: blocked
- [ ] T10 (deferido) Switch doble-toggle, cn/cva x3, paridad tokens, CI gates, CSP/HSTS — route: próximos commits — status: pending

## Log

L1 (2026-11-01, request verbatim que autoriza este trabajo): "haga todo que puedas hacer, haciendo commits de cada tarea, ojo, hay otro agente trabajando en backend asi que worktrees separados"
L2: request original del review: "hagamos un review completo de la app web y el package de UI y cosas compartidas entre apps".
L3: worktree /tmp/ordo-web-ui-review creado desde main (84d3dd4) + rama feat/028-web-ui-shared-review; checkout original queda intacto para el agente de backend (feat/027-backend-hardening).
