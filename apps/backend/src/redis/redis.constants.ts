/**
 * Injection tokens for Redis module
 */
export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS';
export const REDIS_MODULE_CONNECTION = 'REDIS_MODULE_CONNECTION';
export const REDIS_MODULE_CONNECTION_TOKEN = 'REDIS_MODULE_CONNECTION_TOKEN';

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  /** 5 minutes - for frequently changing data */
  SHORT: 300,
  /** 15 minutes - for moderately changing data */
  MEDIUM: 900,
  /** 1 hour - for relatively stable data */
  LONG: 3600,
  /** 6 hours - for stable data */
  VERY_LONG: 21600,
  /** 24 hours - for very stable data */
  DAY: 86400,
} as const;

/**
 * Cache key prefixes
 */
export const CACHE_KEY_PREFIX = {
  USER: 'user',
  WORKSPACE: 'workspace',
  WORKSPACE_MEMBERS: 'workspace:members',
  PROJECT: 'project',
  TASK: 'task',
  TAG: 'tag',
  WORKFLOW: 'workflow',
  TIMER: 'timer',
  ANALYTICS: 'analytics',
  AI_PROFILE: 'ai:profile',
} as const;

/**
 * Cache key patterns
 */
export const CACHE_KEY_PATTERN = {
  USER: (userId: string) => `${CACHE_KEY_PREFIX.USER}:${userId}`,
  WORKSPACE: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.WORKSPACE}:${workspaceId}`,
  WORKSPACE_MEMBERS: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.WORKSPACE_MEMBERS}:${workspaceId}`,
  PROJECT: (projectId: string) => `${CACHE_KEY_PREFIX.PROJECT}:${projectId}`,
  PROJECT_LIST: (userId: string) =>
    `${CACHE_KEY_PREFIX.PROJECT}:user:${userId}`,
  TASK: (taskId: string) => `${CACHE_KEY_PREFIX.TASK}:${taskId}`,
  TASK_LIST: (projectId: string) =>
    `${CACHE_KEY_PREFIX.TASK}:project:${projectId}`,
  TAG: (tagId: string) => `${CACHE_KEY_PREFIX.TAG}:${tagId}`,
  TAG_LIST: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.TAG}:workspace:${workspaceId}`,
  WORKFLOW: (workflowId: string) =>
    `${CACHE_KEY_PREFIX.WORKFLOW}:${workflowId}`,
  WORKFLOW_LIST: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.WORKFLOW}:workspace:${workspaceId}`,
  TIMER: (timerId: string) => `${CACHE_KEY_PREFIX.TIMER}:${timerId}`,
  TIMER_ACTIVE: (userId: string) =>
    `${CACHE_KEY_PREFIX.TIMER}:active:${userId}`,
  ANALYTICS_DAILY: (userId: string, date: string) =>
    `${CACHE_KEY_PREFIX.ANALYTICS}:daily:${userId}:${date}`,
  ANALYTICS_WEEKLY: (userId: string, weekStart: string) =>
    `${CACHE_KEY_PREFIX.ANALYTICS}:weekly:${userId}:${weekStart}`,
  AI_PROFILE: (userId: string) => `${CACHE_KEY_PREFIX.AI_PROFILE}:${userId}`,
} as const;

/**
 * Cache invalidation patterns
 */
export const INVALIDATION_PATTERN = {
  /** Invalidate all user-related cache */
  USER: (userId: string) => `${CACHE_KEY_PREFIX.USER}:${userId}*`,

  /** Invalidate all workspace-related cache */
  WORKSPACE: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.WORKSPACE}:${workspaceId}*`,

  /** Invalidate all project-related cache */
  PROJECT: (projectId: string) => `${CACHE_KEY_PREFIX.PROJECT}:${projectId}*`,

  /** Invalidate all task-related cache */
  TASK: (taskId: string) => `${CACHE_KEY_PREFIX.TASK}:${taskId}*`,

  /** Invalidate all workspace projects cache */
  WORKSPACE_PROJECTS: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.PROJECT}:workspace:${workspaceId}*`,

  /** Invalidate all workspace tags cache */
  WORKSPACE_TAGS: (workspaceId: string) =>
    `${CACHE_KEY_PREFIX.TAG}:workspace:${workspaceId}*`,

  /** Invalidate all user projects cache */
  USER_PROJECTS: (userId: string) =>
    `${CACHE_KEY_PREFIX.PROJECT}:user:${userId}*`,

  /** Invalidate all project tasks cache */
  PROJECT_TASKS: (projectId: string) =>
    `${CACHE_KEY_PREFIX.TASK}:project:${projectId}*`,
} as const;
