---
name: ordo-day
description: Organize the user's day with Ordo — review what is due or overdue, today's habits and objective progress, then propose a concrete plan and apply it after approval. Use when the user asks to organize or plan their day, prepare for tomorrow, decide what to focus on, or mentions their Ordo day.
---

# Ordo day organizer

Use this skill when the user wants their day organized or planned with
Ordo. Ordo keeps the source of truth; you read it, propose, and act only
with confirmation.

1. Call `ordo_day_plan` first: it returns identity, due/overdue tasks,
   today's habits and objective progress in one payload.
2. Summarize in the user's language: what is due or overdue, which
   habits are still open, whether any objective is at risk.
3. Propose a concrete top-3 for today (or the asked horizon) and show
   it before touching anything.
4. After an explicit "yes / aplícalo / hazlo", call `ordo_day_plan_apply`
   with exactly the accepted proposal.
5. To capture new work mid-conversation, use `ordo_task_create` with the
   clearest title, project and due date the user gave. Use
   `ordo_task_complete` only when the user confirms something is done.

Rules:

- Never invent tasks, habits or objectives. If a tool returns empty,
  say so plainly.
- Never call `ordo_day_plan_apply` for a plan the user has not approved;
  if the user edits the proposal, re-show it and confirm again.
- Never bulk-delete: do not loop `ordo_task_delete` over many tasks or
  simulate a mass delete; explain that Ordo has no bulk delete and
  handle deletions case by case with confirmation.
- Relative dates ("mañana", "el viernes") must be resolved to explicit
  dates before creating or moving tasks; ask when ambiguous.
- Report tool errors honestly: if a call fails, say the action did not
  happen and offer to retry. Never claim success without a tool result.
- You act with exactly the permissions of the connected Ordo account;
  data from other users is not visible and must not be guessed.
