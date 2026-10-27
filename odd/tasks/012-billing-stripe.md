# ODD: Facturación real con Stripe + planes enforced

Objective: convertir la promesa comercial en realidad — checkout, portal de cliente, webhooks de Stripe y enforcement honesto de los límites del plan contratado.
Branch: `feature/billing-stripe` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; backend → webhooks → enforcement → UI; cobertura ≥70%.
Test runner: Jest (backend). Stripe CLI / test mode solo autorizado por padre; por defecto mocks.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/promises-audit.md` (§B precios: tres tablas contradictorias + checklist corrección #2)
- `docs/vision/product-vision.md` (decisión cerrada 2: una sola tabla, marcada beta)
- `packages/db/prisma/schema.prisma:1243` (modelo `Subscription` huérfano con `stripeCustomerId`)
- `apps/webpage/src/app/[locale]/pricing/page.tsx` (tabla pública actual: Free $0 / Pro $9 / Team $19 / Enterprise Custom)
- `apps/webpage/src/app/[locale]/roadmap/page.tsx:32` (`voteWeights` FREE=1/PRO=3/TEAM=5/ENTERPRISE=10 — depende del plan real)
- `odd/tasks/008-enterprise-trust.md` (leer hasta `## Log` — DPA/política que el checkout debe enlazar)

## Specs

S1. **Tabla única y honesta**: una sola definición de planes/límites (código como fuente de verdad: `planId → {límites}`), usada por pricing page, enforcement y votos; marcada "beta/sujeto a cambio" hasta estabilizar; los números finales los define negocio antes de T1 — si no están, T1 queda `blocked`. Check: `grep` de precios viejos contradictorios ($12 Team, 50 tasks) vacío en superficies públicas.
S2. **Checkout + portal**: Stripe Checkout (suscripción + cambio de plan + cancelación) y Customer Portal (facturas, método de pago); flujo completo en test mode; precios en USD + EUR/ARS si negocio lo pide (definir en T1). Check: suscribir → pagar (tarjeta test) → ver factura → cancelar, todo end-to-end en test mode.
S3. **Webhooks Stripe**: endpoint firmado (`checkout.completed`, `invoice.paid|failed`, `subscription.updated|deleted`, `trial_ending`); idempotencia por `event.id`; reintentos seguros; estado `Subscription` siempre consistente con Stripe. Check: reenviar mismo evento 3× → 1 solo efecto; `invoice.failed` → estado `past_due` + aviso al usuario.
S4. **Enforcement por plan**: límites enforced en backend (workspaces, proyectos, tareas activas, storage, seats, features IA/avanzadas por plan); error 402/403 con mensaje accionable + upsell ("llegaste al límite de X en Free — [Ver planes]"); `voteWeights` lee el plan real. Nunca bloquear lectura de datos existentes por falta de pago (bloquear creación/modificación, jamás lectura/export). Check: matriz plan×límite en tests; cuenta `past_due` sigue leyendo y exportando.
S5. **Trial + gracia honestos**: trial definido (días + qué incluye), recordatorio antes de cobro, gracia post-cancelación con datos accesibles (plazo definido por negocio); todo visible en UI antes de pagar. Check: timeline trial→cobro→cancelación→gracia verificado en test mode con reloj simulado.
S6. **UI de billing**: página de planes (lee tabla única S1), estado de suscripción, facturas (portal), cambio/cancelación, uso actual vs límites. Check: usuario entiende su plan, uso y próxima factura sin contactar soporte (prueba humana).

Fuera de alcance: SSO (008), teams multi-seat avanzado (roles básicos sí via workspaces), monedas extra no pedidas, facturación electrónica fiscal por país (futuro).

## Allowed edit surfaces

