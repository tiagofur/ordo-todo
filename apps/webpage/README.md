# Ordo Webpage (marketing site, Next.js)

Public site: landing, pricing, FAQ, changelog, roadmap, guides (`/guide/connect/*` for agent integrations) and blog. Trilingual (es/en/pt-br) via `next-intl` (`src/messages/*.json`).

## Status

In development. Marketing copy follows the honesty rules in `docs/vision/promises-audit.md` (no unshipped claims without a beta/vision mark).

## Get started (from the repo root)

```bash
npm install --legacy-peer-deps
npm run dev --filter=@ordo-todo/webpage
# http://localhost:3000
```

Run inside `apps/webpage/`:

- `npm run dev` — dev server
- `npm run build` — production build (3 locales)
- `npm run lint` — eslint

## Links

- [Repo README](../../README.md) · [Roadmap](../../docs/planning/roadmap.md) · [Promises audit](../../docs/vision/promises-audit.md)
