/**
 * Scope required by each MCP tool.
 *
 * Reads need `read`; task mutations need `tasks:write`; project
 * mutations need `projects:write`. Habit/objective tools follow the
 * same read/write split on the `tasks:write` scope (personal
 * productivity data travels with tasks until dedicated scopes exist).
 */
export const MCP_TOOL_SCOPES: Record<string, string> = {
  ordo_search: 'read',
  ordo_workspace_list: 'read',
  ordo_task_list: 'read',
  ordo_task_create: 'tasks:write',
  ordo_task_get: 'read',
  ordo_task_update: 'tasks:write',
  ordo_task_complete: 'tasks:write',
  ordo_task_delete: 'tasks:write',
  ordo_project_list: 'read',
  ordo_project_create: 'projects:write',
  ordo_project_get: 'read',
  ordo_project_update: 'projects:write',
  ordo_comment_add: 'tasks:write',
  ordo_habit_today: 'read',
  ordo_habit_complete: 'tasks:write',
  ordo_objective_progress: 'read',
  ordo_me: 'read',
  ordo_ping: 'read',
  ordo_day_plan: 'read',
  ordo_day_plan_apply: 'tasks:write',
  ordo_timer_active: 'read',
  ordo_timer_start: 'tasks:write',
  ordo_timer_stop: 'tasks:write',
  ordo_timer_pause: 'tasks:write',
  ordo_timer_resume: 'tasks:write',
  ordo_note_list: 'read',
  ordo_note_get: 'read',
  ordo_note_create: 'tasks:write',
  ordo_habit_list: 'read',
  ordo_habit_create: 'tasks:write',
  ordo_tag_list: 'read',
  ordo_task_tags: 'read',
  ordo_tag_add_to_task: 'tasks:write',
  ordo_meeting_list: 'read',
  ordo_comment_list: 'read',
  ordo_workspace_members: 'read',
  ordo_task_assign: 'tasks:write',
};