- `apps/backend/src/billing/` (nuevo módulo: planes, checkout, portal, webhooks Stripe, enforcement guards, spec)
- `packages/db/prisma/schema.prisma` (+ 1 migración: extender `Subscription` — estado, trial, períodos, uso)
- `apps/backend/src/common/` (solo guard/decorador de límites reutilizable, si aplica)
- `apps/web/src/` (UI billing: planes, suscripción, uso)
- `apps/webpage/src/app/[locale]/pricing/` (leer tabla única; marcar beta)
- `packages/i18n/src/locales/*.json` (solo claves billing)
- `docs/guides/billing.md` (nuevo: planes, límites, webhooks, runbook)

## Verification

- `cd apps/backend && npx jest src/billing --runInBand` → verde (Stripe mockeado; matriz plan×límite incluida)
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- E2E test mode (solo padre, con Stripe CLI): suscribir→pagar→facturar→cancelar observados
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Tabla única de planes (bloqueada hasta números de negocio) + limpieza contradicciones | inline | pending | blocked? |
| T2 | S2–S3 | Checkout + portal + webhooks idempotentes | delegada | pending | — |
| T3 | S4 | Enforcement por plan + matriz tests + `voteWeights` real | delegada | pending | — |
| T4 | S5 | Trial + recordatorios + gracia | inline | pending | — |
| T5 | S6 | UI billing + `billing.md` | inline | pending | — |

## Log

L1. "planeamos la mejor app que se pueda tener en el mundo" + corrección de promesas comerciales sin backend (mensaje y auditoría del 2026-10-18; este doc convierte pricing en realidad).
L2. Números de negocio cerrados con el owner (2026-10-26, registrados en #240): Pro $9/mes o $81/año; Team $19/seat/mes o $171/seat/año (anual −25%); Free $0; Enterprise custom; solo USD. IA incluida en Pro/Team como recarga mensual de créditos del ledger existente (Pro 500/mes, Team 500/seat/mes, Free solo trial único de 100); packs aparte (~$10/1.000, ancla Notion) diferidos hasta GA de agentes externos. T1 extendido: `annualPriceUsd` + `aiCreditsPerMonth` en la tabla única.
L3. **T2 completa (2026-10-27)**: checkout + portal + webhooks idempotentes via Feature Branch Chain — PRs #416 (db: campos de billing + ledger `BillingWebhookEvent`), #417 (checkout/portal/estado, SDK stripe@23), #418 (webhook firmado, idempotencia aplicar→registrar, `invoice.payment_failed`→`PAST_DUE`) y #415 independiente (tabla única anual+créditos + `docs/guides/billing.md`). Los 4 con revisión independiente: #418 exigió cambios (P2: fallback de metadatos con casing incorrecto rompía Prisma) — corregido y re-aprobado; el resto APPROVE con P3s (algunos aplicados: `@Max(999)` en seats; otros diferidos: test del branch 502, idempotencia de `ensureStripeCustomer`, purga del ledger y orden de eventos → T4/runbook). Integración en tracker #414 verificada junto al trabajo paralelo de conectores (#404-#413): 136 suites / 1421 tests, tsc 0. **Pendiente**: e2e test-mode (`stripe listen` → tarjeta 4242 → factura → reenvío 3× → cancelar) tras el deploy; endpoint de webhook en dashboard solo al ir a live. Siguiente: T3 (enforcement).
L4. **T3 completa (2026-10-27)**: enforcement por plan en creación (workspaces, proyectos por workspace del dueño, storage de adjuntos) vía `PlanLimitsService` (402 con payload `PLAN_LIMIT_REACHED` + upgradeUrl); plan efectivo FREE para filas INCOMPLETE/INCOMPLETE_EXPIRED, PAST_DUE/CANCELED mantienen plan (gracia T4); la tabla única se movió a `@ordo-todo/config` y los pesos de voto del roadmap salen de ella (borrado el duplicado `calculateVoteWeight` de core). Matriz plan×límite en `plan-limits.service.spec.ts`. Fuera de alcance consciente: seats, downgrade post-gracia (T4).
