# ODD: Plugin oficial de ChatGPT (listo para submission)

Objective: dejar Ordo en estado de envío al directorio de ChatGPT (Apps SDK/Plugins) — hardening OAuth para el flujo del portal, endpoint de verificación de dominio, paquete del plugin (manifest + skills) y kit de revisión. Es la ejecución del T1 de #232 con la doc oficial de OpenAI como fuente.
Branch: `feature/chatgpt-plugin-backend` (PR 1, backend) → `feature/chatgpt-plugin-package` (PR 2, paquete + docs; nace de main tras merge del PR 1)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; squash and merge; revisión independiente por PR.
Test runner: Jest (backend).

## Context (leer primero — presupuesto: estos paths, nada más)

- `odd/tasks/003-directory-listings.md` (hasta `## Log` — el programa de publicación)
- `docs/guides/integrations/listing-assets.md` (copy de la ficha ChatGPT T1)
- `apps/backend/src/oauth/oauth.service.ts` (`registerClient` :119-231, `resolveGrantedScopes` :296-326)
- `apps/backend/src/oauth/oauth.service.spec.ts` (estilo de tests de DCR, :79-242)
- `apps/backend/src/mcp/mcp-well-known.controller.ts` (patrón de well-known público)
- `packages/openclaw-plugin/skills/ordo-day/SKILL.md` (patrón de skill a portar)
- Doc oficial OpenAI: `developers.openai.com/plugins/build/plugins.md` (manifest `plugin.json` + `mcp.json`, schema Agent Plugins 1.0.0), `.../build/skills.md` (SKILL.md frontmatter name+description), `.../build/auth.md` (OAuth 2.1 + PKCE S256 obligatorio, CIMD/DCR), `.../deploy/submission.md` (ZIP, challenge de dominio, material de revisión: 5 casos + / 3 −, cuenta demo sin MFA, vídeo)

## Specs

S1. **Tolerancia de scopes en DCR** (`registerClient`): los scopes estándar OIDC (`openid`, `email`, `profile`, `offline_access`) y cualquier scope desconocido se RECORTAN (se ignoran) en vez de rechazar con 400 — misma política de clamping que `resolveGrantedScopes` aplica a clientes DCR abiertos; se registra log del recorte. La idempotencia del re-registro trata un cliente existente con `scopes: []` (abierto) como techo infinito (nunca `invalid_client_metadata` por añadir scope). Los clientes con techo (CIMD) siguen rechazando ampliación. Check: tests — registro mixto OIDC+conocidos almacena solo conocidos; registro solo-OIDC crea cliente abierto; re-registro de cliente abierto añadiendo scope → idempotente; re-registro de cliente con techo añadiendo scope → 400.
S2. **Challenge de dominio**: `GET /.well-known/openai-apps-challenge` público (@Public), respuesta `text/plain` con el cuerpo EXACTO de `OPENAI_APPS_CHALLENGE_TOKEN` (sin JSON ni decoración), 404 si la variable no está configurada; variable opcional en `env.validation.ts` y documentada en `.env.example`. Check: test unitario (200 texto exacto / 404) y curl contra producción tras deploy.
S3. **Paquete del plugin** en `packages/chatgpt-plugin/` (directorio de artefactos, SIN package.json para no tocar el lockfile): `plugin.json` (schema `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`, name kebab-case `ordo`, version, description, author, homepage, license, keywords), `mcp.json` (schema mcp 1.0.0, servidor `ordo` type `streamable-http` url `https://api.ordotodo.app/mcp`, auth `com.openai` type `oauth` con baseScopes `read tasks:write projects:write`), `skills/ordo-day/SKILL.md` y `skills/ordo-review/SKILL.md` (frontmatter `name`+`description`, cuerpo con flujo, reglas anti-alucinación y tope de confirmación para mutaciones, portados del patrón openclaw y adaptados a las tools reales del catálogo MCP), `assets/` (logo de marca desde apps/desktop/resources), README con recipe de ZIP (sin incluir dist/) y checklist de submission. Check: estructura raíz exacta `plugin.json, mcp.json, skills/, assets/`; zip local genera artefacto empaqueable.
S4. **Kit de revisión** en `docs/guides/integrations/chatgpt-review-kit.md`: 5 casos de prueba positivos y 3 negativos ejecutables contra las tools reales del catálogo (mcp-tool-scopes.ts), con peticiones/resultado esperado; borrador de release notes; lista de materiales humanos pendientes (cuenta demo sin MFA, vídeo walkthrough con shot-list). Check: cada caso nombra tools reales.
S5. **Fichas actualizadas**: `listing-assets.md` sin referencias al dominio provisional (`ordotodo.app` → `api.ordotodo.app` y guías reales `/guide/connect/chatgpt`); `directory-status.md` T1 ChatGPT refleja que el dominio ya no bloquea y quedan: identidad dev verificada, token de challenge en env, materiales de revisión, submit. Check: grep sin "ordotodo.app" a secas en las secciones ChatGPT.

