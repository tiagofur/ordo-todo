# ODD 020: Rebuild de la app móvil con Tauri 2 (paridad web/desktop)

Issue: sin issue aún (decisión del owner, 2026-10-24, tras el análisis de opciones y el estado del baseline de vulnerabilidades — ver PR #372: los ~27 avisos restantes son todos del clúster Expo 52 de mobile).

Objective: sustituir la app Expo de `apps/mobile` por una app **Tauri 2 mobile** (Android + iOS) que reutilice la capa de datos del monorepo (`api-client`, `stores`, `hooks`, `core`, `auth-provider`, `i18n`) y la pila UI de desktop (React 19 + Vite 7 + react-router 7 + tailwind 4 + i18next), con **paridad funcional y de calidad** respecto a web/desktop. La app Expo queda congelada en `apps/mobile-expo` como referencia de pantallas hasta P5.

Branch: `feat/mobile-tauri` (spike en esta rama; fases siguientes en ramas `feat/mobile-tauri-pN`).
Delivery strategy: un PR por fase (≤400 líneas de código propio; el gen/ nativo generado no se cuenta ni se commitea). Cada fase termina con build instalable y checklist de aceptación verificado en emulador/dispositivo.
Test runner: Vitest (unit, cuando haya lógica propia) · verificación manual en emulador Android (Pixel_10_Pro) y dispositivo/simulador iOS (requiere Xcode completo en el Mac del owner).

## Context (leer primero)

- **Decisión de plataforma (2026-10-24)**: descartadas bare RN (en 2026 la doc oficial empuja Expo incluso para bare; sin Expo te conviertes en tu propio equipo nativo y sigues en RN), Flutter/KMP/nativo (pierden la capa compartida React y añaden lenguaje nuevo en solitario) y PWA (sin presencia en stores). Elegido **Tauri 2 mobile** (espejo del salto Electron→Tauri del desktop); **Capacitor es el plan B** si el spike/P1 tropieza con notificaciones o biometría en iOS.
- **Stack destino** (clonado de `apps/desktop`): Vite 7 + React 19 + react-router 7 + tailwind 4 (`@tailwindcss/vite`) + i18next 25 + tanstack-query 5 (P1+) + zustand (P2+). Puertos: dev 1421 (desktop usa 1420).
- **Capa de datos compartida** (ya funciona hoy en la app Expo): `@ordo-todo/api-client` (axios), `@ordo-todo/stores`, `@ordo-todo/hooks`, `@ordo-todo/core`, `@ordo-todo/auth-provider`, `@ordo-todo/i18n`. El backend ya tiene CORS allowlist para orígenes Tauri (`tauri://localhost`, `http://tauri.localhost` — ver `apps/backend/src/main.ts`) y deep link OAuth `ordo://auth/callback` (`apps/backend/src/auth/auth.controller.ts`), que usa hoy el desktop (`apps/desktop/src/hooks/useDeepLinks.ts`, `components/auth/OAuthCallbackHandler.tsx`).
- **Capacidades nativas requeridas** (inventario de la app Expo): notificaciones LOCALES del timer en background (`scheduleNotificationAsync`; el backend NO envía push remotas — no hay SDK de push en backend), biometría (`expo-local-authentication`), haptics, quick actions, OAuth con navegador del sistema + deep link, splash, app icons `dev.creapolis.ordotodo`.
- **Toolchain local (24-oct-2026)**: NDK 28.2.13676358 + cmdline-tools + licencias instalados; targets Rust `aarch64-linux-android`, `armv7-linux-androideabi`, `i686-linux-android`, `x86_64-linux-android`; JAVA 25 = JBR de Android Studio (`/Applications/Android Studio.app/Contents/jbr/Contents/Home`); AVD `Pixel_10_Pro`. **iOS bloqueado**: solo Command Line Tools, sin Xcode completo → instalar Xcode (acción del owner) para P5/iOS.
- **App Expo congelada**: `apps/mobile-expo` (`@ordo-todo/mobile-expo`), excluida del test raíz y de CI. Borrar en P5.
- Gotchas: dists de paquetes antes de typecheck SI se importan por `main` (aquí se importan por `paths`→`src`, así que no hace falta); el `gen/` nativo no se commitea; primera build Android descarga Gradle+deps (~1-2 GB); el emulador necesita arrancar antes de instalar.

## Fases

### P0 — Spike validado (ESTE PR)

Scaffold `apps/mobile` (Tauri 2 + Vite + React + tailwind 4) con pantalla validadora de 5 checks. **Aceptación**: APK debug instalado en el emulador; app renderiza; notificación inmediata recibida; **notificación programada a 5 s recibida con la app en background** (el caso real del timer); scroll de 200 filas sin cortes; `openUrl` abre el navegador del sistema; typecheck en verde. Riesgo iOS: sin Xcode no se valida aquí — el código Tauri es común; validar en cuanto el owner instale Xcode.

### P1 — Auth completa (MERGEADA — PR feat/mobile-p1)

Login/registro in-app con `api-client`+`auth-provider` (mismo flujo JWT que desktop), OAuth Google/GitHub vía navegador del sistema + deep link `ordo://` (scheme con `tauri-plugin-deep-link`), sesión persistente (localStorage del webview; upgrade a `tauri-plugin-store` opcional), logout y refresh. **Fix de backend necesario descubierto en P1**: el redirect a `ordo://` era inalcanzable con proveedor real porque el `state` no se propagaba — nuevo `OAuthPlatformGuard` (google/github) que envía `state=platform` en el authorize (NullStore de passport-oauth2 no lo verifica, misma política aceptada de desktop; PKCE via `PkceService` como mejora futura). **Aceptación cumplida**: registro por API con código de invitación consumido; login UI→backend; deep link ordo://auth/callback con tokens reales del backend → sesión (warm y cold start); sesión sobrevive reinicio de app; refresh automático tras 401 (interceptor del client). **P1-b (deuda)**: biometría (plugin community `tauri-plugin-biometric` + fallback a login normal) y OAuth con pantalla real del proveedor (requiere credenciales reales en `.env`; el mecanismo deep link quedó validado con tokens reales).

### P2 — Tasks core offline-friendly

Lista Hoy/Próximas, detalle, crear/editar/completar con `react-hook-form`+`zod` (validations del monorepo), campos personalizados, time blocking. Tanstack-query con caché persistida (lectura offline), react-router vuelve (con manejo del botón atrás Android). **Aceptación**: CRUD completo contra backend; la app muestra datos en frío sin red.

### P3 — Timer/focus con notificaciones en background

Paridad con ODD 014/015/016 (motor backend-owned, `useTimerBackend`, skip sin crédito, persistencia de fase): pantalla timer, contador wall-clock, notificación local al acabar fase **con app cerrada**, haptics al cambiar de fase. **Aceptación**: pomodoro completo con la app en background dispara notificación y el contador del backend cuadra.

### P4 — Paridad del resto

Notas (muro), ritual (mañana/tarde), proyectos, analytics/dashboard, perfil/ajustes, menciones y navegación, quick actions (iOS/Android shortcuts). **Aceptación**: checklist pantalla a pantalla contra `apps/web` (mismas historias que la app Expo implementaba).

### P5 — Release

Iconos/producto finales, signing Android (keystore) + iOS (requiere Xcode del owner), CI de builds (o procesos manuales documentados), TestFlight/Play internal testing, **borrar `apps/mobile-expo`** y con ello cerrar el clúster de vulnerabilidades Expo (baseline audit → 0 fuera de riesgo aceptado). **Aceptación de seguridad (del review del spike)**: CSP restrictiva en `tauri.conf.json` (hoy `null` por el spike), capabilities por-ventana en vez de `"windows": ["*"]`, y revisión de permisos de los plugins activos — sin esto no hay release.

## Riesgos abiertos

- Plugin de notificaciones: `schedule()` en Android con battery optimizations (probado en P0 con `allowWhileIdle`); en iOS requiere validación con Xcode.
- Biometría: plugin community (`tauri-plugin-biometric`) — validar en P1; fallback: login normal.
- Scroll/gestos webview: si el tacto no convence en P2, plan B documentado = Capacitor reutilizando el mismo código React.
- **Socket.io en webview** (la app Expo lo usaba para notificaciones y timer en vivo — `use-notifications-socket.ts`, `use-timer-backend.ts`): el WebSocket se suspende en background (crítico en iOS/WKWebView). P2/P3 deben incluir reconexión y sync-on-foreground como criterio de aceptación.
- **Deep link `ordo://` en cold start** (P1): con la app cerrada, el intent/scheme llega al arrastre — verificar `tauri-plugin-deep-link` en Android (intent-filter) e iOS (custom scheme) ambos escenarios: warm y cold.
- **Botón atrás de Android con react-router** (P1/P2): el back físico debe navegar el historial del router y no cerrar la app (clásico de webview); probar en P1.
