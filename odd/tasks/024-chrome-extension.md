# ODD: Extensión de Chrome — captura desde el navegador (MVP)

Issue: #448

Objective: llevar la captura omnipresente (ODD 007) al navegador — crear tareas de Ordo desde cualquier página sin abrir la app: popup de captura rápida, menú contextual y acceso a "tareas de hoy" con badge. La extensión reutiliza los paquetes compartidos (`@ordo-todo/ui`, `@ordo-todo/hooks`, `@ordo-todo/api-client`, `@ordo-todo/i18n`) y la infraestructura OAuth existente; captura y mira, no gestiona (B5).
Branch: `feature/odd-024-chrome-extension` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; una PR por T# (≤300 líneas ideal); test-first (RED/GREEN) en toda lógica testeable (prefill, conteo de badge, storage/refresh con mocks de `chrome.*`, guard del backend); la verificación de comportamiento real (carga unpacked, flujo OAuth vivo contra prod) queda como evidencia manual documentada en el Log de cada T#.
Test runner: Vitest (`apps/extension`) · Jest backend solo para el spec de S1 (`src/auth/strategies` + `src/oauth`) · gates raíz (`npm run build`, `npm run check-types`).

## Context (leer primero — presupuesto: estos paths, nada más)

Distinciones críticas (no confundir):
- **La extensión NO es una cuarta app con frontend de dominio propio**: es un contenedor delgado al estilo ODD 022 — el formulario es el `CreateTaskDialog` de `packages/ui`, la validación el `createTaskSchema` de `@ordo-todo/hooks`, el HTTP el `@ordo-todo/api-client` y el i18n `@ordo-todo/i18n`.
- **Auth (hallazgo verificado 2026-10-29)**: `JwtStrategy` (`apps/backend/src/auth/strategies/jwt.strategy.ts:16-27`) ya acepta `Authorization: Bearer` además de la cookie `access_token`, pero rechaza cualquier `tokenType !== 'access'` (línea 32). Los tokens del flujo OAuth/consent se emiten con `tokenType: 'oauth_access'` (`apps/backend/src/oauth/oauth.service.ts:618-624`) → HOY solo valen para MCP (`McpAuthGuard`), NO para `/api/v1/*`. S1b abre este hueco de forma acotada a clientes first-party; sin ese cambio la extensión no puede llamar a la API con consent tokens.
- **Framework de extensión: WXT** (MV3-first, Vite nativo, React soportado, HMR) — decisión D3. Alternativa CRXJS descartada (mantenimiento intermitente). React + TS igual que el resto del repo.

Paths:
- `odd/tasks/022-cross-app-parity.md` (S3: contrato de props del `CreateTaskDialog`; invariantes B1-B4 que aquí se heredan)
- `packages/ui/src/components/task/create-task-dialog.tsx` (componente compartido, exportado del barrel `@ordo-todo/ui`)
- `apps/desktop/src/components/task/create-task-dialog.tsx` (contenedor de referencia: react-i18next + api-client + slots — el análogo más cercano de lo que será la extensión)
- `packages/hooks/src/schemas.ts:94` (`createTaskSchema`; `projectId` nullable = tarea express, ODD 021)
- `packages/api-client/src/client.ts:1398` (`createTask`) y `:1438` (`getTasksToday` — alimenta badge y vista Hoy)
- `packages/i18n/src/locales/{es,en,pt-br}.json` (namespace `CreateTask` existente; aquí se añade `Extension`)
- `apps/backend/src/oauth/` (`oauth.controller.ts` authorize/consent/token; `oauth.delegate.ts` clientes; `oauth.service.ts` emisión)
- `apps/backend/src/auth/strategies/jwt.strategy.ts` (guard que S1b extiende)
- `apps/backend/src/ai/ai.controller.ts:194` (`parse-task`, ODD 007 S1 — SOLO referencia de fase 2, no se usa en el MVP)
- `docs/guides/integrations/listing-assets.md:36` (privacy URL ya verificada: `https://ordotodo.app/privacy`)
- Dominios prod: app web `ordotodo.app`, API `api.ordotodo.app` (`apps/backend/.env.example:37-40`)

