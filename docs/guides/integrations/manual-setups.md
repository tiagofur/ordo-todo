# Setups manuales por cliente (técnico)

> **Última actualización**: 2026-10-25
> **Estado**: ✅ Operativo (URL + discovery verificados contra producción
> tras el deploy de #388; pendiente prueba humana por cliente —
> registrar en el ODD `## Log`)

Bloques exactos que aparecen en las guías de usuario, con el comando
de verificación de cada uno. Check S2: cada bloque probado desde cero
en máquina limpia (registrar fecha + cliente + resultado en el ODD
`## Log` al ejecutar la prueba humana).

Base: `https://api.ordotodo.app/mcp` (host del API; el descubrimiento
OAuth vive en la raíz de ese mismo host: `/.well-known/*`). Todos los
flujos terminan en browser-approve contra `POST /api/v1/oauth/token`
(code+PKCE, S256 obligatoria). Alternativa sin OAuth para clientes con
header estático: PAT via `POST /api/v1/api-tokens` →
`Authorization: Bearer ordo_pat_...`.

## Claude Code

```bash
claude mcp add --transport http ordo https://api.ordotodo.app/mcp
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
url = "https://api.ordotodo.app/mcp"
# Al primer uso, Codex abrirá el navegador para aprobar con tu cuenta de Ordo.
```

Verificación: reiniciar Codex y pedir `¿qué tareas vencen esta
semana?`; debe responder con datos reales.

Errores comunes: error al aprobar (cerrar pestaña, iniciar sesión en
Ordo en ese navegador, reintentar); ChatGPT no encuentra Ordo
(revisar Aplicaciones conectadas); tools ausentes (URL exacta +
reinicio).

## ZCode (z.ai) y clientes con header estático (PAT)

`~/.zcode/cli/config.json` (usuario) o `<repo>/.zcode/config.json`
(workspace), clave `mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "ordo": {
        "type": "http",
        "url": "https://api.ordotodo.app/mcp",
        "headers": {
          "Authorization": "Bearer ordo_pat_TU_TOKEN"
        }
      }
    }
  }
}
```

Crea el PAT con tu sesión contra `POST /api/v1/api-tokens`
(`{"name": "zcode", "scopes": ["read", "tasks:write",
"projects:write"]}`; el secreto se muestra una sola vez). Verificación:
tras reiniciar ZCode (Settings → MCP debe listar `ordo` como
conectado), pedir `usa ordo_me y dime quién soy` debe devolver tu
identidad. Revocar el PAT corta el acceso al instante.

## Cursor / VS Code / Copilot (MCP genérico JSON)

```json
{
  "mcpServers": {
    "ordo": {
      "url": "https://api.ordotodo.app/mcp",
      "transport": "http"
    }
  }
}
```

En Cursor: `.cursor/mcp.json`. En VS Code/Copilot:
`.vscode/mcp.json`. El cliente abre el navegador para el approve
OAuth al primer uso.

Verificación: el panel MCP del editor lista las 20 tools `ordo_*`;
llamar `ordo_me` devuelve la identidad del dueño del token.

## Hermes (YAML)

`~/.hermes/config.yaml`:

```yaml
mcp:
  servers:
    ordo:
      url: https://api.ordotodo.app/mcp
      auth: oauth  # Hermes will open the browser on first use
```

Verificación: reiniciar Hermes y preguntar por las tareas de hoy.

## OpenClaw (terminal)

```bash
openclaw mcp add ordo https://api.ordotodo.app/mcp --auth oauth
# Después aprueba en el navegador cuando OpenClaw te lo pida.
```

Verificación: pedir el resumen del día al asistente; debe incluir
tareas reales de Ordo. Si el complemento de ClawHub está instalado
(ODD 003), este paso manual no hace falta.

## Slackbot como host

Ver [slack-host.md](./slack-host.md): adjuntar
`https://api.ordotodo.app/mcp` en Slack App Settings → MCP servers,
auth OAuth, y Allow once / Always / Deny por herramienta.

## 📚 Referencias

- Guías usuario: `apps/webpage/src/app/[locale]/guide/connect/*/`
- `docs/reference/mcp-server.md` (protocolo, scopes, catálogo)
