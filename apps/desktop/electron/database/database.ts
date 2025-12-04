/**
 * SQLite Database Service for Offline Mode
 * 
 * Uses better-sqlite3 for synchronous, fast SQLite operations.
 * Handles database initialization, migrations, and CRUD operations.
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { CREATE_TABLES_SQL, SCHEMA_VERSION, SyncQueueItem } from './schema';

let db: Database.Database | null = null;

/**
 * Get the database file path
 */
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'ordo-todo.db');
}

/**
 * Initialize the database
 */
export function initDatabase(): Database.Database {
  if (db) return db;

  const dbPath = getDatabasePath();
  console.log('[Database] Initializing database at:', dbPath);

  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Create database connection
  db = new Database(dbPath, {
    // Enable WAL mode for better concurrent read performance
    // verbose: console.log // Uncomment for debugging
  });

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Run migrations
  runMigrations(db);

  console.log('[Database] Database initialized successfully');
  return db;
}

/**
 * Run database migrations
 */
function runMigrations(database: Database.Database): void {
  // Check current schema version
  const versionResult = database.prepare(`
    SELECT value FROM sync_metadata WHERE key = 'schema_version'
  `).get() as { value: string } | undefined;

  const currentVersion = versionResult ? parseInt(versionResult.value, 10) : 0;

  if (currentVersion < SCHEMA_VERSION) {
    console.log(`[Database] Migrating from version ${currentVersion} to ${SCHEMA_VERSION}`);
    
    // Run schema creation (idempotent with IF NOT EXISTS)
    database.exec(CREATE_TABLES_SQL);

    // Update schema version
    database.prepare(`
      INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
      VALUES ('schema_version', ?, ?)
    `).run(SCHEMA_VERSION.toString(), Date.now());

    console.log('[Database] Migration completed');
  }
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Database connection closed');
  }
}

// ============================================================================
// Generic CRUD Operations
// ============================================================================

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

// ============================================================================
// Task Operations
// ============================================================================

export interface LocalTask {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: number | null;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  position: number;
  parent_task_id?: string | null;
  created_at: number;
  updated_at: number;
  completed_at?: number | null;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

export function createTask(task: Omit<LocalTask, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>): LocalTask {
  const database = getDatabase();
  const timestamp = now();
  const id = generateId();

  const newTask: LocalTask = {
    ...task,
    id,
    created_at: timestamp,
    updated_at: timestamp,
    local_updated_at: timestamp,
    is_synced: 0,
    sync_status: 'pending',
    is_deleted: 0,
  };

  database.prepare(`
    INSERT INTO tasks (
      id, workspace_id, project_id, title, description, status, priority,
      due_date, estimated_pomodoros, completed_pomodoros, position,
      parent_task_id, created_at, updated_at, completed_at,
      is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @workspace_id, @project_id, @title, @description, @status, @priority,
      @due_date, @estimated_pomodoros, @completed_pomodoros, @position,
      @parent_task_id, @created_at, @updated_at, @completed_at,
      @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(newTask);

  // Add to sync queue
  addToSyncQueue('task', id, 'create', newTask);

  return newTask;
}

export function updateTask(id: string, updates: Partial<LocalTask>): LocalTask | null {
  const database = getDatabase();
  const timestamp = now();

  // Build update query dynamically
  const updateFields = Object.keys(updates)
    .filter(key => !['id', 'created_at'].includes(key))
    .map(key => `${key} = @${key}`)
    .join(', ');

  if (!updateFields) return getTaskById(id);

  database.prepare(`
    UPDATE tasks 
    SET ${updateFields}, updated_at = @updated_at, local_updated_at = @local_updated_at, 
        is_synced = 0, sync_status = 'pending'
    WHERE id = @id AND is_deleted = 0
  `).run({
    ...updates,
    id,
    updated_at: timestamp,
    local_updated_at: timestamp,
  });

  const updatedTask = getTaskById(id);
  if (updatedTask) {
    addToSyncQueue('task', id, 'update', updatedTask);
  }

  return updatedTask;
}

export function deleteTask(id: string, soft = true): boolean {
  const database = getDatabase();
  const timestamp = now();

  if (soft) {
    database.prepare(`
      UPDATE tasks 
      SET is_deleted = 1, sync_status = 'deleted', local_updated_at = ?, is_synced = 0
      WHERE id = ?
    `).run(timestamp, id);
  } else {
    database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  addToSyncQueue('task', id, 'delete', { id });
  return true;
}

export function getTaskById(id: string): LocalTask | null {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM tasks WHERE id = ? AND is_deleted = 0
  `).get(id) as LocalTask | null;
}

export function getTasksByWorkspace(workspaceId: string): LocalTask[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(workspaceId) as LocalTask[];
}

export function getTasksByProject(projectId: string): LocalTask[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM tasks 
    WHERE project_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(projectId) as LocalTask[];
}

export function getPendingTasks(workspaceId: string): LocalTask[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND status = 'pending' AND is_deleted = 0
    ORDER BY priority DESC, due_date ASC, position ASC
  `).all(workspaceId) as LocalTask[];
}

export function getUnsyncedTasks(): LocalTask[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM tasks WHERE is_synced = 0
  `).all() as LocalTask[];
}