## Specs

S0. **(P0) Esqueleto MV3**: nueva app `apps/extension` con WXT + React + TS; entrypoints `popup`, `background` (service worker) y `options` placeholder; manifest con permisos mínimos: `storage`, `alarms`, `contextMenus`, `activeTab`, `identity` y `host_permissions: ["https://api.ordotodo.app/*"]` — prohibidos `<all_urls>`, `tabs`, `cookies` y `notifications` (B3). Iconos de marca (símbolo morado `#AD46FF`, coherente con landing/app) en 16/32/48/128. Workspace ya cubierto por `apps/*` en root `package.json` (0 cambios raíz). ID fija en dev vía `key` en el manifest (necesaria para que el redirect OAuth sea estable, ver S1). Check: `npm run build` en apps/extension produce el bundle que carga en `chrome://extensions` (Load unpacked) sin warnings de manifest; popup de prueba renderiza texto en el idioma del navegador con i18n de `@ordo-todo/i18n` ya cableado.

S1. **(P0) Auth: consent OAuth + apertura acotada de /api/v1**:
    (a) **Backend — cliente first-party**: registro del cliente `Ordo para Chrome` (redirect `https://<ext-id>.chromiumapp.org/`) y emisión, a clientes marcados first-party, de un claim que autoriza la API completa (p. ej. `api: 'full'`) en el access token.
    (b) **Backend — guard acotado**: `JwtStrategy` acepta `tokenType: 'oauth_access'` SOLO si el claim first-party está presente; los tokens de clientes de terceros (ChatGPT/Claude) siguen limitados a MCP. Test de separación obligatorio en ambas direcciones.
    (c) **Extensión**: `chrome.identity.launchWebAuthFlow` → code → token+refresh vía `/oauth/token`; tokens en `chrome.storage.session` (nunca localStorage ni cookies); refresh silencioso al expirar/401; logout = revoke + `storage.clear`; estado de sesión visible en el popup.
    Check (backend, jest): token `oauth_access` de cliente first-party autentica en `/api/v1/tasks` (200); token equivalente de cliente de terceros → 401; suite MCP existente verde (regresión). Check (extensión, vitest + manual): login → consent → token persistido → `getTasksToday` real 200; expiración → refresh sin intervención; logout limpia storage y el badge.

S2. **(P0) Captura rápida en popup**: popup con `CreateTaskDialog` de `packages/ui` en contenedor delgado estilo desktop (labels vía react-i18next + namespace `CreateTask`; submit vía `createTaskSchema` + `api-client.createTask` con Bearer). Prefill determinista (sin IA): título = `document.title` de la pestaña activa; descripción = URL de la página + texto seleccionado si lo hay (lectura con `chrome.tabs.query` + `chrome.scripting.executeScript`, amparadas por `activeTab` concedido en el clic). `projectId` null permitido (express). Al crear: confirmación visible en el popup y badge refrescado. Check: vitest del contenedor con mocks de `chrome.*` y api-client (prefill título/selección, payload válido según schema, express sin proyecto); manual contra prod: tarea creada desde el popup visible en `ordotodo.app`.

S3. **(P1) Menú contextual**: entrada "Añadir a Ordo" en `contextMenus` sobre: selección (título = `selectionText`, descripción = URL), enlace (título = texto del enlace, descripción = `linkUrl`) y página (título + URL). Sin abrir popup: el service worker crea la tarea con el proyecto por defecto de opciones; feedback = badge temporal "✓" (5 s) — sin permiso `notifications` en MVP (D5). Sin sesión: abre pestaña de auth. Check: vitest del handler de menú (3 contextos → payload correcto, respetando opciones); manual: las 3 capturas crean tareas visibles.

