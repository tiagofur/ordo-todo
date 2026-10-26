# Ordo como MCP en Slackbot (técnico)

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 002-T4/S3)

Slack como host MCP: Slackbot se conecta a Ordo como servidor remoto
y el usuario invoca las tools desde el chat. Espejo técnico de la
guía de usuario `/guide/connect/slack`.

Check S3: flujo probado con workspace Slack de test (registrar fecha
+ resultado en el ODD `## Log` al ejecutar la prueba humana).

## Configuración (Slack App Settings → MCP servers)

| Campo | Valor |
| ----- | ----- |
| Server URL | `https://api.ordotodo.app/mcp` |
| Transport | Streamable HTTP |
| Auth | OAuth 2.0 (browser-approve contra tu cuenta Ordo) |

Discovery: Slackbot puede descubrir autorización vía
`https://api.ordotodo.app/.well-known/oauth-protected-resource`
(RFC 9728) → authorization server en `/api/v1/oauth/*` (RFC 8414).

## Activación por usuario

1. DM con Slackbot → Apps → `+` junto a Ordo.
2. Aprobar en el navegador (sesión Ordo + Autorizar).
3. Primera invocación de cada tool: Slack pide **Allow once /
   Always allow / Deny**.

## Permisos

Ordo expone las 18 tools `ordo_*`; los scopes OAuth del grant
(`read`, `tasks:write`, `projects:write`) limitan qué puede hacer, y
la herencia de permisos (S4 de ODD 001) limita sobre qué: el agente
solo ve/opera lo del usuario que aprobó. Sin sesión → 401; sin
scope → 403 con step-up.

## 📚 Referencias

- Guía usuario: `/guide/connect/slack`
- `docs/reference/mcp-server.md` (auth, scopes, catálogo)
