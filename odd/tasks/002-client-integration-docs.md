# ODD: Docs de integración por cliente (1-click + manual)

Objective: que cualquier usuario conecte Ordo a su agente en <60 segundos con 1-click, y que un dev tenga setup manual copy-paste por cliente — mismo servidor MCP (001), dos capas de fricción.
Branch: `docs/client-integration-guides` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; docs + GIFs; sin código de producto (salvo deep-links `ordo://connect` si se aprueban como S5).
Test runner: n/a (docs). Verificación = prueba humana end-to-end por cliente + revisión de enlaces.

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/agent-first-strategy.md` (secciones "El conector Ordo", "Clientes objetivo")
- `odd/tasks/001-mcp-server.md` (leer hasta `## Log` — endpoint, tools, scopes reales)
- `odd/tasks/009-public-api-webhooks.md` (leer hasta `## Log` — flujo OAuth real)
- `apps/webpage/src/app/[locale]/guide/` (estructura existente de guías: `tasks/`, `projects/`, `focus/`, `analytics/`)
- `apps/webpage/src/messages/es.json` (patrón de i18n de guías)

## Specs

S1. **Guía 1-click por cliente** (ChatGPT, Claude web/Desktop, Hermes, OpenClaw): pasos numerados con capturas/GIF del "aprobar en navegador"; tiempo objetivo <60s; sin las palabras "MCP/endpoint/scope" en el camino feliz. Check: persona no técnica completa cada guía sin ayuda (prueba humana, 1 por cliente).
S2. **Setup manual copy-paste por cliente** (Claude Code, Cursor, ChatGPT/Codex, VS Code/Copilot, Hermes YAML, OpenClaw): bloque de config exacto y verificado por cliente + comando de verificación + troubleshooting (3 errores comunes con solución). Check: cada bloque probado desde cero en máquina limpia (evidencia: fecha + cliente + resultado).
S3. **Guía Slackbot como host**: adjuntar Ordo como MCP server en Slack App Settings + Allow once/Always/Deny. Check: flujo probado con workspace Slack de test.
S4. **Vía Zapier documentada**: conectar Ordo vía Zapier MCP como puente a 9.000+ apps (hasta 003 complete listado propio). Check: guía probada con cuenta Zapier de test.
S5. **Deep-link de conexión** (opcional, decidir en T1): `https://<ordo>/connect/<cliente>` que pre-configura el flujo. Solo si reduce pasos medidos en S1; si no, se marca `dropped` con razón. Check: A/B de pasos con/sin deep-link.
S6. **Publicación trilingüe**: ES/EN/PT-BR en `apps/webpage` guías + índice; enlaces relativos; sin screenshots con datos reales de usuarios. Check: las 3 locales renderizan, 0 enlaces rotos (`next build` de webpage pasa).

Fuera de alcance: código del servidor (001), publicación en directorios/tiendas (003), plugin ClawHub (003).

## Allowed edit surfaces

- `apps/webpage/src/app/[locale]/guide/connect/` (nuevo: guías de conexión)
- `apps/webpage/src/messages/es.json`, `en.json`, `pt-br.json` (solo claves de guías de conexión)
- `apps/webpage/public/guide/` (nuevos GIFs/capturas)
- `docs/guides/integrations/` (nuevo: espejo técnico de las guías para devs)

## Verification

- `cd apps/webpage && npm run build` → 0 errores (las 3 locales)
- Pruebas humanas S1–S4 registradas en `## Log` (cliente, fecha, resultado, fricción encontrada)
- `npm run lint` en raíz (padre)

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S5 | Decisión deep-link `ordo://connect` (medir pasos, aprobar o dropear) | inline | done | DROPPED con razón medida: el flujo 1-click real tiene 4 pasos empezando DENTRO del agente (directorio → buscar → conectar/aprobar → volver); un deep-link web añadiría 2 pasos (abrir URL → elegir cliente → redirección) sin quitar ninguno. Sin precedente ni URL pública configurada. |
| T2 | S1 | Guías 1-click: ChatGPT, Claude, Hermes, OpenClaw (+GIFs) | delegada | done | PR #255, branch `docs/client-integration-guides`. 4 páginas con pasos sin jerga MCP/endpoint/scope en el camino feliz. GIFs pendientes de captura real (las guías usan pasos numerados; 0 screenshots con datos reales). Prueba humana pendiente por cliente. |
| T3 | S2 | Setups manuales copy-paste + troubleshooting por cliente | delegada | done | Mismo PR. Bloque exacto + verificación + 3 errores con solución por cliente (Codex TOML, Claude CLI, Hermes YAML, OpenClaw CLI, Cursor/VSCode JSON en espejo técnico). Prueba en máquina limpia pendiente. |
| T4 | S3–S4 | Guía Slackbot host + vía Zapier | inline | done | Mismo PR. Slack: 5 pasos + permisos Allow once/Always/Deny. Zapier: 4 pasos + ejemplo canónico Gmail→tarea + plan de retirada en ODD 003. Pruebas con workspace/cuenta test pendientes. |
| T5 | S6 | i18n trilingüe + índice + build verde | inline | done | Mismo PR. 7 namespaces × ES/EN/PT-BR verificados; sidebar + índice; webpage build verde (7 rutas × 3 locales, 0 warnings i18n); tsc limpio. |

## Log

L1. "tenemos que piensas en la integracion perfecta con agentes como Hermes, openclaw, tambien con ChatGPT, Claude y demas soluciones de IA" + "no con MCPs complejos de configurar y etc, como un plugin o conector de facil conexion y muy bien integrado" (mensajes del usuario 2026-10-18; este doc cubre la capa de conexión fácil).

L2 (2026-10-19). T1–T5 completados contra `main` (no contra la pila backend: webpage/docs no dependen de ella), rama `docs/client-integration-guides`, PR #255 (cierra #231). Patrón de guías existente respetado ('use client' + next-intl + motion + lucide + cards numerados). Decisiones honestas registradas: dominio `ordotodo.app` provisional (empate 6-6 en repo; pendiente decisión negocio + find/replace); sin UI de consentimiento dedicada — el "aprobar en navegador" real es sesión JWT + GET /oauth/authorize → 302, documentado como tal con troubleshooting (pantalla de consent propia = follow-up explícito); listados en directorios = ODD 003 (si un listado tarda, esa prueba humana va `blocked`). Pruebas humanas S1–S4 + GIFs pendientes de cuentas/listados reales: registrar fecha + cliente + resultado aquí al ejecutarlas.

L3 (2026-10-25). Placeholder de dominio resuelto: `https://api.ordotodo.app/mcp` es la URL canónica (host del API; dominio decidido de facto con el deploy de PRs #381/#382). find/replace hecho en las 4 guías × 3 locales + espejo técnico (PR #389). Las guías "1-clic" de ChatGPT/Claude reescritas al camino real (conector personalizado + URL + OAuth): Ordo NO está en los directorios todavía (ODD 003). Añadido bloque ZCode (z.ai) con PAT por header al espejo. DESCUBRIMIENTO POST-MERGE: el flujo real era inalcanzable por rutas (MCP y discovery bajo /api/v1) — arreglado y endurecido en PR #388 tras revisión independiente (P0 phishing DCR, P1 scopes default read, P2 revoke en masa). Prueba humana ChatGPT lista para el owner una vez desplegado #388; pendientes registro por cliente (fecha + resultado).