S4. **(P1) Badge + vista "Hoy"**: con sesión activa, `getTasksToday()` alimenta (a) badge del icono = nº de tareas de hoy sin completar (cap "99"), refrescado al abrir el popup y vía `chrome.alarms` (30 min); (b) segunda vista "Hoy" del popup: lista mínima (título, proyecto, checkbox completar) + enlace "Abrir Ordo". Sin sesión: badge vacío y vista pidiendo login. Check: vitest de conteo, wiring de alarms y completado; manual: badge refleja la web al completar tareas.

S5. **(P2) Página de opciones**: proyecto por defecto para la captura contextual (selector con proyectos del workspace vía API), idioma (auto/es/en/pt-BR vía `@ordo-todo/i18n`), estado de sesión + logout. Persistencia: `chrome.storage.sync` (opciones), `chrome.storage.session` (tokens). Check: vitest de carga/guardado; manual: cambiar idioma y proyecto y verificar el efecto en la captura contextual.

S6. **(P1) Kit de Chrome Web Store**: `docs/guides/integrations/chrome-extension.md` con: zip de release reproducible (`npm run build` + empaquetado), listing en es/en/pt-BR, justificación de cada permiso (`activeTab` = leer título/selección de la pestaña en la que el usuario actúa; `identity` = flujo OAuth; `contextMenus`/`alarms`/`storage` = captura y badge), política de privacidad (URL existente, sin venta ni tracking de datos), y checklist de review de Google. Check: doc completo + zip generado + listing redactado. El SUBMIT a la store es la tarea humana final del owner (fuera de los PRs).

Fuera de alcance (fase 2, intencionado): parse-task NL en la captura (endpoint ya vivo, ODD 007 S1), notificaciones/recordatorios del navegador, "enviar a mi agente", integración Gmail, dashboard en new tab, soporte Firefox/Edge (WXT lo facilita pero queda sin verificar), y el resto de la matriz de captura de ODD 007.

## Contrato de colaboración (invariantes nuevas)

- B1. **Un solo formulario**: la captura usa el `CreateTaskDialog` de `packages/ui` con contenedor delgado (heredan B1-B4 de ODD 022). Prohibido duplicar formulario o schema en `apps/extension`.
- B2. **Auth por token OAuth** en `chrome.storage.session`; prohibido depender de cookies de sesión del navegador y prohibido pedir el permiso `cookies`.
- B3. **Permisos mínimos y declarados**: sin `<all_urls>`, `tabs`, `cookies` ni `notifications` (MVP); `host_permissions` solo a `api.ordotodo.app`. Cualquier permiso nuevo exige entrada en `## Log` con justificación.
- B4. **i18n trilingüe sin literales**: claves nuevas en namespace `Extension` de `@ordo-todo/i18n` (paridad es/en/pt-BR); el formulario reutiliza el namespace `CreateTask` existente.
- B5. **La extensión captura y mira, no gestiona**: sin vistas de proyectos, ajustes de dominio, pomodoro ni colaboración.

## Allowed edit surfaces

- `apps/extension/**` (nueva app: WXT, popup/background/options, tests)
- `packages/i18n/src/locales/{es,en,pt-br}.json` (solo namespace `Extension`)
- `apps/backend/src/auth/strategies/jwt.strategy.ts` (+ su spec) — SOLO la apertura acotada de S1b
- `apps/backend/src/oauth/` (claim first-party en la emisión + registro/seed del cliente; specs de oauth.service)
- `packages/db/prisma/` (solo seed del cliente first-party si aplica; migraciones de schema requieren aprobación del padre)
- `docs/guides/integrations/chrome-extension.md` (nueva: kit CWS)
- `docs/planning/roadmap.md` (fila 024)
- `odd/tasks/024-chrome-extension.md`

## Verification

