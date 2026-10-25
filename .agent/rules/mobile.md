# Mobile Rules (Tauri 2)

**Specific rules for `apps/mobile/` (Tauri 2 + React, Android/iOS — ODD 020)**

The mobile app is **not** a separate UI stack: it renders the same React 19 + Vite + React Router + Tailwind 4 frontend as `apps/desktop`, and reuses the monorepo data layer (`api-client`, `stores`, `hooks`, `core`, `auth-provider`, `i18n`). The authoritative build/run instructions and toolchain gotchas live in [CLAUDE.md](../../CLAUDE.md) ("Mobile (Tauri)" section) and [odd/tasks/020-mobile-tauri.md](../../odd/tasks/020-mobile-tauri.md).

## 📱 Core Principles

### 1. Reuse before you write

- UI comes from `packages/ui` and the shared desktop screens; data comes from `packages/{api-client,stores,hooks}`.
- Mobile-specific code lives only at the platform boundary (Tauri plugins, deep links, notifications, store). If a feature needs new UI logic, add it to the shared packages so desktop and web benefit too.

### 2. Thin platform boundary

- Native capabilities go behind adapters (see the notification adapter pattern), never inline in React components.
- Anything browser-specific (storage, share, push) must go through the Tauri plugin API with a web fallback, so the same component keeps working on desktop and web.
- Mobile never imports `packages/db` (Prisma): everything goes through the REST API.

### 3. Responsive, not "mobile-only"

- The same screens render on desktop windows and phones: always check narrow layouts and safe areas.
- No gestures or navigation patterns that break keyboard/mouse usage on desktop.

### 4. Security gate before release

- Restrictive CSP in `tauri.conf.json`, per-window capabilities (never `"windows": ["*"]`), and a review of active plugin permissions are release blockers (ODD 020 / P5).

## ✅ Quality Checks

1. `npm run build` in `apps/mobile` (Vite) passes; `npm run check-types` is enforced in CI (`mobile` job).
2. Rust side compiles for Android targets (toolchain per CLAUDE.md: rustup toolchain first in PATH, NDK, `JAVA_HOME` from Android Studio's JBR).
3. After touching plugins, deep links or alarms: smoke test on the Android emulator. Known gotchas: `adb root` drops port reverses, force-stop cancels scheduled alarms, `cancel()` on notifications also removes delivered ones.
