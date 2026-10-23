# Auditoría promesa vs realidad

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo

## 📋 Índice rápido

- [Cómo leer este documento](#cómo-leer-este-documento)
- [A. Narrativa: productividad general vs Creators OS](#a-narrativa-productividad-general-vs-creators-os)
- [B. Precios y planes](#b-precios-y-planes)
- [C. Seguridad y cumplimiento](#c-seguridad-y-cumplimiento)
- [D. Versiones y changelog](#d-versiones-y-changelog)
- [E. Sync, offline y realtime](#e-sync-offline-y-realtime)
- [F. Calendario, Zapier, voz, SSO, API](#f-calendario-zapier-voz-sso-api)
- [G. Prueba social y datos de contacto](#g-prueba-social-y-datos-de-contacto)
- [H. Docs rotas y atajos inconsistentes](#h-docs-rotas-y-atajos-inconsistentes)
- [I. Lo que existe y no se publicita](#i-lo-que-existe-y-no-se-publicita)
- [Correcciones obligatorias](#correcciones-obligatorias)
- [Referencias](#referencias)

---

## Cómo leer este documento

Cada sección sigue el formato: **qué se promete** (con archivo y cita) → **qué existe realmente** (con archivo y línea) → **veredicto** (✅ honesto / ⚠️ parcial / ❌ falso) → **corrección**.

Estados:

- ✅ **Existe** — hay backend + UI funcional.
- ⚠️ **Parcial** — existe a medias, en una sola plataforma, o como stub.
- ❌ **No existe** — sin módulo, endpoint ni UI.

Nada de lo marcado ❌ puede aparecer en marketing o docs nuevas como disponible. Ver decisión cerrada 3 en [product-vision.md](./product-vision.md).

## A. Narrativa: productividad general vs Creators OS

**Se promete (dos narrativas contradictorias)**:

- Productividad general: `apps/webpage/src/messages/es.json` — "Domina Tu Tiempo", Pomodoro, Agenda IA, multiplataforma.
- Creators OS (hardcodeado, ignora traducciones): `apps/webpage/src/components/hero.tsx` — "Ordo: The Creator's OS", "Operating System for chaotic content creators", "Turn your scattered ideas into a published content pipeline", prueba social `2,500+`; `apps/webpage/src/components/features.tsx` (con comentario `Overriding translations`) — Content Pipeline, Frictionless Capture, Remix Engine, Idea Graveyard, Consistency Score, Social Previews.

**Existe realmente**:

- ❌ **Nada de creators**: no hay `apps/backend/src/content*`, ni `pipeline/page.tsx`, ni `ContentPiece/ContentStatus` en código. Spec sin implementar: `docs/features/content-pipeline.md` (551 líneas). Docs linkeados que no existen: `frictionless-capture.md`, `social-previews.md`, `consistency-score.md`, `remix-engine.md`, `ai-copilot.md` (solo existe `content-pipeline.md` en `docs/features/`).
- ✅ La app real es gestión de tareas general (ver [product-vision.md](./product-vision.md)).

**Veredicto**: ❌ La landing vende como presente un producto que no existe.


- ✅ (oct 2026, ODD 019 T4b, PR #361) los últimos residuos técnicos de Creators OS en `ordo-todo` (tablas y enums huérfanos en la BD, `ProjectType`/`Task.contentStatus`, componentes `content/` de los paquetes UI, selector de arquetipos en los diálogos) se eliminaron con migración `20261023_drop_creator_os` verificada por replay; la narrativa creators vive solo en el repo `ordo-creators`.

## B. Precios y planes

**Se promete (tres tablas contradictorias)**:

1. Webpage `apps/webpage/src/app/[locale]/pricing/page.tsx`: Free $0 (unlimited tasks, 3 projects, Pomodoro, basic analytics, mobile access, 7-day history) · Pro $9/mo (unlimited projects, AI scheduling, advanced analytics, calendar integrations, recurring, custom themes, priority support) · Team **$19**/user/mo (+ workspaces, shared, team analytics, admin, SSO/SAML, API access, dedicated support) · Enterprise Custom (+ unlimited users, custom integrations, data residency, SLA, manager, onboarding, white-label). Garantía 30 días, "sin costos ocultos, cancela cuando quieras".
2. `docs/design/PRD.md` §11: Free $0 (1 workspace, 50 active tasks, basic AI, 100MB, 2 devices) · Pro $9/mo (unlimited, full AI, 10GB, all devices, integrations) · Team **$12**/user/mo (+ collab, roles, analytics, SSO) · Enterprise Custom (+ self-hosted, SLA 24/7, custom integrations, data residency).
3. Seeds FAQ (`seed-marketing.sql`, `seed-faq-changelog.sql`): variantes de Free (unlimited tasks + 3 projects vs basic projects), métodos de pago (Visa/MC/Amex, PayPal, transferencia, invoice enterprise), cancelación anytime, sin refunds parciales, money-back 30 días.

**Existe realmente**:

- ❌ Sin módulo de billing/Stripe/pagos en `apps/backend/src/`. Solo el modelo `Subscription` (con campos `stripeCustomerId`, `stripeSubscriptionId`) en `packages/db/prisma/schema.prisma:1243`. Cero enforcement de límites.
- ⚠️ De lo listado como Pro: recurrencia ✅, IA ⚠️ (requiere `GEMINI_API_KEY`), calendar integrations ❌ (ver §F), custom themes ❌ (solo light/dark/auto).
- ⚠️/❌ De lo listado como Team: workspaces/roles/audit/workload ✅, **SSO/SAML ❌** (solo OAuth Google/GitHub), **API pública ❌** (solo `ADMIN_API_KEY` interna).
- ✅ Colaboración multiusuario verificada en código y e2e (ODD 018, oct 2026, `odd/tasks/018-collab-hardening.md`): compartir workspace con invitación por email (token hasheado, canje ligado al email invitado, cancelable), roles OWNER/ADMIN/MEMBER/VIEWER gestionables desde la UI, asignación de tareas desde la UI con notificación, menciones fiables por ID de usuario con chips y navegación desde notificaciones (web + autocomplete en desktop + Slack + icono móvil), salir del workspace, audit log. Queda fuera: transferencia de ownership, SSO, API pública, team analytics agregado.
- ❌ Enterprise: sin data residency, SLA, self-hosted para clientes ni white-label (solo `deploy/` interno + docker-compose).
- ✅ Voto roadmap ponderado FREE=1/PRO=3/TEAM=5/ENTERPRISE=10 (modelo `RoadmapVote` + `apps/webpage` UI).
- ✅ Registro por invitación y panel de admin verificados en código y e2e (ODD 019, oct 2026, `odd/tasks/019-admin-invite-codes.md`): registro cerrado por defecto (`REGISTRATION_MODE=invite-only`) con códigos `ORDO-XXXX-XXXX` creados desde un panel `/admin` restringido por `ADMIN_EMAILS` (default `tiagofur@gmail.com`), con usos máximos/expiración y canje auditado; bloqueo de usuarios efectivo por cualquier vía (password, OAuth nuevo, PAT y tokens MCP); "regalar Pro" sobre la fila `Subscription` (sin Stripe: sigue sin existir cobro real); métricas agregadas y datos de usuario sin acceso a su contenido. Sigue ❌: Stripe/cobro, límites por plan, promo codes, SSO, multi-admin.

**Veredicto**: ❌ Promesa comercial sin backend de cobro y con tres versiones contradictorias.

**Corrección**: una sola tabla, marcada beta/"sujeto a cambio"; no documentar límites ni garantías hasta implementarlos. El billing real es roadmap. → `odd/tasks/013-marketing-docs-cleanup.md` S4, `odd/tasks/008-enterprise-trust.md`.

## C. Seguridad y cumplimiento

**Se promete**:

- Landing `apps/webpage/src/messages/en.json`: *"Your data stays yours. **End-to-end encryption** and no data selling. Ever."* (igual en `es.json`: "Encriptación de extremo a extremo").
- FAQ seeds (`seed-production.sql`, `seed-marketing.sql`): AES-256 en reposo, TLS 1.3 en tránsito, datacenters SOC 2, bank-level, backups, export JSON/CSV anytime.

**Existe realmente**:

- ✅ JWT httpOnly + refresh con rotación, blacklist Redis, OAuth Google/GitHub, bcrypt, rate limiting, CSRF, validación class-validator, autorización workspace-scoped, uploads validados, security headers, soft deletes, audit logs (`apps/backend/src/auth/`, `users/`).
- ❌ **E2E no existe** (falso, peligroso). AES-256 en reposo, SOC 2 y backups garantizados no evidenciados en código revisado.
- ⚠️ Export: solo JSON (`POST /users/me/export` en `users.controller.ts`); CSV ❌. Borrado de cuenta ✅. Consentimiento granular y gracia de 30 días no verificados.
- ❌ 2FA: explícito "Próximamente" (`packages/i18n/src/locales/es.json:1916`).
- ⚠️ IA y privacidad: `AIFeatures.ai_statement` dice "respeta privacidad" pero el motor envía datos a Gemini externo (`GEMINI_API_KEY` en `env.validation.ts`); aclararlo, no afirmarlo en seco.

**Veredicto**: ❌ E2E es falso y debe corregirse con urgencia. Resto: parcial.

**Corrección**: quitar E2E/SOC2/AES-256 de toda superficie hasta evidenciarlos. Política de datos honesta (qué se envía a qué proveedor, retención, no-entrenamiento). → `odd/tasks/013-marketing-docs-cleanup.md` S5–S6, `odd/tasks/008-enterprise-trust.md`.

## D. Versiones y changelog

**Se promete**:

- `README.md:292`: `Version: 0.2.0-beta`.
- `apps/desktop/CHANGELOG.md`: `[1.0.0] - 2025-12-04` "Primera Versión Estable".
- `docs/design/PRD.md:5-7`: v2.0, "Production (Web), Beta (Mobile, Desktop)", marzo 2026.
- Seeds changelog: v2.5.0 AI suggestions, v2.4.2 keyboard nav, v2.4.1 calendar sync fix, v2.4.0 burnout alerts, v2.3.5 "3x listas / 40% memoria" (dic 2024); `seed-marketing` más viejo (v2.1.0… v2.0.0 "Launch redesign + AI + habit tracking").

**Existe realmente**: cuatro versiones de la verdad. Burnout/IA/hábitos sí existen hoy, pero el "two-way fix" de v2.4.1 contradice la ausencia de sync bidireccional (ver §F) y las métricas de perf no son verificables. Seeds con fechas viejas y contenido ficticio.

**Veredicto**: ❌ Versiones inconsistentes; changelog publicado parcialmente ficticio.

**Corrección**: una sola versión de la verdad + limpieza de seeds antes de publicar. → `odd/tasks/013-marketing-docs-cleanup.md` S7–S8.

## E. Sync, offline y realtime

**Se promete**: "real-time sync" multiplataforma (landing + FAQ + README), "offline-first" (`apps/mobile/README_API.md:14`), PWA instalable con cola y resolución de conflictos (PRD §9). En contradicción: mobile offline "coming soon" (`README_API.md:161`, FAQ) y backend README dice WebSocket "planned".

**Existe realmente** (por plataforma, honesto):

- ⚠️ **Web**: `apps/web/src/lib/offline-storage.ts`, `sync-store.ts`, `conflict-resolver.ts`, indicadores de sync — lo más completo; shortcuts/push/SW completos no verificados.
- ✅ **Desktop**: SQLite + sync engine + last-write-wins + indicador 🟢🟡🔴 (ver `apps/desktop/USER_GUIDE.md`).
- ⚠️ **Mobile**: `AsyncStorage` + `NetInfo`, push + socket (`use-notifications-socket.ts`), sin cola de sync equivalente visible.
- ⚠️ **Realtime**: gateway Socket.IO con rooms/presencia (`collaboration.gateway.ts`) + polling REST; colaboración = presencia + comentarios, no edición concurrente (sin Yjs/Liveblocks).

**Veredicto**: ⚠️ Documentar por plataforma. Nunca "real-time sync" genérico.

**Corrección**: matriz de paridad honesta web/desktop/móvil en docs nuevas. → `odd/tasks/013-marketing-docs-cleanup.md` S9.

## F. Calendario, Zapier, voz, SSO, API

Prometidos en alguna superficie (roadmap seeds, changelog, pricing, FAQ), estado real:

| Promesa | Superficie | Estado |
|---|---|---|
| Calendar two-way sync Google/Outlook/Apple | Roadmap `PLANNED`, changelog v2.4.1 "Fixed", pricing Pro | ⚠️ Solo feed `.ics` unidireccional público (`tasks.controller.ts:212` `export/calendar.ics`) + stub `connectIntegration`. Sin OAuth calendar ni sync bidireccional |
| Zapier & Make | Roadmap `PLANNED` | ❌ Sin webhooks, sin API pública, sin Zapier |
| Voice input | Roadmap `CONSIDERING`, `features.tsx` creators | ❌ Sin speech-to-text; solo transcripción manual pegada en meetings |
| SSO/SAML | Pricing Team/Enterprise, PRD | ❌ Solo OAuth Google/GitHub |
| API access | Pricing Team/Enterprise | ❌ Solo `ADMIN_API_KEY` interna (`auth-security.controller.ts:36`) |
| Custom themes | Roadmap `CONSIDERING`, pricing Pro | ⚠️ Solo Claro/Oscuro/Auto + tokens `packages/styles` |
| Export CSV | FAQ | ❌ Solo JSON |
| Integraciones en perfil | `Profile/integrations/comingSoon` (`es.json:1952`) | ❌ Stub |
| Analíticas semanales detalladas | `Analytics/weekly/comingSoon` (`es.json:630`) | ⚠️ Backend analytics existe; esa vista marcada próximamente |
| Time tracking UI | `TaskDetailView/time/comingSoon` (`es.json:1560`) | ⚠️ Timers backend existen; esa vista marcada próximamente |

**Corrección**: todo lo ❌ va a roadmap/ODD, no a features. Calendario → `odd/tasks/010-calendar-sync.md`; Zapier/API → `odd/tasks/009-public-api-webhooks.md`; SSO → `odd/tasks/008-enterprise-trust.md`; resto → roadmap futuro.

## G. Prueba social y datos de contacto

**Se promete**: "2,500+ usuarios productivos" (`hero.tsx`), "amado por miles", 3 testimonios con nombres genéricos (María García, Carlos Ruiz, Ana Martínez en `messages/es.json`), dominios `ordo-todo.com` / `ordotodo.app/register`, email `support@ordo-todo.com`.

**Existe realmente**: ❌ no verificable. Nombres hardcodeados sin fuente; dominios/email no verificados en este repo.

**Veredicto**: ❌ No repetir prueba social sin datos reales.

**Corrección**: retirar o sustituir por datos verificables; verificar dominios y email. → `odd/tasks/013-marketing-docs-cleanup.md` S10.

## H. Docs rotas y atajos inconsistentes

**Docs rotas**: `README.md` linkea `docs/USER_GUIDE.md`, `docs/design/ARCHITECTURE.md`, `docs/ROADMAP.md`, `COMPONENT_GUIDELINES`, `PROJECT_ORGANIZATION` — no existen en esas rutas. Dice `webpage/` Astro 5, real es Next.js (`apps/webpage`). `apps/mobile/README.md` y `apps/webpage/README.md` son boilerplate. Desktop solo ES/EN (falta PT-BR) vs resto trilingüe.

**Atajos inconsistentes**: la captura rápida se documenta como `N`, `Cmd/Ctrl+N` y `Ctrl+K` según la superficie; `parse-task` IA existe pero sin Quick-Add global consistente. Prioridades: blog dice P1–P4, reales son `LOW/MEDIUM/HIGH/URGENT`.

**Corrección**: unificar en docs nuevas; reparar links README (una ruta canónica por doc); completar READMEs boilerplate. → `odd/tasks/013-marketing-docs-cleanup.md` S11–S12, captura real en `odd/tasks/007-omnipresent-capture.md`.

> **Estado atajos (ODD 007 C3)**: unificado y verificado contra código — mapa canónico en `docs/guides/shortcuts.md`.

## I. Lo que existe y no se publicita

Todo ✅ verificado en código, ausente o débil en landing. Las docs nuevas DEBEN incluirlo ("no prometer de menos"):

- **Meetings IA**: `POST meetings/analyze|extract-actions|summary|convert-to-tasks|save|quick-analyze` + CRUD (`meetings.controller.ts`). Ojo: input = pegar transcripción manual, no grabación automática.
- **Workload de equipo**: `team-workload.controller.ts` (`workspace/:id`, `member/:id`, `me`, `suggestions`) + `workload/page.tsx`.
- **Wellbeing**: `GET ai/wellbeing`, `burnout/*` + `wellbeing/page.tsx`.
- **Smart search**: `GET search/`, `suggestions`, `ask`, `quick` (`search.controller.ts`).
- **Chat coach**: `chat/conversations/*`, `chat/insights` (`apps/backend/src/chat/`).
- **Gamificación**: `gamification/me` (XP, niveles, logros).
- **Sistema**: plantillas, custom fields, notas canvas, papelera unificada, tags por workspace, audit logs, invitaciones 7 días, roles OWNER/ADMIN/MEMBER/VIEWER, archivado, share público, i18n trilingüe, plataforma de contenido pública (blog/changelog/roadmap/FAQ/KB/newsletter/contact).
- **Focus audio**: `ambient-synthesizer.ts` + `FocusMode`.

## Correcciones obligatorias

Checklist ejecutable (dueño: `odd/tasks/013-marketing-docs-cleanup.md`):

1. [ ] Retirar/marcar Creators OS en `hero.tsx`, `features.tsx` (+ spec `content-pipeline.md` marcado visión).
2. [ ] Una sola tabla de precios, marcada beta; quitar garantías/límites no enforced.
3. [ ] Quitar E2E/SOC2/AES-256 de landing + FAQ; política de datos honesta.
4. [ ] Una sola versión + seeds limpiados (changelog ficticio fuera).
5. [ ] Matriz de paridad por plataforma (web/desktop/móvil) en lugar de "real-time sync" genérico.
6. [ ] Todo ❌ movido a roadmap/ODD, fuera de features.
7. [ ] Prueba social retirada o verificada; dominios/email verificados.
8. [ ] Links README reparados; READMEs boilerplate completados. Atajos unificados en `docs/guides/shortcuts.md` (ODD 007 C3 — solo esa parte).

## 📚 Referencias

- [product-vision.md](./product-vision.md) · [competitive-analysis.md](./competitive-analysis.md) · [agent-first-strategy.md](./agent-first-strategy.md)
- [Roadmap](../planning/roadmap.md) · [Tareas ODD](../../odd/tasks/) (dueño: `013-marketing-docs-cleanup.md`)
