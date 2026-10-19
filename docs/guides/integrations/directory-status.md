# Directory listings status

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 003-T5)

One row per listing: owner, server version supported, last verified
date, live URL when published. Re-verified quarterly (see calendar
below). Publication copy lives in [listing-assets.md](./listing-assets.md).

| Listing | Owner | Server | Status | Last verified | URL |
| ------- | ----- | ------ | ------ | ------------- | --- |
| ChatGPT Directory (plugin) | TBD (growth) | `ordo-mcp 0.1.0` (`/mcp`) | 🟡 `blocked` — needs prod domain + dev account + submit | — | — |
| Claude connectors | TBD (growth) | `ordo-mcp 0.1.0` (`/mcp`) | 🟡 `blocked` — needs prod domain + org account + verify | — | — |
| ClawHub (`ordo-todo/ordo`) | TBD (engineering) | `ordo-mcp 0.1.0` + plugin `0.1.0` | 🟡 code `done`, publish `blocked` — needs npm + clawhub creds + channel test | code 2026-10-19 (13/13 tests, tsc clean) | — |
| Zapier | TBD (growth) | `/v1` + webhooks | 🟡 bridge documented, `blocked` — needs test account + native-vs-bridge decision | — | — |

## Unblock conditions (from ODD 003)

- **T1 ChatGPT**: prod domain live w/ TLS → submit in ChatGPT Work → privacy/terms verified → human install test.
- **T2 Claude**: prod domain live → register/pin connector on org account → fresh-install + auto-refresh verification.
- **T3 ClawHub**: `npm publish` (`@ordo-todo` scope) → `clawhub publish` → `openclaw plugins install ordo-todo/ordo` → real-channel briefing test.
- **T4 Zapier**: test account → run Gmail→task example zap → decide native app vs documented bridge.

## Re-verification calendar

| Quarter | Due | Check |
| ------- | --- | ----- |
| 2027-Q1 | 2027-01-15 | Re-run one install + one tool call per live listing; update this table |
| 2027-Q2 | 2027-04-15 | Same |

(A human owns the calendar invite; this table is the record.)
