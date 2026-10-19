# Visión de producto: Ordo, la mejor app de productividad del mundo

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo

## 📋 Índice rápido

- [La meta](#la-meta)
- [Posicionamiento](#posicionamiento)
- [Pilares](#pilares)
- [Lo que Ordo es hoy (verificado)](#lo-que-ordo-es-hoy-verificado)
- [Lo que Ordo será (estado objetivo)](#lo-que-ordo-será-estado-objetivo)
- [Decisiones cerradas](#decisiones-cerradas)
- [No-metas](#no-metas)
- [Criterios de éxito](#criterios-de-éxito)
- [Referencias](#referencias)

---

## La meta

Ser la mejor aplicación de productividad del mundo, por lejos. Eso significa dos cosas a la vez:

1. **Hoy**: igualar o superar a la competencia en las funciones que sus usuarios ya aman (captura rápida, calendario, integraciones, velocidad).
2. **Mañana**: estar preparados para el mundo agéntico, donde muchos usuarios ya no abrirán una UI y todo lo hará su agente (ChatGPT, Claude, Hermes, OpenClaw). Ordo debe ser la mejor *herramienta* de esos agentes, conectable con un clic.

## Posicionamiento

**El único todo-en-uno que une ejecución con persona completa.**

- **Ejecución**: tareas, proyectos, calendario, time-tracking, reuniones → acciones.
- **Persona completa**: hábitos, foco, bienestar (burnout), OKRs, energía.
- **Conectividad agéntica**: cualquier agente externo opera Ordo con un clic, con los mismos permisos del usuario.

Nadie ocupa ese lugar hoy: Motion y Reclaim no tienen hábitos ni bienestar; Notion no tiene tiempo real ni foco; Todoist no tiene IA profunda; Slack no tiene gestión personal. Ver [competitive-analysis.md](./competitive-analysis.md).

## Pilares

1. **Simplicidad inteligente** — potencia con interfaz mínima. La amplitud no puede sentirse abrumadora.
2. **IA copiloto + herramienta agéntica** — la IA ayuda sin controlar (copiloto propio) y Ordo se deja operar por agentes externos (MCP + conector 1-click). Ver [agent-first-strategy.md](./agent-first-strategy.md).
3. **Velocidad obsesiva** — captura en segundos, teclado primero, latencia predecible (aprender de Todoist/Linear).
4. **Cross-platform real** — web PWA, desktop Tauri, móvil nativo, con paridad y offline honesto por plataforma.
5. **Bienestar consciente** — burnout, energía, rituales. Nuestro diferenciador más defendible.

## Lo que Ordo es hoy (verificado)

Inventario auditado contra código el 2026-10-18. Rutas relativas al repo.

**Núcleo de productividad (existe)**:

- Tareas: CRUD, subtareas, dependencias, recurrencia, time-blocks, tags, comentarios, adjuntos, share público por link, papelera, export `.ics` — `apps/backend/src/tasks/`
- Proyectos + workflows + Kanban con columnas custom — `apps/backend/src/projects/`, `workflows/`
- Timers: Pomodoro/continuo, pausa/reanudar, cambio de tarea, historial, stats — `apps/backend/src/timers/`
- Hábitos: rachas, pausa, stats + gamificación XP/niveles/logros — `apps/backend/src/habits/`, `gamification/`
- OKRs: objetivos + key results vinculados a tareas — `apps/backend/src/objectives/`
- Notas, tags, custom fields por proyecto, plantillas — `notes/`, `tags/`, `custom-fields/`, `templates/`
- Analíticas: diaria/semanal/mensual, heatmap, distribuciones, rachas, equipo — `apps/backend/src/analytics/`

**IA y conocimiento (existe, motor solo-Gemini)**:

- `POST ai/chat`, `parse-task`, `decompose-task`, `workflow-suggestion`, `GET optimal-schedule`, `predict-duration`, `profile`, `reports/*`, `wellbeing`, `burnout/*` — `apps/backend/src/ai/` (`gemini-ai.service.ts`)
- Reuniones: analizar transcripción pegada, extraer acciones, resumen, convertir a tareas — `apps/backend/src/meetings/` (input manual, sin grabación/transcripción automática)
- Búsqueda con interpretación de intención + `ask`/sugerencias — `apps/backend/src/search/`
- Coach conversacional con contexto del usuario — `apps/backend/src/chat/`

**Colaboración y plataforma (existe)**:

- Workspaces multi-tenant con roles, invitaciones, audit log — `apps/backend/src/workspaces/`
- WebSockets: presencia, rooms por workspace/tarea — `apps/backend/src/collaboration/`
- Notificaciones + smart notifications con cron (vencimientos, planning diario, burnout, resumen semanal) — `apps/backend/src/notifications/`
- Focus + audio ambiental — `apps/backend/src/focus/`
- Auth: email + OAuth Google/GitHub, JWT con rotación, sesiones múltiples — `apps/backend/src/auth/`
- Usuarios: perfil, preferencias IA, export JSON, borrado de cuenta — `apps/backend/src/users/`
- CMS público: blog, changelog, roadmap con votos ponderados, FAQ, knowledge base, newsletter, contacto — `apps/backend/src/blog|changelog|roadmap|faq|knowledge-base|newsletter|contact/`
- Apps: web Next.js PWA con offline (IndexedDB + resolución de conflictos), desktop Tauri con timer flotante, móvil Expo nativo, i18n EN/ES/PT-BR.

**Agujeros verificados (no existe o es stub)**:

- Integraciones: el enum `IntegrationProvider` (`packages/db/prisma/schema.prisma:393`) lista Google Calendar, Google Tasks, Slack, GitHub, Teams, Notion, Zapier, pero `connectIntegration` (`apps/backend/src/users/users.service.ts:329`) solo guarda una fila en BD. Sin OAuth real, sin sync, sin llamadas externas.
- Sin API pública con tokens de usuario (solo `ADMIN_API_KEY` interna en `auth-security.controller.ts`), sin webhooks, sin MCP.
- Sin facturación (modelo `Subscription` huérfano con campos Stripe, sin módulo de cobro).
- Sin embeddings/RAG sobre contenido del usuario, sin agentes que ejecuten acciones, sin SSO/SAML.
- Detalle completo en [promises-audit.md](./promises-audit.md).

## Lo que Ordo será (estado objetivo)

1. **Conectable**: MCP remoto OAuth-first, API pública con tokens y webhooks, docs de integración por cliente, listado en directorios (ChatGPT, Claude, ClawHub, Zapier).
2. **Inteligente**: agente propio (preguntas sobre el workspace, acciones en lenguaje natural, resúmenes, triage), auto-scheduling con Do Date vs Due Date, ritual diario guiado.
3. **Imbatible en lo diario**: captura omnipresente con lenguaje natural, calendario bidireccional real, integración Slack profunda.
4. **Confiable**: política de datos clara (sin entrenamiento con datos), SSO/SAML, facturación Stripe con planes enforced, marketing 100% honesto.

El plan ejecutable está en [docs/planning/roadmap.md](../planning/roadmap.md) y [odd/tasks/](../../odd/tasks/).

## Decisiones cerradas

1. **Una sola narrativa**: Ordo es productividad general (profesionales y equipos). El contenido "Creators OS" de la landing actual es visión no disponible: se retira o se marca como visión hasta que exista o se haga fork. Ver `promises-audit.md` § creators.
2. **Una sola tabla de precios**, marcada beta hasta que el billing exista. Sin límites enforced documentados hasta implementarlos.
3. **Cero afirmaciones falsas de seguridad**: nada de E2E/SOC2/AES-256 hasta evidenciarlo en código + infra.
4. **Precios, versiones y seeds**: una sola versión de la verdad (ver auditoría).
5. **Agent-first**: primero ser conectable (MCP + API + webhooks + docs + directorios), después agente propio. En 2026 se gana siendo la mejor herramienta de los agentes que el usuario ya usa.

## No-metas

- No competir con Slack en mensajería de equipo (integrarse con Slack, no clonarlo).
- No competir con Notion en edición de documentos por bloques colaborativa en tiempo real (las notas son tablero simple; la colaboración rica es presencia + comentarios + workload).
- No construir otro LLM ni hosting de modelos: Ordo orquesta modelos externos con el contexto del usuario.
- No prometer en marketing nada que no exista en `main` o esté marcado explícitamente como beta/visión.

## Criterios de éxito

- Un usuario nuevo conecta Ordo a su agente (ChatGPT/Claude/Hermes/OpenClaw) en menos de 60 segundos, sin leer un tutorial.
- Capturar una tarea con fecha y recurrencia en lenguaje natural toma menos de 10 segundos en cualquier plataforma.
- Cero contradicciones entre marketing, docs y código (auditoría trimestral de `promises-audit.md`).
- Paridad funcional honesta documentada por plataforma (web/desktop/móvil), sin "próximamente" silenciosos.

## 📚 Referencias

- [competitive-analysis.md](./competitive-analysis.md)
- [agent-first-strategy.md](./agent-first-strategy.md)
- [promises-audit.md](./promises-audit.md)
- [Roadmap](../planning/roadmap.md) · [Tareas ODD](../../odd/tasks/)
