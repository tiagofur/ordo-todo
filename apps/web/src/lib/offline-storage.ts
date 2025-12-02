import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types for offline data
export interface OfflineTask {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    projectId?: string;
    workspaceId?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    syncedAt?: string;
}

export interface OfflineProject {
    id: string;
    name: string;
    description?: string;
    workspaceId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    syncedAt?: string;
}

export type PendingActionType =
    | 'CREATE_TASK'
    | 'UPDATE_TASK'
    | 'DELETE_TASK'
    | 'COMPLETE_TASK'
    | 'CREATE_PROJECT'
    | 'UPDATE_PROJECT'
    | 'DELETE_PROJECT'
    | 'CREATE_COMMENT'
    | 'START_TIMER'
    | 'STOP_TIMER';

export interface PendingAction {
    id: string;
    type: PendingActionType;
    endpoint: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload: unknown;
    entityId?: string;
    entityType: 'task' | 'project' | 'comment' | 'timer';
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    lastError?: string;
}

export interface SyncMetadata {
    key: string;
    value: string | number | boolean;
    updatedAt: number;
}

// Database schema
interface OrdoOfflineDB extends DBSchema {
    tasks: {
        key: string;
        value: OfflineTask;
        indexes: {
            'by-project': string;
            'by-workspace': string;
            'by-status': string;
            'by-updated': string;
        };
    };
    projects: {
        key: string;
        value: OfflineProject;
        indexes: {
            'by-workspace': string;
            'by-updated': string;
        };
    };
    'pending-actions': {
        key: string;
        value: PendingAction;
        indexes: {
            'by-timestamp': number;
            'by-entity': string;
            'by-type': PendingActionType;
        };
    };
    'sync-metadata': {
        key: string;
        value: SyncMetadata;
    };
}

const DB_NAME = 'ordo-todo-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OrdoOfflineDB> | null = null;

/**
 * Initialize and get the IndexedDB database instance
 */
export async function getDB(): Promise<IDBPDatabase<OrdoOfflineDB>> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<OrdoOfflineDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Tasks store
            if (!db.objectStoreNames.contains('tasks')) {
                const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                taskStore.createIndex('by-project', 'projectId');
                taskStore.createIndex('by-workspace', 'workspaceId');
                taskStore.createIndex('by-status', 'status');
                taskStore.createIndex('by-updated', 'updatedAt');
            }

            // Projects store
            if (!db.objectStoreNames.contains('projects')) {
                const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
                projectStore.createIndex('by-workspace', 'workspaceId');
                projectStore.createIndex('by-updated', 'updatedAt');
            }

            // Pending actions store
            if (!db.objectStoreNames.contains('pending-actions')) {
                const actionStore = db.createObjectStore('pending-actions', { keyPath: 'id' });
                actionStore.createIndex('by-timestamp', 'timestamp');
                actionStore.createIndex('by-entity', 'entityId');
                actionStore.createIndex('by-type', 'type');
            }

            // Sync metadata store
            if (!db.objectStoreNames.contains('sync-metadata')) {
                db.createObjectStore('sync-metadata', { keyPath: 'key' });
            }
        },
    });

    return dbInstance;
}

// ============================================
// Task Operations
// ============================================

export async function saveTask(task: OfflineTask): Promise<void> {
    const db = await getDB();
    await db.put('tasks', { ...task, syncedAt: new Date().toISOString() });
}

