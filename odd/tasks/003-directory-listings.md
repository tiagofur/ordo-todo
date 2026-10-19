# ODD: Listado en directorios (ChatGPT, Claude, ClawHub, Zapier)

Objective: que Ordo aparezca donde los usuarios buscan conectores — ChatGPT Directory, conectores Claude, ClawHub (OpenClaw), Zapier — con fichas publicadas y mantenidas.
Branch: `feature/directory-listings` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; aprobaciones externas se trackean como `blocked` con condición de desbloqueo (no bloquean otras tareas).
Test runner: Jest (solo para plugin/skill si llevan código testeable); resto = evidencia de publicación (URLs).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (secciones "Clientes objetivo", "El conector Ordo")
- `odd/tasks/001-mcp-server.md` (leer hasta `## Log` — servidor que se publica)
- `odd/tasks/002-client-integration-docs.md` (leer hasta `## Log` — guías que las fichas enlazan)
- `docs/reference/mcp-server.md` (creado por 001; si aún no existe, esta tarea espera a 001-T5)

## Specs

S1. **ChatGPT Directory**: plugin publicado = MCP server + Skills + UI opcional, testeable en ChatGPT Work; ficha con descripción, scopes solicitados y enlace a guía 1-click (002). Check: URL pública del plugin + instalación 1-click desde directorio verificada.
S2. **Claude connectors**: Ordo como conector documentado (owner pega URL, miembro pulsa Connect); ejemplo en docs + tokens auto-refrescados verificados. Check: instalación desde cero en claude.ai + Claude Code (`claude mcp add --transport http`) verificada.
S3. **ClawHub (OpenClaw)**: plugin oficial + Skill publicados ("organiza mi día con Ordo" funciona desde WhatsApp/Telegram/Discord via OpenClaw); sigue el plugin SDK de OpenClaw. Check: instalación desde ClawHub + comando de voz/texto end-to-end verificado.
S4. **Zapier**: app/acción Ordo publicada o —mínimo aceptable— guía oficial de vía Zapier MCP enlazada desde docs (002-S4) + triggers/actions sobre webhooks 009. Check: zap de ejemplo (nueva tarea Ordo → Slack) funcionando.
S5. **Mantenimiento**: cada ficha declara owner, versión del servidor soportada y fecha de última verificación; re-verificación trimestral calendada. Check: tabla de estado en `docs/guides/integrations/directory-status.md` con las 4 fichas en verde.

Fuera de alcance: código del servidor (001), guías de conexión (002), funcionalidad nueva de dominio.

## Allowed edit surfaces

- `packages/openclaw-plugin/` (nuevo, si el plugin requiere código propio)
- `docs/guides/integrations/directory-status.md` (nuevo: estado de fichas)
- `apps/webpage/src/app/[locale]/guide/connect/` (solo enlaces a fichas publicadas)
- Activos de publicación externos (descripciones, iconos, screenshots) — se referencian, no se versionan binarios pesados

## Verification

- 4 URLs públicas registradas en `directory-status.md` + `## Log` (plugin ChatGPT, conector Claude, ClawHub, Zapier)
- `cd apps/webpage && npm run build` → verde (si se tocaron guías)
- Si hay código de plugin: su test + `check-types` del package (padre autoriza deps del SDK)

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | Plugin ChatGPT Directory (submit + verificación) | delegada | blocked | Activos listos en PR #260 (`listing-assets.md` + nota webpage). Falta: dominio prod + cuenta dev + submit en ChatGPT Work + privacy/terms + test humano. |
| T2 | S2 | Conector Claude documentado + verificado | inline | blocked | Activos listos en PR #260. Falta: dominio prod + cuenta org + verificación fresh-install + auto-refresh. |
| T3 | S3 | Plugin + Skill ClawHub (código + publicación) | delegada | done | PR #260, branch `feature/directory-listings` (worktree /tmp/ordo-232). Package `@ordo-todo/openclaw-plugin@0.1.0`: cliente MCP, 5 tools, comando /ordo, Skill ordo-day, manifiesto. vitest 13/13, tsc limpio, entry carga, pack verificado. Publish (npm + clawhub + test en canal real) = humano, runbook en README del package. |
| T4 | S4 | Zapier (app o guía oficial + zap ejemplo) | inline | blocked | Puente documentado (mínimo aceptable S4) + nota webpage en PR #260. Falta: cuenta test para ejecutar el zap ejemplo + decisión native-vs-puente. |
| T5 | S5 | `directory-status.md` + calendario re-verificación | inline | done | PR #260. Tabla con owners (TBD), versiones, estados, condiciones de desbloqueo + calendario trimestral. |

## Log

L1. "tenemos que piensas en la integracion perfecta con agentes como Hermes, openclaw, tambien con ChatGPT, Claude y demas soluciones de IA porque esto es el futuro" (mensaje del usuario 2026-10-18; este doc cubre presencia en sus directorios).

L2 (2026-10-19). Todo lo automatable hecho en PR #260 (contra `main`, CI corriendo). T3: plugin verificado contra el SDK real (`openclaw@2026.10.5` como devDependency para tipos; `textResult`/`AgentToolResult` del SDK) y contra plugin de referencia (lobstah: manifiesta, entry, `registerTool`, `openclaw.extensions`). Decisiones: cliente MCP propio mínimo sobre fetch (sin SDK MCP pesado en el plugin); `openclaw` solo devDependency + peer opcional (el runtime lo provee); Skill `ordo-day` user-invocable con reglas anti-alucinación y tope de confirmación para mutaciones. T1/T2/T4: no se inventaron URLs de consolas ni procesos no verificables — activos + `blocked` con condiciones exactas, como manda la spec. #232 queda abierta hasta los submits humanos. Nota: package-lock suma ~6k líneas por el árbol real de `openclaw` (necesario para `npm ci` del CI).
