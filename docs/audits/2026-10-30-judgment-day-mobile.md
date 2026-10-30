# Judgment Day — Auditoría de la app mobile (ledger congelado)

- **Fecha**: 2026-10-30
- **Target identity (sha256 de `git archive HEAD apps/mobile`)**: `ffc116ba515c3fa96cba5028b09e6e0bb310f28ddf0e0102baaf0411a43d625d`
- **Commit congelado**: `0fec8df9c633cd991c2f5173b8115d9b7be8f09f` (main; apps/mobile limpio)
- **Scope congelado**: `apps/mobile/**` — con una extensión deliberada documentada: defectos de paridad cuya causa raíz es un gate móvil (`isMobile()`, `VITE_ORDO_PLATFORM`, `platform === 'mobile'`) en `apps/desktop/src` pueden reportarse con localización en desktop, porque mobile renderiza EL MISMO frontend que desktop (alias `@/` → `../desktop/src`, decisión ODD 020 P4) y su comportamiento lo deciden esos gates. Resto de desktop, backend, web y paquetes: fuera de scope (solo verification reads).
- **Skill resolution**: `paths-injected` — `impeccable` como criterio en ambos jueces.
- **Método**: dos jueces ciegos read-only, prompts idénticos; fusión por el orquestador.
- **Ronda**: 1 — sin corrección (0 severos; nada elegible para el fix actor).

## Resumen

| Estado | Total | Detalle |
|---|---|---|
| Confirmados (ambos jueces, severos) | **0** | — |
| Confirmados por ambos, no severos → info | 4 | KMO-I01 … KMO-I04 |
| Sospechosos (un solo juez) | 4 | 0 CRITICAL, 0 WARNING, 4 SUGGESTION |
| Contradicciones | 0 | — |

**Sin ningún hallazgo CRITICAL ni WARNING en ningún juez.** El mayor riesgo móvil del audit anterior (KDE-001) no aplica aquí: mobile SÍ registró su mitad del deep-link `ordo://` (plugin + intent filter en el manifest + listener propio), y los jueces verificaron que no hay doble manejo con el listener desktop (gate `isDesktop()`).

## Info (confirmados por ambos jueces; no severos)

| ID | Severidades | Localización | Hallazgo |
|---|---|---|---|
| KMO-I01 | SUGG/SUGG | `apps/mobile/src/App.tsx:27-38` | Toasts OAuth del shell móvil hardcodeados en español ("Sesión iniciada correctamente", etc.) pese a la app trilingüe (desktop hermano los tiene en inglés fijo). |
| KMO-I02 | SUGG/SUGG | `apps/mobile/src/lib/deep-links.ts:33-44` | Sin dedupe por URL del callback OAuth (cold start getCurrent + live onOpenUrl pueden entregar dos veces → doble toast/navegación); el handler es idempotente y el hermano desktop sí tiene processedUrls ref. Edge case: recreación de Activity manteniendo proceso re-entrega el intent. |
| KMO-I03 | SUGG/SUGG | `apps/desktop/src/pages/Profile.tsx:23` (gate) | Defecto de gate de paridad: Profile usa `isNative()` (true en mobile) en vez de `isDesktop()` → en Android se renderiza el bloque "Desktop Settings" (autostart, Floating Timer, updates) cuyo handlers son no-ops silenciosos, y el About muestra versión '1.0.0' (fallback del bridge; real 0.1.0) y 'Engine: WebKit / Safari Nitro' falso en el WebView Chromium de Android. |
| KMO-I04 | SUGG/SUGG | `apps/mobile/src-tauri/tauri.conf.json:21-23` + `apps/mobile/index.html` | Sin CSP en absoluto: `csp: null` y sin meta CSP en index.html — mientras que el desktop hermano sí lleva meta CSP estricta en su index.html. Tokens OAuth viven en localStorage+store dentro del webview sin esa capa. Sin sink HTML explotable encontrado → hardening, no explotable. |

## Sospechosos (un solo juez, SUGGESTION)

