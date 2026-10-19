# @ordo-todo/openclaw-plugin

Official Ordo plugin for [OpenClaw](https://openclaw.ai): operate your
tasks, projects, habits and goals from WhatsApp, Telegram, Discord or
any OpenClaw channel.

## Install

From ClawHub (recommended, once published — see ODD 003):

```bash
openclaw plugins install ordo-todo/ordo
```

From a local checkout:

```bash
openclaw plugins install ./packages/openclaw-plugin
```

## Configure

Set your Ordo token (create one at Ordo → Settings → API tokens,
scopes `read` + `tasks:write` recommended):

```jsonc
// openclaw.json
{
  "plugins": {
    "entries": {
      "ordo": {
        "config": {
          "token": "ordo_pat_...",
          // "serverUrl": "https://ordotodo.app/mcp"  (default)
        }
      }
    }
  }
}
```

Or export `ORDO_TOKEN` in the gateway environment.

## Tools

| Tool | What it does |
| ---- | ------------ |
| `ordo_today` | Due/overdue tasks + habits left |
| `ordo_task_create` | Create a task (`title`, `projectId`, …) |
| `ordo_task_done` | Complete a task by id |
| `ordo_habits` | Today's habits + status |
| `ordo_plan_day` | Full briefing: me + tasks + habits + objectives |

Plus the `/ordo` command (day briefing) and the `ordo-day` skill
(guided planning flow).

## Develop

```bash
npm --workspace @ordo-todo/openclaw-plugin run test
npm --workspace @ordo-todo/openclaw-plugin run check-types
npm --workspace @ordo-todo/openclaw-plugin run build
openclaw plugins inspect ordo --runtime --json
```

## Publish (maintainers)

```bash
npm pack --pack-destination /tmp   # verify files
npm install -g clawhub && clawhub login
clawhub publish --dry-run && clawhub publish
openclaw plugins install ordo-todo/ordo
```