export async function saveTasks(tasks: OfflineTask[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('tasks', 'readwrite');
    const syncedAt = new Date().toISOString();

    await Promise.all([
        ...tasks.map((task) => tx.store.put({ ...task, syncedAt })),
        tx.done,
    ]);
}

export async function getTask(id: string): Promise<OfflineTask | undefined> {
    const db = await getDB();
    return db.get('tasks', id);
}

export async function getAllTasks(): Promise<OfflineTask[]> {
    const db = await getDB();
    return db.getAll('tasks');
}

export async function getTasksByProject(projectId: string): Promise<OfflineTask[]> {
    const db = await getDB();
    return db.getAllFromIndex('tasks', 'by-project', projectId);
}

export async function getTasksByWorkspace(workspaceId: string): Promise<OfflineTask[]> {
    const db = await getDB();
    return db.getAllFromIndex('tasks', 'by-workspace', workspaceId);
}

export async function deleteTask(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('tasks', id);
}

export async function clearTasks(): Promise<void> {
    const db = await getDB();
    await db.clear('tasks');
}

// ============================================
// Project Operations
// ============================================

export async function saveProject(project: OfflineProject): Promise<void> {
    const db = await getDB();
    await db.put('projects', { ...project, syncedAt: new Date().toISOString() });
}

export async function saveProjects(projects: OfflineProject[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('projects', 'readwrite');
    const syncedAt = new Date().toISOString();

    await Promise.all([
        ...projects.map((project) => tx.store.put({ ...project, syncedAt })),
        tx.done,
    ]);
}

export async function getProject(id: string): Promise<OfflineProject | undefined> {
    const db = await getDB();
    return db.get('projects', id);
}

export async function getAllProjects(): Promise<OfflineProject[]> {
    const db = await getDB();
    return db.getAll('projects');
}

export async function getProjectsByWorkspace(workspaceId: string): Promise<OfflineProject[]> {
    const db = await getDB();
    return db.getAllFromIndex('projects', 'by-workspace', workspaceId);
}

export async function deleteProject(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('projects', id);
}

export async function clearProjects(): Promise<void> {
    const db = await getDB();
    await db.clear('projects');
}

// ============================================
// Pending Actions Operations
// ============================================

export function generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function addPendingAction(
    action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>
): Promise<string> {
    const db = await getDB();
    const id = generateActionId();

    const pendingAction: PendingAction = {
        ...action,
        id,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
    };

    await db.put('pending-actions', pendingAction);
    return id;
}

export async function getPendingAction(id: string): Promise<PendingAction | undefined> {
    const db = await getDB();
    return db.get('pending-actions', id);
}

export async function getAllPendingActions(): Promise<PendingAction[]> {
    const db = await getDB();
    const actions = await db.getAllFromIndex('pending-actions', 'by-timestamp');
    return actions;
}

export async function getPendingActionsCount(): Promise<number> {
    const db = await getDB();
    return db.count('pending-actions');
}

export async function getPendingActionsByEntity(entityId: string): Promise<PendingAction[]> {
    const db = await getDB();
    return db.getAllFromIndex('pending-actions', 'by-entity', entityId);
}

export async function updatePendingAction(action: PendingAction): Promise<void> {
    const db = await getDB();
    await db.put('pending-actions', action);
}

export async function incrementRetryCount(id: string, error?: string): Promise<PendingAction | null> {
    const db = await getDB();
    const action = await db.get('pending-actions', id);

    if (!action) return null;

    const updated: PendingAction = {
        ...action,
        retryCount: action.retryCount + 1,
        lastError: error,
    };

    await db.put('pending-actions', updated);
    return updated;
}

export async function removePendingAction(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pending-actions', id);
}

export async function clearPendingActions(): Promise<void> {
    const db = await getDB();
    await db.clear('pending-actions');
}

export async function removeActionsByEntity(entityId: string): Promise<void> {
    const db = await getDB();
    const actions = await db.getAllFromIndex('pending-actions', 'by-entity', entityId);
    const tx = db.transaction('pending-actions', 'readwrite');

    await Promise.all([
        ...actions.map((action) => tx.store.delete(action.id)),
        tx.done,
    ]);
}

// ============================================
// Sync Metadata Operations
// ============================================

export async function setSyncMetadata(key: string, value: string | number | boolean): Promise<void> {
    const db = await getDB();
    await db.put('sync-metadata', {
        key,
        value,
        updatedAt: Date.now(),
    });
}

export async function getSyncMetadata(key: string): Promise<SyncMetadata | undefined> {
    const db = await getDB();
    return db.get('sync-metadata', key);
}

export async function getLastSyncTime(): Promise<number | null> {
    const metadata = await getSyncMetadata('lastSyncTime');
    return metadata ? (metadata.value as number) : null;
}

export async function setLastSyncTime(time: number = Date.now()): Promise<void> {
    await setSyncMetadata('lastSyncTime', time);
}

// ============================================
// Utility Functions
// ============================================

export async function clearAllOfflineData(): Promise<void> {
    const db = await getDB();
    await Promise.all([
        db.clear('tasks'),
        db.clear('projects'),
        db.clear('pending-actions'),
        db.clear('sync-metadata'),
    ]);
}

export async function getOfflineStats(): Promise<{
    tasksCount: number;
    projectsCount: number;
    pendingActionsCount: number;
    lastSyncTime: number | null;
}> {
    const db = await getDB();
    const [tasksCount, projectsCount, pendingActionsCount, lastSyncTime] = await Promise.all([
        db.count('tasks'),
        db.count('projects'),
        db.count('pending-actions'),
        getLastSyncTime(),
    ]);

    return {
        tasksCount,
        projectsCount,
        pendingActionsCount,
        lastSyncTime,
    };
}

/**
 * Check if the database is available (IndexedDB support)
 */
export function isIndexedDBSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'indexedDB' in window;
}
