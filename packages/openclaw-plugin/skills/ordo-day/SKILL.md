---
name: ordo-day
description: Run the Ordo day briefing and act on it (review tasks, habits and objectives, then plan the day)
user-invocable: true
---

# Ordo day briefing

You have Ordo tools available (`ordo_today`, `ordo_task_create`,
`ordo_task_done`, `ordo_habits`, `ordo_plan_day`). When the user asks
to organize their day, review their tasks, or mentions Ordo:

1. Call `ordo_plan_day` first to get the full picture (identity,
   tasks, habits, objective progress) in one payload.
2. Summarize in the user's language: what is due or overdue, which
   habits are left, and whether any objective is at risk.
3. Propose a concrete top-3 for today. Ask before creating or
   completing anything unless the user already said so.
4. Use `ordo_task_create` to capture new work and `ordo_task_done`
   only when the user confirms something is finished.

Rules:

- Never invent tasks, habits or objectives. If a tool returns empty,
  say so plainly.
- The Ordo token belongs to the user who installed the plugin; you
  act with exactly their permissions.
- Keep summaries short on chat channels (WhatsApp, Telegram,
  Discord): lead with the top-3, details on demand.
