# Slack integration — setup + scopes + limits

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 011-T5)

Ordo lives inside Slack without cloning it: actionable notifications,
task creation from any message, focus status sync and daily digests
where the team already works. Ordo is the source of truth; Slack is
the channel.

## 📋 Índice rápido

- [Setup](#setup)
- [Scopes (minimal)](#scopes-minimal)
- [What the integration does](#what-the-integration-does)
- [Security model](#security-model)
- [Limits (honest)](#limits-honest)
- [API endpoints](#api-endpoints)

---

## Setup

1. **Slack app**: create an app at api.slack.com with:
   - OAuth redirect URL: `https://ordotodo.app/api/v1/slack/oauth/callback`
   - Event subscriptions → `https://ordotodo.app/api/v1/slack/events`
     (`app_uninstalled`, `tokens_revoked`)
   - Interactivity → `https://ordotodo.app/api/v1/slack/interactions`
   - Slash command `/ordo` → `https://ordotodo.app/api/v1/slack/commands`
   - Message action "Create task in Ordo" → interactions URL
   - Bot scopes from the table below
2. **Env**: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`,
   `SLACK_REDIRECT_URI`, `SLACK_SIGNING_SECRET`.
3. **User flow**: Settings → Slack → Connect → browser approve →
   back to settings. Channel↔project mapping + daily summary and
   focus toggles per team.

## Scopes (minimal)

| Scope | Why |
| ----- | --- |
| `chat:write` | Post notifications, digests, ephemeral replies |
| `chat:write.public` | Post to channels the app joined via mapping |
| `commands` | `/ordo` slash command |
| `users:read` | Resolve Slack user identity on mapping |
| `users.profile:read` | Read current status (before focus sync) |
| `users.profile:write` | Set/clear `:tomato:` focus status |
| `channels:read`, `groups:read`, `im:read` | List channels for mapping UI |

No `admin.*`, no message history reads, no file access.

## What the integration does

- **Notifications**: task due/assigned/mentioned → DM or mapped
  channel with 3 buttons (Complete, Postpone to tomorrow, View).
  Button values are HMAC-signed (`taskId.timestamp.hmac`, 7-day
  expiry); tampered/expired callbacks → 401, no action.
- **Create from Slack**: message action "Create task in Ordo" +
  `/ordo create <words>` (NL via `parse-task`), `/ordo today`.
  Created tasks link back to the Slack message.
- **Focus status** (explicit opt-in per team): pomodoro start →
  `:tomato: foco hasta HH:MM` (+ optional DND snooze); pause/stop →
  status cleared, snooze ended. Opt-out → zero calls.
- **Daily digest** (opt-in per team + hour UTC): open + recently
  completed tasks posted to the mapped channel by an hourly cron.

## Security model

- Every inbound request verified: HMAC-SHA256 `v0:timestamp:body`
  against `X-Slack-Signature`, 5-minute replay window, timing-safe
  compare (`SlackSignatureGuard`). Missing/stale/forged → 401.
- Slack user → Ordo user resolved per request from the workspace
  map; unknown pairs rejected, never auto-provisioned.
- `app_uninstalled` wipes all team mappings; per-team uninstall
  removes mappings + grant. Revoked tokens fail closed (no retry
  storms).
- Bot tokens live in `UserIntegration` (provider SLACK); channel ↔
  project + toggles in `SlackWorkspaceMap`.

## Limits (honest)

- No Slack-native chat in Ordo and no Ordo Lists/Canvas storage —
  by design (complementary, not a clone).
- No Teams/Discord (future).
- Focus status clearing wipes whatever status the user had (Slack
  keeps no history) — documented in settings copy.
- Digest hour is UTC; per-user timezones are a follow-up.
- Rate limits: Slack Web API tiered limits respected via the SDK's
  built-in retry; digest/notifier catch and log per-delivery
  failures without blocking others.

## API endpoints

| Method & path | Auth | Does |
| ------------- | ---- | ---- |
| `POST /slack/install` | JWT | Returns install URL + state |
| `GET /slack/oauth/callback` | public (code) | Exchanges code, redirects to settings |
| `DELETE /slack/team/:teamId` | JWT | Clean uninstall |
| `GET /slack/teams` | JWT | Teams + mappings for settings UI |
| `PATCH /slack/mappings/:id` | JWT | channel/project/summary/focus settings |
| `POST /slack/events` | Slack signature | Events API (handshake, uninstall) |
| `POST /slack/interactions` | Slack signature | Buttons + message actions |
| `POST /slack/commands` | Slack signature | `/ordo` router |

## 📚 Referencias

- ODD: `odd/tasks/011-slack-integration.md` · User guide: `/guide/connect/slack`