Fuera de alcance: UI visual del plugin (onboarding skill, hooks), RFC 9207, cambios de catálogo de tools, Zapier/Claude/ClawHub (003 T2-T4).

## Allowed edit surfaces

- `apps/backend/src/oauth/oauth.constants.ts`, `oauth.service.ts`, `oauth.service.spec.ts`
- `apps/backend/src/mcp/mcp-well-known.controller.ts` + nuevo `mcp-well-known.controller.spec.ts`
- `apps/backend/src/config/env.validation.ts`
- `apps/backend/.env.example`
- `packages/chatgpt-plugin/` (nuevo)
- `docs/guides/integrations/listing-assets.md`, `directory-status.md`, `chatgpt-review-kit.md` (nuevo)
- `odd/tasks/023-chatgpt-plugin.md` (nuevo)

## Verification

- `cd apps/backend && npx jest src/oauth src/mcp --runInBand` → verde
- `cd apps/backend && npx tsc --noEmit -p tsconfig.build.json` → 0 errores
- Gates raíz: `npm run lint` (solo ficheros tocados sin errores nuevos), `npm run check-types`
- `cd packages/chatgpt-plugin && zip -r /tmp/ordo-plugin.zip plugin.json mcp.json skills assets` → ZIP genera sin errores y lista los 4 elementos raíz

## Tasks

| ID  | Cubre | Unidad                                                                                                                                               | Ruta sugerida | Estado  | Evidencia                                                                                                                                                                                              |
| --- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | S1+S2 | Backend: clamping DCR + endpoint challenge + tests                                                                                                   | inline        | done    | PR #444. jest src/oauth src/mcp 107/107 (4 casos nuevos DCR + spec challenge 200/404); tsc 0 errores; eslint 0 errores en ficheros tocados.                                                            |
| T2  | S3    | Paquete plugin: plugin.json + mcp.json + 2 skills + assets + README                                                                                  | inline        | done    | PR #446. Estructura raíz válida (plugin.json, mcp.json, skills/, assets/); skills portadas del patrón openclaw con tools reales del catálogo; ZIP verificado localmente (raíz plana).                  |
| T3  | S4+S5 | Kit de revisión + refresco de fichas de publicación                                                                                                  | inline        | done    | PR #446. chatgpt-review-kit.md (5+/3− sobre tools reales, release notes, shot-list); listing-assets.md y directory-status.md con dominios finales verificados por curl (web 307, metadata MCP/AS 200). |
| T4  | —     | HUMANO (owner): identidad dev verificada en org OpenAI, token de challenge al env del VPS + redeploy, cuenta demo sin MFA, vídeo, subir ZIP y submit | owner         | pending | Guía paso a paso entregada en la sesión del 29-oct; checklist en packages/chatgpt-plugin/README.md § Submission.                                                                                       |
| T5  | —     | Post-aprobación: publish, directory-status.md en verde, landing, métricas                                                                            | owner         | pending | —                                                                                                                                                                                                      |

## Log

L1. "ya tenemos el MCP probado y aprobado, con el oauth y tests mios en chatgpt de interaciones entre chatgpt y Ordo Todo... seguimos con lo que se necesita hacer para tener el plugin listo, cuando llegas al punto que tengo que hacer yo me oriente para que pueda hacer de forma facil" (mensaje del usuario 2026-10-29; tras la F0 de [[chatgpt-plugin-publication-plan-oct-2026]] superada).

L2 (2026-10-29). T1-T3 ejecutados en dos PRs (#444 backend, #446 paquete+docs) desde worktrees propios tras un incidente de sesión concurrente (un commit cayó en `feat/online-status-package` ajena; recuperado por cherry-pick y su rama restaurada a `dec28104`). Decisiones: clamping DCR con la MISMA política que `resolveGrantedScopes` (drop + log, sin lista OIDC separada — cualquier desconocido cae); idempotencia: cliente abierto = techo infinito; challenge sirve el token EXACTO en text/plain y 404 sin env (nada de JSON). Paquete plugin SIN package.json a propósito (cero cambios de lockfile; workspaces ignoran dirs sin package.json); manifest mínimo contra el schema Agent Plugins 1.0.0 (campos opcionales de presentación se dejan al portal); skills sin `user-invocable` (campo de OpenClaw, no de ChatGPT). URLs verificadas en vivo antes de escribirlas: web 307 en ordotodo.app, metadata MCP/AS 200 en api.ordotodo.app, challenge 404 esperado. Pendiente T4 humano; RFC 9207 fuera de alcance (sin impacto observado).
