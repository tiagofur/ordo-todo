# Guías de conexión con agentes (índice técnico)

> **Última actualización**: 2026-10-19
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: 🚧 En desarrollo (ODD 002)

Espejo técnico de las guías de usuario en `apps/webpage/.../guide/connect/`:
mismos flujos, con endpoints, scopes y comandos exactos para
desarrolladores. La fuente de verdad del protocolo es
`docs/reference/mcp-server.md` + `docs/reference/api-reference.md`.

> **Dominio pendiente**: las guías usan `https://TU-DOMINIO-ORDO` como
> placeholder explícito (antes `https://ordotodo.app`, que sirve un sitio
> ajeno — verificado ODD 013 S10). El dominio canónico de producción está
> pendiente de decisión de negocio; al decidirlo, find/replace en
> `apps/webpage/src/messages/*.json`.

## 📋 Índice rápido

- [connect-overview.md](./connect-overview.md) — matriz cliente × método + URLs canónicas
- [manual-setups.md](./manual-setups.md) — bloques copy-paste verificables por cliente
- [slack-host.md](./slack-host.md) — Ordo como MCP en Slackbot
- [zapier-bridge.md](./zapier-bridge.md) — puente Zapier (temporal hasta ODD 003)

## URLs canónicas (producción, pendientes de dominio final)

| Qué | URL |
| --- | --- |
| MCP (Streamable HTTP) | `https://ordotodo.app/mcp` |
| Metadata recurso (RFC 9728) | `https://ordotodo.app/.well-known/oauth-protected-resource` |
| Metadata AS (RFC 8414) | `https://ordotodo.app/api/v1/oauth/.well-known/oauth-authorization-server` |
| Registro OAuth | `POST https://ordotodo.app/api/v1/oauth/register` |
| Autorización | `GET https://ordotodo.app/api/v1/oauth/authorize` |
| Token | `POST https://ordotodo.app/api/v1/oauth/token` |
| Revocación | `POST https://ordotodo.app/api/v1/oauth/revoke` |
| Userinfo | `GET https://ordotodo.app/api/v1/oauth/userinfo` |

## Matriz cliente × método

| Cliente | 1-click (usuario) | Manual (dev) | Guía usuario |
| ------- | ----------------- | ------------ | ------------ |
| ChatGPT | Directorio → Conectar | `~/.codex/config.toml` | `/guide/connect/chatgpt` |
| Claude | Conectores → Conectar | `claude mcp add --transport http` | `/guide/connect/claude` |
| Hermes | Conexiones → Conectar | `~/.hermes/config.yaml` | `/guide/connect/hermes` |
| OpenClaw | ClawHub → Instalar → Conectar | `openclaw mcp add` | `/guide/connect/openclaw` |
| Slackbot | n/a (host) | Slack App Settings → MCP servers | `/guide/connect/slack` |
| Zapier | Zap → Conectar cuenta | n/a (puente) | `/guide/connect/zapier` |

Notas honestas (no prometer de más):

- El "aprobar en navegador" hoy es: sesión JWT web existente (login)
  + `GET /oauth/authorize` → 302 con code. **No hay UI de
  consentimiento dedicada** (sin pantalla "la app X quiere acceder").
  Las guías lo describen como "inicia sesión si hace falta y pulsa
  Autorizar" + troubleshooting si falla. Una pantalla de consent
  propia es follow-up explícito, no parte de ODD 002.
- Los listados en directorios/tiendas (ChatGPT Directory, Claude
  connectors gallery, ClawHub, Zapier app) pertenecen a ODD 003. Las
  guías 1-click describen el flujo asumiendo el listado publicado;
  si un listado tarda, su prueba humana queda `blocked` (no bloquea
  el resto).

## 📚 Referencias

- Guías usuario: `apps/webpage/src/app/[locale]/guide/connect/`
- `docs/reference/mcp-server.md` · `docs/reference/api-reference.md`
- ODD: `odd/tasks/002-client-integration-docs.md`