```bash
# Backend (S1)
cd apps/backend && npx jest src/auth/strategies src/oauth --runInBand

# Extensión (S0-S5)
cd apps/extension && npm run build && npx vitest run

# Gates raíz
npm run build && npm run check-types

# Manual (evidencia con capturas en el Log de cada T#)
# chrome://extensions → Load unpacked → apps/extension/.output/chrome-mv3
# login → consent → getTasksToday 200 → crear tarea desde popup → visible en ordo todo.app
# menú contextual (selección/enlace/página) → 3 tareas; badge = hoy sin completar
```

Esperado: 0 warnings de manifest; jest de strategies/oauth verde incluyendo el test de separación first-party vs terceros; vitest de la extensión verde; gates raíz verdes; flujo real contra prod documentado.

## Tasks

| T# | Specs | Entrega | Ruta sugerida | Estado |
|----|-------|---------|---------------|--------|
| T1 | S0 | Esqueleto WXT + i18n cableado + carga unpacked sin warnings | scaffold `apps/extension` → popup placeholder → icons marca → manifest key | PENDIENTE |
| T2 | S1 | OAuth first-party: claim+guard en backend (test de separación RED/GREEN) + launchWebAuthFlow + storage/refresh/logout | oauth.service → jwt.strategy → auth en extensión → flujo real contra prod | PENDIENTE |
| T3 | S2 | Popup de captura (CreateTaskDialog + prefill de pestaña/selección) | contenedor estilo desktop → mocks `chrome.*` → manual prod | PENDIENTE |
| T4 | S3+S5 | Menú contextual + página de opciones | handler en background → options page → manual | PENDIENTE |
| T5 | S4 | Badge + vista Hoy | alarms + getTasksToday → lista/checkbox → manual | PENDIENTE |
| T6 | S6 | Kit CWS (doc + zip + assets + listing) | `docs/guides/integrations/chrome-extension.md` | PENDIENTE (submit humano aparte) |

## Log

L1. Pedido original (2026-10-29): "tengo cuenta de desarrollador de extensiones de Chrome, seria util aprovechar esto y crear algun tipo de extension para chrome de Ordo Todo? que funciones pondriamos en la extension caso veas utilidad para esto?" → evaluación entregada (utilidad sí: captura omnipresente es el caso de uso clásico de Todoist/Linear/Notion y encaja con la visión agent-first); el owner aprobó redactar el doc ("adelante, redacta").

Decisiones de diseño del padre (2026-10-29):
- D1: MVP = capturar (popup + menú contextual) y mirar (badge + Hoy). La gestión de tareas/proyectos queda fuera por diseño (B5); fase 2 con parse-task, notificaciones, "enviar a agente" y Gmail si el MVP engancha.
- D2: auth = consent OAuth reutilizado (`launchWebAuthFlow`) en vez de (a) login email+password en el popup (mala UX y excluye a usuarios de Google/GitHub) ni (b) emparejamiento custom desde "Apps conectadas" (duplicaría OAuth). El coste es la apertura acotada de `/api/v1` a tokens first-party (S1b), que además allana el camino de la API pública (ODD 009).
- D3: framework = WXT (MV3-first, Vite nativo, HMR, portabilidad futura a Firefox/Edge); CRXJS descartado por mantenimiento intermitente.
- D4: prefill determinista (título/URL/selección) sin parse-task en el MVP; el endpoint ya existe (ODD 007 S1) y su cableado es la primera mejora de fase 2.
- D5: feedback de la captura contextual con badge temporal, no con `chrome.notifications`: un permiso menos que justificar en la review de la store.
- D6: hallazgo que moldea S1, verificado hoy contra el código: `JwtStrategy` rechaza `tokenType: 'oauth_access'` (`jwt.strategy.ts:32`) y el flujo OAuth emite exactamente ese tokenType (`oauth.service.ts:623`) — sin S1b la extensión no puede usar consent tokens contra `/api/v1`.
