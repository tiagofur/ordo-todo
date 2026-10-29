---
name: ordo-review
description: Answer status questions from the user's real Ordo data — what is pending or overdue, today's habits, and progress toward objectives. Use for "what do I have today", weekly reviews, habit check-ins, or any question about how the user is doing. This skill is read-only: it reports, it does not modify.
---

# Ordo status review

Use this skill when the user asks what they have pending, how they are
doing, or wants a review. Read-only: never create, complete or modify
anything from this skill.

1. Call `ordo_task_list` and separate: overdue, due today, everything
   else. Call `ordo_habit_today` for the day's habits and
   `ordo_objective_progress` for goals.
2. Lead with overdue and due-today items (title + due date), then open
   habits, then objective progress with real numbers.
3. If the user asks about a period ("this week", "last month"), report
   only what the tools return; Ordo computes the numbers — do not
   estimate or extrapolate from partial data.
4. If the user then wants changes ("muévela al viernes", "crea una
   tarea"), switch to explicit create/update flows and confirm before
   writing.

Rules:

- Never invent tasks, habits, objectives or statistics. If a tool
  returns empty, say so plainly.
- Distinguish real progress (from tools) from suggestions; label any
  advice as advice.
- Report tool errors honestly: if a call fails, say the data could not
  be read and offer to retry.
- You act with exactly the permissions of the connected Ordo account;
  data from other users is not visible and must not be guessed.