| ID | Juez | Localización | Hallazgo |
|---|---|---|---|
| KMO-S01 | B | `apps/desktop/src/pages/Settings.tsx:39,200-206,1062-1150` | La pestaña "Escritorio" de Settings se lista sin filtro de plataforma → en Android: switches que fallan en silencio (setAutostart/toggleMiniTimer devuelven false), botón de updates falso que toastea "Ordo está actualizado", versión/motor incorrectos (misma familia que KMO-I03 pero en Settings). |
| KMO-S02 | B | `src-tauri/gen/android/.../TauriActivity.kt:15` | **CORREGIDO 30-oct (post-audit, a petición del owner, sin commit)**: `handleBackNavigation` ahora `true` → WryActivity registra su callback: webview `goBack()` con el historial del hash router y salida estándar solo en la raíz. OJO: el fichero vive en `gen/` (gitignored, NO está en ningún patch) — si se ejecuta `tauri android init` hay que reaplicar el flip (comentario dejado en el propio fichero). No se puede mover a MainActivity porque TauriActivity redeclara el val sin `open`. APK `ordo-mobile-debug.apk` reconstruido con el fix. |
| KMO-S03 | B | `apps/mobile/src-tauri/capabilities/default.json` | Capabilities por defecto en vez de least-privilege: `windows: ["*"]`, `opener:default` concede `allow-reveal-item-in-dir` (sin sentido en Android), `store:default` concede clear/reset/entries que no se usan. Sin caller que abuse. |
| KMO-S04 | A | `apps/mobile/vite.config.ts:49-52` | Bundle `esnext` (sin transpilar optional chaining etc.) contra `minSdk 24`: un WebView de fábrica sin actualizar en Android 7 no parsea la sintaxis → pantalla blanca en carga en vez de fallo elegante. |

## Contabilidad de paridad mobile vs desktop (evidencia de ambos jueces, convergente)

**Funciona idéntico en mobile** (verificado por ausencia de gates + wiring):
- Auth email/password + **OAuth completo** (navegador del sistema → intent filter ordo:// → listener móvil → tokens al store dual (auth_store.bin + localStorage) → dashboard; `platform=mobile` en el arranque OAuth; sin doble manejo con desktop).
- **Tasks CRUD completo** + subtareas + comentarios + adjuntos, proyectos/workspaces/trash/tags/goals/hábitos/notas/meetings — cero gates, mismo bundle (validado en emulador 26-oct contra producción).
- Notificaciones nativas (plugin) + campana REST; alarma deadline SOLO móvil (by design); timer pomodoro compartido; offline/sync stub compartido (paridad de stub); i18n es/en/pt-br con switcher; theming idéntico; MobileBottomNav + drawer con las mismas navSections que el Sidebar desktop; a11y básica en la nav móvil.

**Apagado en mobile (by design, shell de escritorio)**: TitleBar, tray, mini-timer flotante, badge, autostart, shortcuts globales, QuickActionsOverlay. **Defectos de paridad reales** (todos SUGGESTION): KMO-I03/KMO-S01 (secciones desktop muertas en Profile/Settings con datos falsos), KMO-S02 (botón atrás mata la app).

## Notas del orquestador

- Ambos jueces verificaron la cadena de tokens Android: dual-write store+localStorage, ProtectedRoute lee localStorage, la carrera de Store.load en cold start degrada a localStorage-only sin pérdida de sesión.
- `gen/` está gitignored y se regenera (documentado en README) — no se trata como finding; el manifest actual del audit refleja la última regeneración.
- El deep-link móvil ya llevaba el esquema registrado ANTES del fix de desktop (ODD 020) — la mitad móvil de KDE-001 nunca estuvo rota.

## Veredicto terminal

```yaml
target_identity: ffc116ba515c3fa96cba5028b09e6e0bb310f28ddf0e0102baaf0411a43d625d (commit 0fec8df9, apps/mobile + gates móviles en apps/desktop)
round: 1
confirmed_severe: []
suspect: [KMO-S01..KMO-S04]         # 4 SUGGESTION, sin auto-fix
info: [KMO-I01..KMO-I04]            # 4 corroborados no severos
contradictions: []
fix_work_units: []                  # nada elegible: 0 severos
scoped_rejudgment: not_run
terminal_state: approved
skill_resolution: paths-injected
```

**JUDGMENT: APPROVED ✅**
