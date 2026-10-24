# Ordo Mobile App (Expo)

Ordo for iOS/Android: tasks, capture, timer, calendar, ritual and notifications, sharing types and hooks with the monorepo (`@ordo-todo/*`).

## Status

In development alongside web/desktop. Offline support is partial (see `docs/guides/platform-parity.md` once ODD 013 lands it); push + socket notifications work.

## Get started (from the repo root)

```bash
npm install --legacy-peer-deps
npx expo start --config apps/mobile/app.json
```

Run inside `apps/mobile/`:

- `npm start` — Expo dev server
- `npm run android` / `npm run ios` — native builds
- `npm run lint` — eslint on `app/`
- `npx jest` — unit tests (some suites depend on the shared babel workaround, see `babel.jest.js`)

## Links

- [Repo README](../../README.md) · [Roadmap](../../docs/planning/roadmap.md) · [Shortcuts](../../docs/guides/shortcuts.md)
