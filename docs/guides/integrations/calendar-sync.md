# Calendar sync — how it works + honest limits

> **Última actualización**: 2026-10-19
> **Estado**: 🚧 En desarrollo (ODD 010-T4)

Bidirectional sync between Ordo tasks and Google Calendar + Outlook.
Design honest about what it does, what it costs in quota, and what it
will never do.

## 📋 Índice rápido

- [Direction 1: Ordo → provider](#direction-1-ordo--provider)
- [Direction 2: provider → Ordo](#direction-2-provider--ordo)
- [Conflicts](#conflicts)
- [Quotas and incremental sync](#quotas-and-incremental-sync)
- [What Ordo never does](#what-ordo-never-does)
- [Settings reference](#settings-reference)

---

## Direction 1: Ordo → provider

Only tasks **with a `dueDate`** sync (no date → skipped, no event).
One event per (task, provider, calendar), tracked in
`CalendarEventMapping` with a content hash (`lastSyncedHash`).

- Create → `POST .../events`; existing mapping → `PATCH`.
- Completed tasks are marked per `completedFormat` (`prefix` default:
  `✅ title`; `suffix`; `none`).
- Task deletion: `onDelete: delete` (default) removes the provider
  event; `keep` leaves it. The mapping row is always removed.
- Target calendar per project: `project.settings.calendar.calendarId`
  (`primary` default); integration-level settings can override.

## Direction 2: provider → Ordo

Provider events import as `ExternalCalendarBlock` rows ("busy"
information consumed by scheduling, ODD 005) — **never as tasks**
unless the user explicitly opts in with `importAsTasks: true` **and**
`importProjectId`. Missing project → block imported, zero tasks.

- 30-day forward window, paged (`maxResults: 250` Google, `$top: 100`
  Graph).
- Skipped: cancelled events, all-day events without times, and Ordo's
  own events (echo prevention via mapping table + `ordoTaskId`
  extended property).

## Conflicts

Each push/pull compares live state on both sides against
`lastSyncedHash`:

| Local | Remote | Result |
| ----- | ------ | ------ |
| unchanged | unchanged | no-op |
| changed | unchanged | push wins |
| unchanged | changed | pull wins |
| **changed** | **changed** | **conflict**: newest `updatedAt` wins (last-write-wins), recorded in the integration settings log (`settings.conflicts`, last 20) |

Conflicts surface in `GET /integrations/calendar/status` so the UI
shows them; manual resolution = edit either side (next sync detects
single-sided change and converges).

## Quotas and incremental sync

| Provider | Mechanism | Cost per sync |
| -------- | --------- | ------------- |
| Google | `events.list` paged (30-day window); `syncToken` incremental is a follow-up (tokens persisted per integration, see below) | 1 call/250 events + 1 per changed event |
| Microsoft | `calendarview` paged; `$deltatoken` incremental is a follow-up | 1 call/100 events + 1 per changed event |

- Initial sync of a 500-event account: ~3 list calls + mapping
  writes — far under Google's 1M queries/day and Graph's per-app
  limits.
- Sync tokens persist in `integration.settings.syncToken` /
  `deltaLink` once incremental mode lands (follow-up; current pull
  is full-window paged, cheap enough at these volumes: a 500-event
  account costs ~3 list calls).
- All provider calls: 15s timeout, failures logged with the account
  flagged `error` (visible in status), retries with backoff on the
  next scheduled run — never tight loops.

## What Ordo never does

- Apple Calendar bidirectional (no API exists; `.ics` subscription
  is the honest maximum — read-only by design).
- Invite attendees or manage guests on provider events.
- Create or join video meetings (Meet/Teams links untouched).
- Exotic recurrences the provider can't represent (RRULE passthrough
  only where the provider supports it; otherwise single instance +
  note in description).
- Ghost tasks: nothing becomes a task without explicit opt-in.
- Delete provider events it did not create (except by explicit
  `onDelete: delete` on Ordo-owned mappings).

## Settings reference

Merged as `integration.settings` ← `project.settings.calendar`:

```jsonc
{
  "calendarId": "primary",       // target provider calendar
  "completedFormat": "prefix",   // prefix | suffix | none
  "onDelete": "delete",          // delete | keep
  "importAsTasks": false,        // opt-in: provider → tasks
  "importProjectId": null        // required when importAsTasks
}
```

Account status for UIs: `GET /integrations/calendar/status` →
`[{provider, status, email, lastSyncAt, conflicts}]` with status in
`ok | error | re-auth-required | never-synced`.

## 📚 Referencias

- ODD: `odd/tasks/010-calendar-sync.md` · API: `docs/reference/api-reference.md`
