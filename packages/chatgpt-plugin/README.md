# Ordo — ChatGPT plugin

Paquete de publicación del plugin oficial de Ordo para el directorio de
ChatGPT (Apps SDK / Plugins, esquema Agent Plugins 1.0.0). El plugin es
**solo declarativo**: el servidor MCP ya vive en producción
(`apps/backend/src/mcp/`, ODD 001) y las Skills guían el uso de las
tools reales del catálogo.

## Estructura (raíz exacta que exige el empaquetado)

```
chatgpt-plugin/
├── plugin.json          # manifest portable (Agent Plugins 1.0.0)
├── mcp.json             # servidor MCP remoto + auth OAuth
├── skills/
│   ├── ordo-day/SKILL.md      # "organiza mi día" (proposal → apply con confirmación)
│   └── ordo-review/SKILL.md   # estado: pendientes, hábitos, objetivos (read-only)
├── assets/
│   ├── icon.svg               # símbolo de marca (morado #AD46FF)
│   └── icon-512.png           # PNG 512×512 para el portal
└── README.md            # este fichero (NO entra en el ZIP)
```

Tools que consumen las skills (todas del catálogo real,
`apps/backend/src/mcp/mcp-tool-scopes.ts`): `ordo_day_plan`,
`ordo_day_plan_apply`, `ordo_task_list`, `ordo_task_create`,
`ordo_task_complete`, `ordo_habit_today`, `ordo_habit_complete`,
`ordo_objective_progress`, `ordo_me`.

## Build del ZIP

El ZIP debe contener `plugin.json`, `mcp.json`, `skills/` y `assets/` en
la raíz (el README fuera):

```bash
cd packages/chatgpt-plugin
zip -r /tmp/ordo-chatgpt-plugin.zip plugin.json mcp.json skills assets
unzip -l /tmp/ordo-chatgpt-plugin.zip   # verificar raíz plana, sin carpeta contenedora
```

El servidor MCP NO va dentro del ZIP: se referencia remoto en `mcp.json`
(`https://api.ordotodo.app/mcp`) y el portal lo conecta, verifica dominio
y escanea tools aparte.

## Submission — checklist (ODD 023 T4, humano)

Automático (hecho):

- [x] `plugin.json` + `mcp.json` válidos contra el esquema Agent Plugins 1.0.0
- [x] Skills con frontmatter `name` + `description` y cuerpo con flujo/reglas
- [x] `/.well-known/openai-apps-challenge` servido por el backend (PR #444)

Humano (portal de OpenAI, en orden):

1. **Identidad de desarrollador verificada** en la organización de OpenAI
   (Settings → Organization → Verify) — owner o miembro con
   "Apps Management Write".
2. **Subir el ZIP** en la página Plugins → "Upload new or existing
   plugin", eligiendo la identidad verificada. El MCP debe ir incluido
   desde este primer envío (no se puede añadir después a un plugin solo
   de skills).
3. **Conectar el MCP** en la sección MCPs del portal: URL
   `https://api.ordotodo.app/mcp`, auth OAuth (DCR — no pide secret, el
   flujo es PKCE público).
4. **Verificar el dominio**: el portal muestra un token; ponerlo en
   `OPENAI_APPS_CHALLENGE_TOKEN` del `.env` del VPS → `docker compose up
-d backend` (RUNBOOK §6) → el portal comprueba
   `https://api.ordotodo.app/.well-known/openai-apps-challenge`.
5. **Completar autenticación + escaneo de tools** del portal (18 tools).
6. **Attestations** + material de revisión: kit en
   `docs/guides/integrations/chatgpt-review-kit.md` (5 casos +, 3 −,
   release notes, shot-list de vídeo; cuenta demo sin MFA).
7. **Submit** a revisión. Solo una revisión activa por plugin; el
   feedback llega por email. Tras aprobar: _Publish_ cuando se decida.

Notas del reglamento: cambiar la URL del MCP después de publicar exige
pasar por soporte (publicar ya con el dominio definitivo); los cambios
de servidor post-publicación se re-escanean solos a diario; cambios de
metadata/skills exigen ZIP nuevo.

## Mantenimiento

- `version` de `plugin.json` sube en cada re-envío de ZIP (metadata o skills).
- Re-verificación trimestral de la ficha: calendario en
  `docs/guides/integrations/directory-status.md`.
