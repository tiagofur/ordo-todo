# Estrategia agent-first

> **Última actualización**: 2026-10-18
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo

## 📋 Índice rápido

- [Tesis](#tesis)
- [MCP es el estándar](#mcp-es-el-estándar)
- [El conector Ordo: 1-click, cero tutoriales](#el-conector-ordo-1-click-cero-tutoriales)
- [Clientes objetivo](#clientes-objetivo)
- [Modelo de permisos y confianza](#modelo-de-permisos-y-confianza)
- [Agente propio: alcance mínimo](#agente-propio-alcance-mínimo)
- [Orden de ejecución](#orden-de-ejecución)
- [Referencias](#referencias)

---

## Tesis

Muchos usuarios dejarán de usar UIs y operarán todo vía agentes (ChatGPT, Claude, Hermes, OpenClaw y los que vengan). En ese mundo se compite siendo la mejor **herramienta** de los agentes que el usuario ya usa, no otro chatbot más.

Consecuencia directa: **primero ser conectable, después agente propio**. Un Ordo invisible para los agentes pierde aunque tenga la mejor UI.

## MCP es el estándar

Verificado en documentación oficial (2026): Slack (`mcp.slack.com`), Notion (`mcp.notion.com`, ~50 herramientas), Asana y Zapier exponen servidores MCP remotos. Es el estándar de facto.

Especificación objetivo para Ordo (copiar el patrón Notion/Slack, no inventar):

- **Transporte**: Streamable HTTP (JSON-RPC 2.0 sobre POST + SSE opcional), endpoint `https://mcp.<ordo>/mcp`.
- **Auth**: OAuth 2.1. Servidor como resource server con Protected Resource Metadata (RFC 9728); Authorization Server con metadata (RFC 8414) u OIDC Discovery.
- **Registro de clientes**: Client ID Metadata Documents (DCR solo por compatibilidad).
- **Scopes**: mínimo primero (`WWW-Authenticate: scope=`), resto por step-up; 403 `insufficient_scope` con todos los faltantes a la vez, no incremental.
- **Seguridad**: parámetro `resource` (RFC 8707) obligatorio, audience validada, `iss` (RFC 9207), PKCE, Bearer solo en header.
- **Controles**: listado/revocación por admin, audit log, aprobación por herramienta.
- **Set de herramientas espejo Notion/Slack**: búsqueda, CRUD de tareas/proyectos, comentarios, adjuntos, hábitos, objetivos, usuarios.

→ Trabajo: `odd/tasks/001-mcp-server.md` (servidor), `odd/tasks/009-public-api-webhooks.md` (base: tokens + webhooks + patrones).

## El conector Ordo: 1-click, cero tutoriales

El usuario normal solo tolera **OAuth de 1-click desde un directorio**. El MCP manual (pegar URLs, editar JSON/TOML, CLI) es para devs/power users. Ofrecemos ambas capas sobre el mismo servidor:

**Capa 1-click (todos los usuarios)**:

1. El usuario abre su agente, busca "Ordo", pulsa **Conectar**.
2. Aprueba en el navegador con su cuenta de Ordo.
3. Listo. Las palabras "MCP", "endpoint" o "scope" no aparecen jamás.

Ejemplos perfectos a imitar: Zapier MCP (conexiones existentes aparecen solas, permisos por app/acción, revocación), conectores de Claude preconfigurados por admin (el miembro solo pulsa Conectar), Slackbot con Allow once / Always / Deny por herramienta, Asana actuando sin salir del chat.

**Capa manual (devs/power)**: documentación por cliente estilo Notion — copy-paste exacto para Claude Code, Cursor, ChatGPT/Codex, VS Code, Hermes y OpenClaw, con GIF del "aprobar en navegador". La fricción mata adopción.

→ Trabajo: `odd/tasks/002-client-integration-docs.md`, `odd/tasks/003-directory-listings.md`.

## Clientes objetivo

| Cliente | Vía de integración | Notas |
|---|---|---|
| **ChatGPT / Codex** | Plugin = MCP server + Skills + UI, publicado en el ChatGPT Directory | Testeable en ChatGPT Work. Config Codex vía `~/.codex/config.toml` + login. |
| **Claude (web/Desktop/Code)** | Custom connectors (owner pega URL, miembro pulsa Connect) + `claude mcp add --transport http` | URL remota pública obligatoria. Tokens auto-refrescados. |
| **Hermes** (Nous, MIT) | Cliente OAuth estándar (`~/.hermes/config.yaml`) | Asistente personal open-source con memoria persistente; nada especial que construir, solo un buen MCP. |
| **OpenClaw** (MIT) | Cliente OAuth estándar + **plugin oficial en ClawHub** + Skill | Publicar plugin propio: "organiza mi día con Ordo" desde WhatsApp/Telegram/Discord. |
| **Cursor / VS Code / Copilot** | MCP remoto en `.cursor/mcp.json` / `.vscode/mcp.json` | Docs copy-paste exacto. |
| **Slackbot (Slack como host)** | Ordo como MCP server adjuntado en Slack App Settings | Ejemplo documentado; reutiliza el mismo servidor. |
| **Zapier / Make** | Vía Zapier MCP documentada (9.000+ apps de golpe) + webhooks propios | Puente inmediato al ecosistema existente. |

## Modelo de permisos y confianza

1. **El agente solo ve lo que el usuario ve.** Permisos heredados automáticamente del usuario OAuth; si no tienes acceso a un workspace, el agente tampoco.
2. **Invitados bloqueados** de OAuth/MCP (como Notion).
3. **Aprobación por acción en lenguaje humano**: "Ordo quiere crear 3 tareas en Proyecto X" → permitir una vez / siempre / denegar.
4. **Datos**: no entrenar con datos de usuarios, borrado tras consulta donde aplique, retención configurable. Política pública clara desde el día uno (aprender de Asana/Notion).
5. **Enterprise**: guests bloqueados, audit log, revocación admin, SSO/SAML y SOC2 en roadmap visible.

→ Trabajo: `odd/tasks/008-enterprise-trust.md`.

## Agente propio: alcance mínimo

No para competir con ChatGPT, sino para que Ordo brille incluso para quien no usa otros agentes:

1. **Preguntas sobre el workspace** en lenguaje natural (con recuperación real sobre el contenido del usuario, no solo chat libre).
2. **Acciones en lenguaje natural**: crear/actualizar/reorganizar tareas, triage y enrutado.
3. **Resúmenes**: daily/shutdown, semanal (extender lo existente en `ai/reports/*`).
4. **Trabajos recurrentes en lenguaje natural**: "cada viernes a las 5, prepárame el resumen semanal" corriendo por horario/evento (estilo Linear).
5. **Cobro por créditos** con trial generoso (estilo Notion $10/1k) o por request completado (estilo Asana). Definir antes de implementar.

Base existente: `POST ai/chat`, `parse-task`, `decompose-task`, `optimal-schedule`, `reports/*`, `search/*`, `chat/*`. Falta: embeddings/RAG real, ejecución de acciones con tools, memoria persistente.

→ Trabajo: `odd/tasks/004-own-agent-mvp.md`.

## Orden de ejecución

1. **Ser conectable** (antes que nada): API pública + webhooks → MCP remoto → docs por cliente → directorios.
2. **Agente propio mínimo** sobre la misma base.
3. **Inteligencia diaria** (scheduling, ritual) que los agentes externos también puedan invocar vía MCP.

Regla de oro: toda capacidad nueva del agente propio debe exponerse también como herramienta MCP cuando tenga sentido. Nada de islas.

## 📚 Referencias

- [product-vision.md](./product-vision.md) · [competitive-analysis.md](./competitive-analysis.md)
- [Roadmap](../planning/roadmap.md) · [Tareas ODD](../../odd/tasks/)
