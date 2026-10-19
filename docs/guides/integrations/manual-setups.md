# Setups manuales por cliente (técnico)

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 002-T3)

Bloques exactos que aparecen en las guías de usuario, con el comando
de verificación de cada uno. Check S2: cada bloque probado desde cero
en máquina limpia (registrar fecha + cliente + resultado en el ODD
`## Log` al ejecutar la prueba humana).

Base: `https://ordotodo.app/mcp` (ver nota de dominio en
[README](./README.md)). Todos los flujos terminan en browser-approve
contra `POST /api/v1/oauth/token` (code+PKCE, S256 obligatoria).

## Claude Code

```bash
claude mcp add --transport http ordo https://ordotodo.app/mcp
```

Verificación: dentro de Claude Code, `/mcp` debe mostrar `ordo`
como conectado; pedir `lista mis proyectos de Ordo` debe devolver
proyectos reales.

Errores comunes: URL con barra final o espacios; servidor no listado
(eliminar y re-añadir); Claude que no usa el conector (nombrar
"Ordo" explícitamente en el mensaje).

## Codex (ChatGPT en terminal)

`~/.codex/config.toml`:

```toml
[mcp_servers.ordo]
url = "https://ordotodo.app/mcp"
# Al primer uso, Codex abrirá el navegador para aprobar con tu cuenta de Ordo.
```

Verificación: reiniciar Codex y pedir `¿qué tareas vencen esta
semana?`; debe responder con datos reales.

Errores comunes: error al aprobar (cerrar pestaña, iniciar sesión en
Ordo en ese navegador, reintentar); ChatGPT no encuentra Ordo
(revisar Aplicaciones conectadas); tools ausentes (URL exacta +
reinicio).

## Cursor / VS Code / Copilot (MCP genérico JSON)

```json
{
  "mcpServers": {
    "ordo": {
      "url": "https://ordotodo.app/mcp",
      "transport": "http"
    }
  }
}
```

En Cursor: `.cursor/mcp.json`. En VS Code/Copilot:
`.vscode/mcp.json`. El cliente abre el navegador para el approve
OAuth al primer uso.

Verificación: el panel MCP del editor lista las 16 tools `ordo_*`;
llamar `ordo_me` devuelve la identidad del dueño del token.

## Hermes (YAML)

`~/.hermes/config.yaml`:

```yaml
mcp:
  servers:
    ordo:
      url: https://ordotodo.app/mcp
      auth: oauth  # Hermes will open the browser on first use
```

Verificación: reiniciar Hermes y preguntar por las tareas de hoy.

## OpenClaw (terminal)

```bash
openclaw mcp add ordo https://ordotodo.app/mcp --auth oauth
# Después aprueba en el navegador cuando OpenClaw te lo pida.
```

Verificación: pedir el resumen del día al asistente; debe incluir
tareas reales de Ordo. Si el complemento de ClawHub está instalado
(ODD 003), este paso manual no hace falta.

## Slackbot como host

Ver [slack-host.md](./slack-host.md): adjuntar
`https://ordotodo.app/mcp` en Slack App Settings → MCP servers,
auth OAuth, y Allow once / Always / Deny por herramienta.

## 📚 Referencias

- Guías usuario: `apps/webpage/src/app/[locale]/guide/connect/*/`
- `docs/reference/mcp-server.md` (protocolo, scopes, catálogo)
