# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Profesionales y equipos** (primarios): gestionan su día completo en la app — captura de tareas, proyectos Kanban, calendario/tiempo (Pomodoro), hábitos, OKRs y notas. Llegan desde la landing (webpage) y prueban con límites de trial.
- **Consumidores agénticos** (secundarios, sin UI): agentes externos (ChatGPT, Claude) operan la cuenta del usuario vía OAuth + MCP con los mismos permisos. No ven la interfaz, pero condicionan permisos, scopes y honestidad de los datos que la UI muestra.
- **Equipos multi-tenant** (transversal): workspaces con roles (OWNER/ADMIN/MEMBER/VIEWER), invitaciones, asignaciones, comentarios y menciones.

## Product Purpose

Ordo Todo es la app de productividad todo-en-uno que une **ejecución** (tareas, proyectos, calendario, time-tracking, reuniones) con **persona completa** (hábitos, foco, bienestar/burnout, OKRs) y se deja **operar por agentes externos** con un clic. Este registro rige la web PWA (`apps/web`), la superficie principal del producto; desktop (Tauri) y móvil comparten el mismo sistema de tokens (`@ordo-todo/styles`) y componentes (`@ordo-todo/ui`).

Éxito (de `docs/vision/product-vision.md`): un usuario nuevo conecta su agente en <60 s; capturar una tarea con fecha y recurrencia por lenguaje natural toma <10 s; cero contradicciones entre marketing, docs y código; paridad cross-platform documentada y honesta.

## Positioning

El único todo-en-uno que une ejecución con persona completa y se conecta con un clic a los agentes que el usuario ya usa. Nadie ocupa ese lugar hoy: Motion/Reclaim no tienen hábitos ni bienestar; Notion no tiene tiempo real ni foco; Todoist no tiene IA profunda (ver `docs/vision/competitive-analysis.md`).

## Operating Context

- Monorepo Turborepo: web Next.js 16 + React 19 (PWA con offline IndexedDB y resolución de conflictos), backend NestJS con DDD/Clean Architecture, PostgreSQL 16 + pgvector vía Prisma (`packages/db`).
- Desarrollo: app en `localhost:3100`, API en `localhost:3200`, `npm run dev` (turbo).
- i18n next-intl con 3 locales obligatorios EN/ES/PT-BR (~2393 claves en paridad).
- Auth: email + OAuth Google/GitHub, JWT con rotación; OAuth consent propio para apps conectadas (ChatGPT, Claude vía MCP).
- IA: motor único Gemini hoy (chat, parse-task, decompose, sugerencias, wellbeing/burnout, informes); coach conversacional; reuniones por transcripción pegada.
- Billing Stripe en cuenta LIVE (planes $9/$19, trial de límites); enforcement T1-T3 en `main`, T4/T5 en curso.
- Colaboración: WebSockets (presencia, rooms), notificaciones smart con cron (vencimientos, planning diario, resumen semanal).
- Producción estable en VPS (Plesk) con deploys verdes vía GH Actions; desktop Tauri (macOS) y móvil Tauri comparten tokens y componentes con la web.

## Capabilities and Constraints

Existe hoy (verificado contra código 18-oct, `docs/vision/product-vision.md`): dashboard, tareas (CRUD, subtareas, dependencias, recurrencia, time-blocks, tags, comentarios, adjuntos, share por link, papelera, export .ics), proyectos + workflows + Kanban con columnas custom, Pomodoro/continuo con historial y stats, calendario, hábitos con rachas + gamificación XP/niveles/logros, OKRs vinculados a tareas, notas, insights/analíticas (heatmap, rachas, equipo), reuniones, coach IA, focus + audio ambiental, búsqueda con intención, settings (perfil, preferencias IA, apps conectadas, billing), workspaces multi-tenant, modo oscuro, PWA offline.

Restricciones durables:

- **Honestidad radical**: nada de E2E/SOC2/AES-256 ni métricas de usuarios; integraciones (Google Calendar, Slack, GitHub…) son stub — solo guardan la fila en BD; sin API pública con tokens de usuario; los precios se marcan beta hasta enforcement completo. Toda afirmación verificable contra `main` (`docs/vision/promises-audit.md` es la autoridad).
- Toda superficie nueva sale trilingüe (EN/ES/PT-BR) desde el día uno, sin textos en duro.
- Los agentes (MCP) comparten los mismos permisos que el usuario: la UI y la API no revelan datos que el token no autorice.

Abierto: migración del primario in-app de cian a violeta para paridad total con la marca (ver Brand Commitments).

## Brand Commitments

- Nombre: **Ordo Todo**.
- **BrandMark**: cuadrado morado `#AD46FF` con radio `rounded-2xl`, icono CheckSquare blanco (`stroke-[2.2]`) y sombra `#AD46FF/30` — presente en login, registro, authorize y como `themeColor` del viewport y favicon/apple-icon.
- **Primario semántico in-app**: cian `#06B6D4` (claro) / `#22D3EE` (oscuro) — estado real de `packages/styles/src/variables.css`, confirmado por el owner (30-oct-2026) como verdad a documentar.
- **Sitio público** (`apps/webpage`, decisión 25-oct-2026): primario violeta `#7C3AED`; allí "el cian deja de ser la marca". Esa decisión no revoca el cian in-app.
- **Abierto (owner, 30-oct-2026)**: posible migración futura del primario in-app a violeta `#7C3AED` para paridad de marca total. Hasta decidirse, DESIGN.md documenta el sistema actual y ningún PR cambia tokens por su cuenta.
- Tono: claro y directo, trilingüe.

## Evidence on Hand

- `docs/vision/product-vision.md` (meta, pilares, inventario auditado, decisiones cerradas), `competitive-analysis.md`, `agent-first-strategy.md`, `promises-audit.md` (promesa-vs-realidad A–I; nunca prometer nada marcado ❌).
- `.impeccable/critique/` — 35+ auditorías UX de páginas reales (tasks, calendar, dashboard, settings, insights, tags, habits, goals, meetings, timer, trash, workspaces; oct-2026).
- Conexión real owner ChatGPT↔Ordo operando contra datos vivos (26-oct); compatibilidad Claude (PR #413).
- Apps hermanas: desktop Tauri en `/Applications` (28-oct, build contra producción), APK móvil recompilado (30-oct).
- Ausencias que no fabricar: uptime, métricas de usuarios reales, testimonios, integraciones 1-click implementadas, E2E.

## Product Principles

1. **Simplicidad inteligente**: potencia con interfaz mínima; la amplitud (34 módulos) no puede sentirse abrumadora.
2. **Velocidad obsesiva**: captura en segundos, teclado primero, latencia predecible.
3. **Bienestar consciente**: burnout, energía y rituales como diferenciador defendible; la UI nunca empuja a más ruido del necesario.
4. **Honestidad radical**: solo lo verificable en `main` o marcado beta/visión; sin "próximamente" silenciosos.
5. **Paridad honesta cross-platform**: tokens y componentes compartidos; diferencias por plataforma documentadas, nunca ocultas.

## Accessibility & Inclusion

- Focus visible global: `outline-ring` en todo, `ring-[3px] ring-ring/50` en inputs y botones; navegación teclado primero.
- `prefers-reduced-motion` respetado globalmente (animaciones y transiciones a 0.01 ms) — `packages/styles/src/base.css`.
- Modo oscuro por clase `.dark` con `color-scheme` declarado y transición de tema 300 ms; ambos temas son ciudadanos de primera.
- i18n completa EN/ES/PT-BR: sin cadenas en duro en superficies nuevas.
- Sin estándar WCAG formal registrado todavía (abierto): no afirmar conformidad sin auditoría; mantener las prácticas anteriores como mínimo.
