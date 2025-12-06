/**
 * SQLite Database Schema for Offline Mode
 * 
 * This schema mirrors the backend PostgreSQL schema but optimized for local storage.
 * All tables include sync metadata for conflict resolution.
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- Sync metadata table
CREATE TABLE IF NOT EXISTS sync_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending', -- pending, synced, conflict, deleted
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  status TEXT DEFAULT 'active',
  start_date INTEGER,
  end_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date INTEGER,
  estimated_pomodoros INTEGER DEFAULT 1,
  completed_pomodoros INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  parent_task_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task Tags (many-to-many)
CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Pomodoro Sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  workspace_id TEXT NOT NULL,
  type TEXT NOT NULL, -- focus, short_break, long_break
  duration INTEGER NOT NULL, -- in seconds
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  was_interrupted INTEGER DEFAULT 0,
  notes TEXT,
  created_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Sync Queue for pending operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- workspace, project, task, tag, etc.
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- create, update, delete
  payload TEXT, -- JSON payload for the operation
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  attempts INTEGER DEFAULT 0,
  last_attempt_at INTEGER,
  error TEXT,
  status TEXT DEFAULT 'pending' -- pending, processing, failed, completed
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks(sync_status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_workspace ON pomodoro_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
`;

export interface SyncableEntity {
  id: string;
  is_synced: number;
  sync_status: 'pending' | 'synced' | 'conflict' | 'deleted';
  local_updated_at: number;
  server_updated_at: number | null;
  is_deleted: number;
}

export interface SyncQueueItem {
  id: number;
  entity_type: string;
  entity_id: string;
  operation: 'create' | 'update' | 'delete';
  payload: string | null;
  created_at: number;
  attempts: number;
  last_attempt_at: number | null;
  error: string | null;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}
