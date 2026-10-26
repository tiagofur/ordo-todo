# Guías de conexión con agentes (índice técnico)

> **Última actualización**: 2026-10-25
> **Autor/Mantenedor**: equipo Ordo
> **Estado**: ✅ Operativo (URLs de producción verificadas con sondas
> tras el deploy de #388; prueba humana por cliente pendiente)

Espejo técnico de las guías de usuario en `apps/webpage/.../guide/connect/`:
mismos flujos, con endpoints, scopes y comandos exactos para
desarrolladores. La fuente de verdad del protocolo es
`docs/reference/mcp-server.md` + `docs/reference/api-reference.md`.

## 📋 Índice rápido

- [manual-setups.md](./manual-setups.md) — bloques copy-paste verificables por cliente
- [slack-host.md](./slack-host.md) — Ordo como MCP en Slackbot
- [zapier-bridge.md](./zapier-bridge.md) — puente Zapier (temporal hasta ODD 003)

## URLs canónicas (producción, `api.ordotodo.app`)

| Qué | URL |
| --- | --- |
| MCP (Streamable HTTP) | `https://api.ordotodo.app/mcp` |
| Metadata recurso (RFC 9728) | `https://api.ordotodo.app/.well-known/oauth-protected-resource` |
| Metadata AS (RFC 8414, raíz) | `https://api.ordotodo.app/.well-known/oauth-authorization-server` |
| Registro OAuth (DCR RFC 7591 + CIMD) | `POST https://api.ordotodo.app/api/v1/oauth/register` |
| Autorización | `GET https://api.ordotodo.app/api/v1/oauth/authorize` |
| Token | `POST https://api.ordotodo.app/api/v1/oauth/token` |
| Revocación | `POST https://api.ordotodo.app/api/v1/oauth/revoke` |
| Userinfo | `GET https://api.ordotodo.app/api/v1/oauth/userinfo` |

## Matriz cliente × método

| Cliente | 1-click (usuario) | Manual (dev) | Guía usuario |
| ------- | ----------------- | ------------ | ------------ |
| ChatGPT | Conectores → Crear conector personalizado (URL) | `~/.codex/config.toml` | `/guide/connect/chatgpt` |
| Claude | Conectores → Añadir conector personalizado (URL) | `claude mcp add --transport http` | `/guide/connect/claude` |
| Hermes | Conexiones → Conectar | `~/.hermes/config.yaml` | `/guide/connect/hermes` |
| OpenClaw | ClawHub → Instalar → Conectar | `openclaw mcp add` | `/guide/connect/openclaw` |
| ZCode (z.ai) | n/a | `~/.zcode/cli/config.json` + PAT en header | (espejo técnico) |
| Slackbot | n/a (host) | Slack App Settings → MCP servers | `/guide/connect/slack` |
| Zapier | Zap → Conectar cuenta | n/a (puente) | `/guide/connect/zapier` |

Notas honestas (no prometer de más):

- El "aprobar en navegador" hoy es: sesión JWT web existente (login;
  sin sesión, `GET /oauth/authorize` redirige a login con `next`)
  + `GET /oauth/authorize` → 302 con code. **No hay UI de
  consentimiento dedicada** (sin pantalla "la app X quiere acceder").
  Las guías lo describen como "inicia sesión si hace falta y pulsa
  Autorizar" + troubleshooting si falla. Una pantalla de consent
  propia es follow-up explícito, no parte de ODD 002.
- ChatGPT y Claude no listan a Ordo en sus directorios todavía
  (ODD 003): sus guías describen el conector/conector personalizado
  con la URL de producción, que hoy es el camino real.
- Los listados en directorios/tiendas (ChatGPT Directory, Claude
  connectors gallery, ClawHub, Zapier app) pertenecen a ODD 003;
  si un listado tarda, su prueba humana queda `blocked` (no bloquea
  el resto).

## 📚 Referencias

- Guías usuario: `apps/webpage/src/app/[locale]/guide/connect/`
- `docs/reference/mcp-server.md` · `docs/reference/api-reference.md`
- ODD: `odd/tasks/002-client-integration-docs.md`