// ============================================================================
// Workspace Operations
// ============================================================================

export interface LocalWorkspace {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  owner_id: string;
  created_at: number;
  updated_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

export function createWorkspace(workspace: Omit<LocalWorkspace, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>): LocalWorkspace {
  const database = getDatabase();
  const timestamp = now();
  const id = generateId();

  const newWorkspace: LocalWorkspace = {
    ...workspace,
    id,
    created_at: timestamp,
    updated_at: timestamp,
    local_updated_at: timestamp,
    is_synced: 0,
    sync_status: 'pending',
    is_deleted: 0,
  };

  database.prepare(`
    INSERT INTO workspaces (
      id, name, description, color, icon, owner_id,
      created_at, updated_at, is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @name, @description, @color, @icon, @owner_id,
      @created_at, @updated_at, @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(newWorkspace);

  addToSyncQueue('workspace', id, 'create', newWorkspace);
  return newWorkspace;
}

export function getWorkspaces(): LocalWorkspace[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM workspaces WHERE is_deleted = 0 ORDER BY name ASC
  `).all() as LocalWorkspace[];
}

export function getWorkspaceById(id: string): LocalWorkspace | null {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM workspaces WHERE id = ? AND is_deleted = 0
  `).get(id) as LocalWorkspace | null;
}

// ============================================================================
// Project Operations
// ============================================================================

export interface LocalProject {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status: string;
  start_date?: number | null;
  end_date?: number | null;
  created_at: number;
  updated_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

export function createProject(project: Omit<LocalProject, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>): LocalProject {
  const database = getDatabase();
  const timestamp = now();
  const id = generateId();

  const newProject: LocalProject = {
    ...project,
    id,
    created_at: timestamp,
    updated_at: timestamp,
    local_updated_at: timestamp,
    is_synced: 0,
    sync_status: 'pending',
    is_deleted: 0,
  };

  database.prepare(`
    INSERT INTO projects (
      id, workspace_id, name, description, color, status, start_date, end_date,
      created_at, updated_at, is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @workspace_id, @name, @description, @color, @status, @start_date, @end_date,
      @created_at, @updated_at, @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(newProject);

  addToSyncQueue('project', id, 'create', newProject);
  return newProject;
}

export function getProjectsByWorkspace(workspaceId: string): LocalProject[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM projects 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY name ASC
  `).all(workspaceId) as LocalProject[];
}

// ============================================================================
// Pomodoro Session Operations
// ============================================================================

export interface LocalPomodoroSession {
  id: string;
  task_id?: string | null;
  workspace_id: string;
  type: 'focus' | 'short_break' | 'long_break';
  duration: number;
  started_at: number;
  completed_at?: number | null;
  was_interrupted: number;
  notes?: string | null;
  created_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

export function createPomodoroSession(session: Omit<LocalPomodoroSession, 'id' | 'created_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>): LocalPomodoroSession {
  const database = getDatabase();
  const timestamp = now();
  const id = generateId();

  const newSession: LocalPomodoroSession = {
    ...session,
    id,
    created_at: timestamp,
    local_updated_at: timestamp,
    is_synced: 0,
    sync_status: 'pending',
    is_deleted: 0,
  };

  database.prepare(`
    INSERT INTO pomodoro_sessions (
      id, task_id, workspace_id, type, duration, started_at, completed_at,
      was_interrupted, notes, created_at, is_synced, sync_status, local_updated_at, 
      server_updated_at, is_deleted
    ) VALUES (
      @id, @task_id, @workspace_id, @type, @duration, @started_at, @completed_at,
      @was_interrupted, @notes, @created_at, @is_synced, @sync_status, @local_updated_at,
      @server_updated_at, @is_deleted
    )
  `).run(newSession);

  addToSyncQueue('pomodoro_session', id, 'create', newSession);
  return newSession;
}

export function getSessionsByWorkspace(workspaceId: string, startDate?: number, endDate?: number): LocalPomodoroSession[] {
  const database = getDatabase();
  
  let query = `SELECT * FROM pomodoro_sessions WHERE workspace_id = ? AND is_deleted = 0`;
  const params: (string | number)[] = [workspaceId];

  if (startDate) {
    query += ` AND started_at >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND started_at <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY started_at DESC`;

  return database.prepare(query).all(...params) as LocalPomodoroSession[];
}

// ============================================================================
// Sync Queue Operations
// ============================================================================

export function addToSyncQueue(
  entityType: string,
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  payload: unknown
): void {
  const database = getDatabase();
  
  // Check if there's already a pending operation for this entity
  const existing = database.prepare(`
    SELECT id, operation FROM sync_queue 
    WHERE entity_type = ? AND entity_id = ? AND status = 'pending'
    ORDER BY created_at DESC LIMIT 1
  `).get(entityType, entityId) as { id: number; operation: string } | undefined;

  if (existing) {
    // Merge operations
    if (existing.operation === 'create' && operation === 'update') {
      // Keep as create with updated payload
      database.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(payload), existing.id);
      return;
    }
    if (existing.operation === 'create' && operation === 'delete') {
      // Remove from queue entirely (never synced, now deleted)
      database.prepare(`DELETE FROM sync_queue WHERE id = ?`).run(existing.id);
      return;
    }
    if (existing.operation === 'update' && operation === 'delete') {
      // Change to delete
      database.prepare(`
        UPDATE sync_queue SET operation = 'delete', payload = ? WHERE id = ?
      `).run(JSON.stringify(payload), existing.id);
      return;
    }
    if (existing.operation === 'update' && operation === 'update') {
      // Update payload
      database.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(payload), existing.id);
      return;
    }
  }

  // Add new queue item
  database.prepare(`
    INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(entityType, entityId, operation, JSON.stringify(payload), now());
}

export function getPendingSyncItems(limit = 50): SyncQueueItem[] {
  const database = getDatabase();
  return database.prepare(`
    SELECT * FROM sync_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
    LIMIT ?
  `).all(limit) as SyncQueueItem[];
}

export function markSyncItemProcessing(id: number): void {
  const database = getDatabase();
  database.prepare(`
    UPDATE sync_queue SET status = 'processing', last_attempt_at = ? WHERE id = ?
  `).run(now(), id);
}

export function markSyncItemCompleted(id: number): void {
  const database = getDatabase();
  database.prepare(`DELETE FROM sync_queue WHERE id = ?`).run(id);
}

export function markSyncItemFailed(id: number, error: string): void {
  const database = getDatabase();
  database.prepare(`
    UPDATE sync_queue 
    SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
        attempts = attempts + 1, 
        error = ?,
        last_attempt_at = ?
    WHERE id = ?
  `).run(error, now(), id);
}

export function getSyncQueueStats(): { pending: number; failed: number; total: number } {
  const database = getDatabase();
  const result = database.prepare(`
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(*) as total
    FROM sync_queue
  `).get() as { pending: number; failed: number; total: number };
  return result;
}

// ============================================================================
// Sync Metadata Operations
// ============================================================================

export function getSyncMetadata(key: string): string | null {
  const database = getDatabase();
  const result = database.prepare(`
    SELECT value FROM sync_metadata WHERE key = ?
  `).get(key) as { value: string } | undefined;
  return result?.value ?? null;
}

export function setSyncMetadata(key: string, value: string): void {
  const database = getDatabase();
  database.prepare(`
    INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run(key, value, now());
}

export function getLastSyncTime(): number | null {
  const value = getSyncMetadata('last_sync_time');
  return value ? parseInt(value, 10) : null;
}

export function setLastSyncTime(timestamp: number): void {
  setSyncMetadata('last_sync_time', timestamp.toString());
}

// ============================================================================
// Conflict Resolution
// ============================================================================

export interface ConflictInfo {
  entityType: string;
  entityId: string;
  localData: unknown;
  serverData: unknown;
  localUpdatedAt: number;
  serverUpdatedAt: number;
}

export function markAsConflict(entityType: string, entityId: string): void {
  const database = getDatabase();
  const table = getTableName(entityType);
  if (!table) return;

  database.prepare(`
    UPDATE ${table} SET sync_status = 'conflict' WHERE id = ?
  `).run(entityId);
}

export function resolveConflict(
  entityType: string,
  entityId: string,
  resolution: 'keep_local' | 'keep_server' | 'merge',
  mergedData?: unknown
): void {
  const database = getDatabase();
  const table = getTableName(entityType);
  if (!table) return;

  if (resolution === 'keep_local') {
    // Re-queue for sync
    database.prepare(`
      UPDATE ${table} SET sync_status = 'pending', is_synced = 0 WHERE id = ?
    `).run(entityId);
  } else if (resolution === 'keep_server') {
    // Mark as synced (server data will be applied by sync engine)
    database.prepare(`
      UPDATE ${table} SET sync_status = 'synced', is_synced = 1 WHERE id = ?
    `).run(entityId);
  } else if (resolution === 'merge' && mergedData) {
    // Apply merged data and re-queue
    // This would need to update the entity with merged data
    database.prepare(`
      UPDATE ${table} SET sync_status = 'pending', is_synced = 0 WHERE id = ?
    `).run(entityId);
  }
}

function getTableName(entityType: string): string | null {
  const tables: Record<string, string> = {
    workspace: 'workspaces',
    project: 'projects',
    task: 'tasks',
    tag: 'tags',
    subtask: 'subtasks',
    comment: 'comments',
    pomodoro_session: 'pomodoro_sessions',
  };
  return tables[entityType] ?? null;
}

// ============================================================================
// Bulk Operations for Sync
// ============================================================================

export function upsertFromServer<T extends { id: string; updated_at: number }>(
  entityType: string,
  items: T[]
): void {
  const database = getDatabase();
  const table = getTableName(entityType);
  if (!table || items.length === 0) return;

  const transaction = database.transaction(() => {
    for (const item of items) {
      const existing = database.prepare(`SELECT id, local_updated_at FROM ${table} WHERE id = ?`).get(item.id) as { id: string; local_updated_at: number } | undefined;

      if (!existing) {
        // Insert new item from server
        const columns = Object.keys(item).join(', ');
        const placeholders = Object.keys(item).map(k => `@${k}`).join(', ');
        database.prepare(`
          INSERT INTO ${table} (${columns}, is_synced, sync_status, local_updated_at, server_updated_at)
          VALUES (${placeholders}, 1, 'synced', @updated_at, @updated_at)
        `).run(item);
      } else {
        // Check for conflicts
        if (existing.local_updated_at > item.updated_at) {
          // Local is newer - conflict
          markAsConflict(entityType, item.id);
        } else {
          // Server is newer - update local
          const updates = Object.keys(item)
            .filter(k => k !== 'id')
            .map(k => `${k} = @${k}`)
            .join(', ');
          database.prepare(`
            UPDATE ${table} 
            SET ${updates}, is_synced = 1, sync_status = 'synced', server_updated_at = @updated_at
            WHERE id = @id
          `).run(item);
        }
      }
    }
  });

  transaction();
}

export function markAsSynced(entityType: string, entityId: string, serverUpdatedAt: number): void {
  const database = getDatabase();
  const table = getTableName(entityType);
  if (!table) return;

  database.prepare(`
    UPDATE ${table} 
    SET is_synced = 1, sync_status = 'synced', server_updated_at = ?
    WHERE id = ?
  `).run(serverUpdatedAt, entityId);
}
