export const CACHE_TTL = {
  TASKS: 300,
  PROJECTS: 600,
  WORKSPACES: 1800,
  DAILY_METRICS: 900,
  WEEKLY_METRICS: 3600,
  MONTHLY_METRICS: 7200,
  USERS: 3600,
  TAGS: 1800,
  COMMENTS: 300,
  ATTACHMENTS: 1800,
} as const;

export const CACHE_KEYS = {
  TASKS: 'tasks',
  TASK: 'task',
  PROJECTS: 'projects',
  PROJECT: 'project',
  WORKSPACES: 'workspaces',
  WORKSPACE: 'workspace',
  DAILY_METRICS: 'daily-metrics',
  WEEKLY_METRICS: 'weekly-metrics',
  MONTHLY_METRICS: 'monthly-metrics',
  USER: 'user',
  TAGS: 'tags',
  COMMENTS: 'comments',
  ATTACHMENTS: 'attachments',
} as const;

export type CacheTTLKey = keyof typeof CACHE_TTL;
export type CacheKeyPrefix = keyof typeof CACHE_KEYS;
