# ODD: Sitio público + soporte completos (desbloquea 240-T1)

Objective: renovar y completar el sitio público (`apps/webpage`) — landing, pricing, soporte, tutoriales y páginas de confianza — y cerrar los números de negocio que hoy bloquean 012-T1 (issue #240).
Branch: `feature/public-site-support` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; P0 primero (números + pricing + seguridad + contacto) para desbloquear #240-T1; P1/P2 después en paralelo a #240.
Test runner: `next build` + `tsc` (webpage). Sin Jest: cambios de contenido/maquetación no testeables por unidad; verificación por build + auditoría de honestidad + prueba humana.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/product-vision.md` (posicionamiento, decisiones cerradas 1–4, no-metas)
- `docs/vision/promises-audit.md` (qué se puede afirmar y qué no)
- `odd/tasks/012-billing-stripe.md` (leer hasta `## Log` — S1/S6 consumen los números que aquí se cierran)
- `odd/tasks/008-enterprise-trust.md` (leer hasta `## Log` — DPA/política que privacy/terms/security enlazan)
- `apps/webpage/src/app/[locale]/page.tsx` + `components/hero.tsx` (landing actual)
- `apps/webpage/src/app/[locale]/pricing/page.tsx` (tabla beta actual)
- `apps/webpage/src/app/[locale]/contact/page.tsx` (⚠️ envío simulado con `setTimeout`, no llama al backend)
- `apps/webpage/src/app/[locale]/guide/page.tsx` + `faq/page.tsx` (Read actual)
- `apps/webpage/src/components/navigation.tsx` + `footer.tsx` (nav actual, sin pricing)
- `apps/backend/src/contact/contact.controller.ts` (endpoint real que el formulario debe usar)

## Specs

S1. **Números de negocio cerrados + tabla única (P0, desbloquea 240-T1)**: registrar en la issue la decisión de negocio — planes, precios, límites por plan, trial (días + qué incluye), monedas (USD + EUR/ARS?), plan Enterprise sí/no — y limpiar contradicciones ($12 Team, 50 tasks) de superficies públicas. `apps/webpage/.../pricing/` lee la misma definición que 012-S1 usará como fuente de verdad; marcada beta hasta que billing sea real. Check: decisión escrita en la issue con fecha + `grep` de precios viejos vacío en superficies públicas.
S2. **Páginas Persuade (P1, `/compare` P2)**: renovar `/` (narrativa agent-first real: conectar tu agente en <60s, persona completa), `/pricing` (números S1, badge beta), `/about` (quitar placeholder); crear `/features` (capacidades verificadas contra `main`), `/agents` ("usa Ordo desde tu agente" → `/guide/connect`), `/apps` (web/desktop/móvil + paridad honesta); P2: `/compare` (comparativa honesta vs Todoist/Notion/Motion). Nav añade pricing; footer enlaza nuevas rutas. Heredar el sistema visual existente (cyan `#06B6D4`, tarjetas, framer-motion) — extensión, no rediseño. Check: build verde + las 3 locales + auditoría: cero afirmaciones que `promises-audit.md` prohíba.
S3. **Hub de soporte + FAQ (P1)**: crear `/support` (buscador + temas + contacto + enlace a estado); renovar `/faq` con categorías Billing/Soporte/Agentes (contenido CMS existente + entradas nuevas donde falte). Check: prueba humana — 5 dudas frecuentes se resuelven sin escribir a soporte.
S4. **Tutoriales (P1)**: renovar índice `/guide` (progresivo por niveles, con tiempo estimado); nuevos tutoriales: hábitos, pomodoro, captura + Cmd+K, calendario, Slack, agente propio, auto-scheduling, ritual diario. Cada tutorial describe solo lo que existe en `main` (regla de honestidad; lo futuro se marca visión o no se publica). Check: cada tutorial verificado contra código (ruta de backend citada en revisión).
S5. **Confianza (P0)**: crear `/security` (política de datos honesta: sin E2E/SOC2/AES-256 hasta evidenciarlo; el checkout de #240 la enlaza); revisar `/privacy` + `/terms` para billing + DPA (008). Check: sin claims prohibidos por `promises-audit.md`.
S6. **Contacto real (P0)**: `/contact` llama al endpoint real de `apps/backend/src/contact/` end-to-end, o se retira el formulario y se deja email + enlace a `/support`. Nada de envíos simulados. Check: envío observado end-to-end (o formulario retirado + alternativa visible).
S7. **Estado mínimo (P2)**: crear `/status` con estado honesto (manual o health check del backend; sin uptime inventado). Check: la página refleja estado real, no 100% ficticio.

Fuera de alcance: la app (`apps/web/`), cambios de backend salvo verificación de lectura, rediseño visual total, contenido "Creators OS" nuevo, SSO (008), cobro real (012/#240).

## Allowed edit surfaces

- `apps/webpage/` (páginas, componentes, `src/messages/*.json`, estilos, `package.json` solo si T0 lo exige para reparar el build)
- `PRODUCT.md` (solo T0: init de producto con impeccable; verdad de producto, sin mundo visual)
- `docs/planning/roadmap.md` (solo fila 017)
- `odd/tasks/017-public-site-support.md` (este doc: estados de T# + `## Log`)

## Verification

- `cd apps/webpage && npm run build` → verde (T0 repara antes si sigue roto en main: faltaban `tailwindcss-animate` + `react-is`)
- `cd apps/webpage && npx tsc --noEmit` → 0 errores
- `grep -rn '\$12\|50 tasks' apps/webpage/src --include='*.tsx' --include='*.json' | grep -vi test` → vacío
- `grep -rni 'end-to-end\|E2E\|SOC2\|SOC 2\|AES-256' apps/webpage/src` → vacío (salvo negación explícita auditada)
- Prueba humana S3 (5 dudas resueltas sin soporte) + S6 (contacto end-to-end observado)
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T0 | — | Init producto (`PRODUCT.md` via impeccable init) + build webpage verde | inline | done | `apps/webpage/PRODUCT.md`; build verde sin reparar (deps ya presentes — memoria webpage-build-broken-main obsoleta para este checkout) |
| T1 | S1 | Decisión de negocio registrada + tabla única + limpieza contradicciones (desbloquea 240-T1) | inline | done | ver commit feat(017-t1) |
| T2 | S2 | Persuade: landing, pricing, about, features, agents, apps (+compare P2) | delegada | pending | — |
| T3 | S3 | Hub `/support` + FAQ renovado | delegada | pending | — |
| T4 | S4 | Tutoriales: índice + 8 nuevos verificados contra código | delegada | pending | — |
| T5 | S5–S6 | Confianza (security, privacy, terms) + contacto real | inline | done | ver commit feat(017-t5) |
| T6 | S7 | Status mínimo + cierre (nav/footer final, auditoría honestidad) | inline | pending | — |

## Log

L1. "necesitamos empezar la issues #240, pero tambien necesitamos poner un landingpage, pagina de soporte, tutoriales, etc... pero esto en otro issue que antes de implementar el 240 lo crearemos, use la skill de $impeccable para ayudar a planear todas paginas que necesitamos para la landing page, help, etc..." (2026-10-21; brief shape aprobado mismo día: renovar+completar, evaluadores primero, esta issue cierra los números que bloquean 240-T1).
L2. Decisión de negocio registrada 2026-10-21 (#328, comentario + aviso en #240): Free $0 (tareas ilimitadas, 3 proyectos, 1 workspace, 100MB, sin IA avanzada) / Pro $9 (proyectos ilimitados, 3 workspaces, 10GB, IA completa) / Team $19 usuario/mes mín 2 (todo Pro + equipo, 100GB) / Enterprise custom (SSO, DPA, manager, onboarding); trial 14 días Pro sin tarjeta; gracia 14 días; solo USD; lectura/export nunca se bloquean. T1 implementado inline: `apps/webpage/src/lib/plans.ts` (fuente única) + pricing la consume + trial/gracia + 18 claves i18n ×3. Evidencia: tsc 0, eslint 0, build verde, greps $12/50-tasks/E2E-SOC2 vacíos, paridad limits OK. 240-T1 desbloqueado.
L3. Revisor #329 REQUEST CHANGES → fix round inline (2026-10-22): B1 SSO/DPA a "(planned)" con claves i18n ×3; B2 Team workspaces 3 (hereda Pro, aclarado en #328); B3 Enterprise storage null→"Custom" (aclarado en #328); nits 1/4/6/7 (18 claves, Math.round, nota USD, gracia con baja a Free); nits 2/3/5 diferidos a T2 (extras EN-only, TRIAL.plan/requiresCard/advancedAi sin consumo, assertNever). Evidencia: tsc 0, eslint 0, build 0, paridad Pricing 40/40/40, greps vacíos. Re-review APPROVE; PR #329 MERGED en main (`3645ed5f`). 240-T1 formalmente desbloqueado (cierre en #328 y #240).
L5. T5 implementado inline (2026-10-22): `/security` nueva (auth/data/AI/billing/planned + nota de no-claims) + privacy (ai_data, billing) + terms (billing, dpa) + `contact_link` i18n ×3 + `/contact` llama a `submitContactForm` real con estado de error + footer enlaza `/security` (+warning pre-existente `Mail` corregido). Evidencia: tsc 0, eslint 0, build 0 (ruta /security generada), paridad Security 17/Privacy 18/Terms 18/Contact 16/Footer 15, envío simulado eliminado, claims sensibles solo en negación explícita. Prueba humana S6 (envío end-to-end observado) pendiente.
