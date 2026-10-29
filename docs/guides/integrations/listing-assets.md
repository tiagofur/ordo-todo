# Directory listings — publication assets

> **Última actualización**: 2026-10-29
> **Estado**: 🚧 En desarrollo (ODD 003 + ODD 023)

Ready-to-submit copy for the four directory listings. Production is
live on the final domains (web `ordotodo.app`, API `api.ordotodo.app`),
verified against the running MCP metadata on 2026-10-29; the ChatGPT
connection itself was human-tested end-to-end (MCP + OAuth) the same
week. Still pending for submission: verified OpenAI developer identity,
support email, and the review material in
[chatgpt-review-kit.md](./chatgpt-review-kit.md).

## Shared facts (all listings)

| Field             | Value                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product           | Ordo — tasks, projects, habits, goals                                                                                                                                                       |
| MCP endpoint      | `https://api.ordotodo.app/mcp` (Streamable HTTP, stateless)                                                                                                                                 |
| Auth              | OAuth 2.1 (code + S256 PKCE) + PAT (`ordo_pat_...`)                                                                                                                                         |
| Resource metadata | `https://api.ordotodo.app/.well-known/oauth-protected-resource` (RFC 9728)                                                                                                                  |
| AS metadata       | `https://api.ordotodo.app/.well-known/oauth-authorization-server` (RFC 8414)                                                                                                                |
| Scopes            | `read`, `tasks:write`, `projects:write`, `admin:webhooks`                                                                                                                                   |
| Tools exposed     | 18 (`ordo_ping`, `ordo_search`, `ordo_task_*` ×5, `ordo_project_*` ×4, `ordo_comment_add`, `ordo_habit_*` ×2, `ordo_objective_progress`, `ordo_me`, `ordo_day_plan`, `ordo_day_plan_apply`) |
| Privacy           | Agent sees only what the token owner can; no training on user data; revoke = immediate 401                                                                                                  |
| Docs              | `https://ordotodo.app/guide/connect` (+ per-client guides)                                                                                                                                  |
| Support           | `support@[business-domain]` — NOT VERIFIED; business must provide the real address before publishing                                                                                        |

## 1. ChatGPT Directory (T1) — `blocked` (submission material ready, ODD 023)

- **Name**: Ordo
- **Tagline**: Your tasks, projects and habits — organized by chat.
- **Description (long)**: Connect Ordo to ChatGPT to organize your day, create tasks and review progress without leaving the conversation. Ordo exposes 18 tools over a remote MCP server with OAuth: search, tasks, projects, comments, habits, objectives, day planning and identity. You approve once in the browser; ChatGPT then acts with exactly your permissions. Revoke anytime from Ordo settings.
- **Category**: Productivity
- **Scopes requested**: `read`, `tasks:write`, `projects:write` (+ why: read your work / create-update tasks / manage projects).
- **Privacy URL**: `https://ordotodo.app/privacy` (exists, verified 2026-10-29)
- **Terms URL**: `https://ordotodo.app/terms` (exists, verified 2026-10-29)
- **Setup guide link**: `https://ordotodo.app/guide/connect/chatgpt`
- **Plugin package**: `packages/chatgpt-plugin/` (manifest Agent Plugins 1.0.0 + `mcp.json` + skills `ordo-day`/`ordo-review`); ZIP recipe y checklist en su README.
- **Review material**: `docs/guides/integrations/chatgpt-review-kit.md` (5 casos + / 3 −, release notes, shot-list).
- **BLOCKED ON**: (a) verified OpenAI developer identity in the org; (b) domain challenge token in `OPENAI_APPS_CHALLENGE_TOKEN` during the portal flow; (c) support email; (d) demo account + video recorded from the kit; (e) submit.

## 2. Claude connectors (T2) — `blocked`

- **Name**: Ordo
- **Tagline**: Plan your day with Claude, backed by your real Ordo data.
- **Description**: Add Ordo as a Claude connector (web, desktop, Code). Claude reads your tasks, proposes the day plan and executes with you — funded by the same OAuth grant you approve in one browser step. Zero manual configuration; member just presses Connect.
- **Setup**: owner pastes `https://api.ordotodo.app/mcp` once; members Connect + browser-approve.
- **CLI**: `claude mcp add --transport http ordo https://api.ordotodo.app/mcp`
- **Setup guide link**: `https://ordotodo.app/guide/connect/claude`
- **BLOCKED ON**: (a) canonical production domain live; (b) org account to register/pin the connector; (c) human verification: fresh claude.ai install + Claude Code (`/mcp` shows ordo connected, token auto-refresh observed).

## 3. ClawHub — plugin + Skill (T3) — code `done`, publish `blocked`

Package: `packages/openclaw-plugin/` (`@ordo-todo/openclaw-plugin@0.1.0`).

- **Manifest**: `openclaw.plugin.json` (`id: ordo`, 5 tools in `contracts.tools`, `configSchema` with `token` required).
- **Tools**: `ordo_today`, `ordo_task_create`, `ordo_task_done`, `ordo_habits`, `ordo_plan_day` (+ `/ordo` command).
- **Skill**: `skills/ordo-day/SKILL.md` (`name: ordo-day`, `user-invocable: true`).
- **Tests**: 13/13 vitest green; `tsc --noEmit` clean; entry loads (`ENTRY-LOADS: object`); `npm pack --dry-run` verified (manifest + dist + skill included).
- **Publish runbook** (maintainers, needs npm + ClawHub credentials):
  ```bash
  npm --workspace @ordo-todo/openclaw-plugin run build
  openclaw plugins inspect ordo --runtime --json
  npm pack --pack-destination /tmp  # from packages/openclaw-plugin
  npm install -g clawhub && clawhub login
  clawhub publish --dry-run && clawhub publish
  openclaw plugins install ordo-todo/ordo
  ```
- **Verify**: "organiza mi día con Ordo" over WhatsApp/Telegram/Discord returns the real day briefing.
- **BLOCKED ON**: (a) npm publish credentials for `@ordo-todo` scope; (b) `clawhub login` (account); (c) human end-to-end test over a real channel.

## 4. Zapier (T4) — `blocked` (bridge documented as acceptable minimum)

Full native app is out of scope for this unit; the accepted minimum
(S4) is the documented bridge + working example zap:

- **Bridge doc**: `docs/guides/integrations/zapier-bridge.md` + user guide `/guide/connect/zapier`.
- **Example zap**: Gmail important email → `POST /v1/tasks` (PAT `tasks:write`).
- **Reverse direction**: `POST /v1/subscriptions` → Catch Hook with HMAC verification snippet.
- **BLOCKED ON**: (a) Zapier test account to execute the example zap end-to-end; (b) decision: native Zapier app (developer platform, OAuth app registration) vs keeping the documented bridge as the supported path.
