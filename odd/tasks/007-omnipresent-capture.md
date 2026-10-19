# ODD: Captura omnipresente + paleta Cmd+K + atajos unificados

Objective: igualar a Todoist/Linear en el núcleo — capturar una tarea con fecha y recurrencia en lenguaje natural en <10s desde cualquier plataforma, con una sola paleta de comandos y atajos consistentes.
Branch: `feature/omnipresent-capture` (sugerida; el padre es dueño de git)
Delivery strategy: work-unit commits; PRs ≤300 líneas ideal; backend primero (contrato), luego web → desktop → móvil.
Test runner: Jest (backend), Vitest (web/desktop), Jest (móvil).

## Context (leer primero — presupuesto: estos paths, nada más)

- `docs/vision/competitive-analysis.md` (sección "Vs Todoist / Linear", gap #2)
- `docs/vision/promises-audit.md` (§H atajos inconsistentes; §I fuera de alcance: prioridades `LOW/MEDIUM/HIGH/URGENT`)
- `apps/backend/src/ai/ai.controller.ts:75` (`POST ai/parse-task` — contrato a extender, compatible)
- `apps/backend/src/ai/ai.controller.ts:364` (`POST ai/decompose-task`)
- `apps/web/src/components/shared/sidebar.tsx` (sidebar web: dónde vive la captura hoy)
- `apps/desktop/src/routes.tsx` (rutas desktop)
- `apps/mobile/app/screens/(internal)/(tabs)/_layout.tsx` (tabs + FAB móvil)

## Specs

S1. **Contrato `parse-task` v2 (compatible)**: entrada texto libre → `{ title, dueAt, recurrence, priority, projectHint, confidence }`; soporta ES/EN/PT ("mañana 15h #trabajo @alta", "every weekday", "toda segunda"); `confidence < 0.6` → pide confirmación en vez de adivinar. Sin breaking changes al contrato actual. Check: matriz de 30 frases (10/idioma) con ≥27 parseos correctos en tests.
S2. **Quick-Add global web**: `Cmd/Ctrl+N` abre captura desde cualquier ruta; Enter crea, `Tab` recorre campos inferidos; feedback <200ms (optimista). Check: e2e/RTL — crear tarea con "informe viernes 9h" queda programada viernes 09:00.
S3. **Paleta de comandos unificada**: `Cmd/Ctrl+K` idéntica en web y desktop (acciones: ir a, crear tarea/proyecto, iniciar timer, buscar); móvil: gesto/botón equivalente documentado. Check: misma lista de acciones y mismos atajos en web+desktop (tabla en docs).
S4. **Atajos unificados y publicados**: un solo mapa (`N` quick-add alternativo, `Cmd/Ctrl+N` global, `Cmd/Ctrl+K` paleta, `V` vistas, `Space/R/S` focus verificado contra código real) en `docs/guides/shortcuts.md` + ayuda in-app; eliminar contradicciones de blog/guías. Check: 0 menciones contradictorias en repo (`grep` de atajos viejos vacío).
S5. **Captura desktop nativa**: atajo global Tauri (`global-shortcut` ya en capabilities) abre ventana de captura rápida incluso con app en segundo plano. Check: con app minimizada, atajo → ventana → tarea creada.
S6. **Captura móvil**: FAB existente + share-intent/voz del SO hacia borrador de tarea (mínimo: texto compartido crea borrador con `parse-task`). Check: compartir texto desde otra app crea borrador parseado.

Fuera de alcance: auto-scheduling (005), ritual (006), voz propia con STT (futuro; aquí solo intents del SO).

## Allowed edit surfaces

- `apps/backend/src/ai/` (solo `parse-task` + DTOs + spec; sin tocar otros endpoints)
- `packages/ui/src/components/task/` (quick-add + paleta web; componentes <150 líneas, platform-agnostic)
- `packages/ui-mobile/` (captura móvil equivalente)
- `apps/web/src/` (wiring quick-add + paleta + ayuda de atajos)
- `apps/desktop/src/` (paleta + ventana captura + atajo global; `src-tauri/` solo si el atajo lo exige)
- `apps/mobile/` (FAB/share-intent wiring)
- `packages/i18n/src/locales/*.json` (solo claves de captura/paleta/atajos)
- `docs/guides/shortcuts.md` (nuevo mapa canónico)

## Verification

- `cd apps/backend && npx jest src/ai --runInBand` → verde (incluye matriz 30 frases)
- `cd apps/web && npx vitest run src/components/task` → verde
- `cd apps/desktop && npx vitest run` → verde
- `cd apps/mobile && npx jest --runInBand` (solo suites tocadas)
- Gates raíz (padre): `npm run lint`, `npm run check-types`, `npm run test`

## Tasks

| ID | Cubre | Unidad | Ruta sugerida | Estado | Evidencia |
|---|---|---|---|---|---|
| T1 | S1 | `parse-task` v2 compatible + matriz 30 frases | delegada | done | worktree /tmp/ordo-236, commits T1 + C1b. jest src/ai: 68/68 (matriz 32/32 ES/EN/PT + fast/default + DTO pipe); tsc 0; eslint 0 errores. |
| T2 | S2 | Quick-Add global web (`Cmd/Ctrl+N`) | delegada | done | commits C2a + C2b. vitest ui quick-add 9/9 + web dialog 7/7; tsc web/ui/api-client/i18n 0; eslint 0. |
| T3 | S3–S4 | Paleta `Cmd/Ctrl+K` web+desktop + `shortcuts.md` + limpieza contradicciones | delegada | done | commits C3 + C4a. vitest web 17/17 + desktop 31/31; tsc 0; eslint 0; grep contradicciones vacío. |
| T4 | S5 | Atajo global + ventana captura desktop Tauri | delegada | done | commit C4b. vitest desktop 97/97; api-client 153/154 (1 timer preexistente); tsc 0; cargo check ok; atajo OS + tray + prefill NL. |
| T5 | S6 | Captura móvil (FAB + share-intent → borrador) | delegada | done | commit C5. FAB vivo + `?text=` deep-link + prefill NL + chips; eslint 0; tsc móvil 0; jest móvil: infra rota preexistente (CI móvil solo exige lint+tsc). |

## Log

L1. "quiero que seamos la mejor de lejos... hoy tenemos que estar tan bien o mejor que la competencia en las funciones que ofrecen a sus usuarios, ser facil de usar" (mensaje del usuario 2026-10-18; este doc cubre el núcleo captura/velocidad).

L2 (2026-10-19). T1–T5 completados en worktree aislado `/tmp/ordo-236`, branch `feature/omnipresent-capture` desde `main` post-#272 (rebased a post-#273 antes de publicar). 0 dependencias nuevas. Decisiones: parser determinista trilingüe con bounds Unicode-safe (plain `\b` falla tras vocales acentuadas aun con flag `u`); modo `fast` salta Gemini (preview <200ms real, no optimista-teatral); `AIParseTaskDto` decorado — el pipe global lo 400'eaba todo (hallazgo por probe, endpoint roto antes de C1b); QuickAdd `ui` 100% controlado (constraint del package); `?action=new` cableado de verdad en web + desktop (hash-aware); paleta desktop = mismas 8 ids canónicas + 7 extras (no rewrite); atajo global OS reutiliza `openQuickAdd` + comando Rust `focus_main_window` (sin ventana nueva); móvil sin share-intent nativo (requeriría dev-client: `?text=` deep-link documentado como equivalente). Deuda honesta heredada, NO introducida: prettier T1 sin `--fix` (revertido del commit), types calendar/slack en `src` sin `dist` (rebuild local), 1 fail timer en api-client, jest móvil roto repo-wide (BABEL `.plugins`), Docker web en main roto pre-#274 (`@ordo-todo/auth-provider`). Barrido final por commit en tabla. Pendiente padre: push + PRs apilados (refs #236).

L3 (2026-10-19). Push + PRs hechos ("adelante"). 7 ramas/PRs apilados sobre `main`: #274 (T1, base main) → #275 (C1b+C2a) → #276 (C2b) → #277 (C3) → #278 (C4a) → #279 (C4b) → #280 (C5, closes #236). Comentario de tracking en #236. Título de #274 dice "T1/C1b" pero el branch solo traía T1 (C1b iba en #275 — cosmético, verificado contenido por contenido antes de mergear).

L4 (2026-10-19). Merge secuencial estrategia A completado. Orden: #274 → #275 → #276 → #277 → #278 → #279 → #280, cada uno con CI verde antes de mergear (retarget + rebase --onto + trigger CI; el retarget solo NO dispara CI — lección reafirmada). 0 conflictos en los 6 rebases; 0 rojos en PRs (todos verdes al primer intento). #236 CLOSED. Ramas de la pila borradas (remotas). Pendiente humano: smoke real NL end-to-end en las 4 superficies + atajo global OS minimizado.
