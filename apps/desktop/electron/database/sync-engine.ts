/**
 * Sync Engine for Offline Mode
 * 
 * Handles bidirectional synchronization between local SQLite and remote API.
 * Implements conflict detection and resolution strategies.
 */

import { BrowserWindow } from 'electron';
import {
  getDatabase,
  getPendingSyncItems,
  markSyncItemProcessing,
  markSyncItemCompleted,
  markSyncItemFailed,
  getSyncQueueStats,
  getLastSyncTime,
  setLastSyncTime,
  upsertFromServer,
  markAsSynced,
  LocalTask,
  LocalWorkspace,
  LocalProject,
  LocalPomodoroSession,
} from './database';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  pendingChanges: number;
  failedChanges: number;
  isOnline: boolean;
  currentOperation?: string;
  error?: string;
}

let syncState: SyncState = {
  status: 'idle',
  lastSyncTime: null,
  pendingChanges: 0,
  failedChanges: 0,
  isOnline: true,
};

let syncInterval: NodeJS.Timeout | null = null;
let mainWindow: BrowserWindow | null = null;
let apiBaseUrl = 'http://localhost:3001/api/v1';
let authToken: string | null = null;

/**
 * Initialize the sync engine
 */
export function initSyncEngine(window: BrowserWindow, baseUrl?: string): void {
  mainWindow = window;
  if (baseUrl) apiBaseUrl = baseUrl;
  
  // Load last sync time
  syncState.lastSyncTime = getLastSyncTime();
  
  // Update stats
  updateSyncStats();
  
  console.log('[SyncEngine] Initialized');
}

/**
 * Set authentication token for API calls
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
  console.log('[SyncEngine] Auth token updated');
}

/**
 * Start automatic sync with interval
 */
export function startAutoSync(intervalMs = 30000): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(() => {
    if (syncState.isOnline && authToken) {
      performSync();
    }
  }, intervalMs);
  
  console.log(`[SyncEngine] Auto-sync started with interval ${intervalMs}ms`);
}

/**
 * Stop automatic sync
 */
export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  console.log('[SyncEngine] Auto-sync stopped');
}

/**
 * Update sync statistics
 */
function updateSyncStats(): void {
  const stats = getSyncQueueStats();
  syncState.pendingChanges = stats.pending;
  syncState.failedChanges = stats.failed;
  notifyRenderer();
}

/**
 * Notify renderer process of sync state changes
 */
function notifyRenderer(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('sync-state-changed', syncState);
  }
}

/**
 * Set online status
 */
export function setOnlineStatus(isOnline: boolean): void {
  const wasOffline = !syncState.isOnline;
  syncState.isOnline = isOnline;
  syncState.status = isOnline ? 'idle' : 'offline';
  
  // If coming back online, trigger sync
  if (wasOffline && isOnline && authToken) {
    performSync();
  }
  
  notifyRenderer();
  console.log(`[SyncEngine] Online status: ${isOnline}`);
}

/**
 * Get current sync state
 */
export function getSyncState(): SyncState {
  return { ...syncState };
}

/**
 * Perform full sync operation
 */
export async function performSync(): Promise<void> {
  if (syncState.status === 'syncing') {
    console.log('[SyncEngine] Sync already in progress');
    return;
  }
  
  if (!authToken) {
    console.log('[SyncEngine] No auth token, skipping sync');
    return;
  }
  
  if (!syncState.isOnline) {
    console.log('[SyncEngine] Offline, skipping sync');
    return;
  }
  
  try {
    syncState.status = 'syncing';
    syncState.error = undefined;
    notifyRenderer();
    
    console.log('[SyncEngine] Starting sync...');
    
    // Step 1: Push local changes to server
    await pushLocalChanges();
    
    // Step 2: Pull server changes
    await pullServerChanges();
    
    // Update last sync time
    const now = Date.now();
    setLastSyncTime(now);
    syncState.lastSyncTime = now;
    
    syncState.status = 'idle';
    updateSyncStats();
    
    console.log('[SyncEngine] Sync completed successfully');
  } catch (error) {
    console.error('[SyncEngine] Sync failed:', error);
    syncState.status = 'error';
    syncState.error = error instanceof Error ? error.message : 'Unknown error';
    notifyRenderer();
  }
}

/**
 * Push local changes to server
 */
async function pushLocalChanges(): Promise<void> {
  const pendingItems = getPendingSyncItems(50);
  
  if (pendingItems.length === 0) {
    console.log('[SyncEngine] No pending changes to push');
    return;
  }
  
  console.log(`[SyncEngine] Pushing ${pendingItems.length} changes...`);
  
  for (const item of pendingItems) {
    try {
      markSyncItemProcessing(item.id);
      syncState.currentOperation = `Syncing ${item.entity_type} ${item.operation}`;
      notifyRenderer();
      
      const success = await pushSingleItem(item);
      
      if (success) {
        markSyncItemCompleted(item.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SyncEngine] Failed to push ${item.entity_type}:${item.entity_id}:`, errorMessage);
      markSyncItemFailed(item.id, errorMessage);
    }
  }
  
  syncState.currentOperation = undefined;
}

/**
 * Push a single sync queue item to server
 */
async function pushSingleItem(item: { entity_type: string; entity_id: string; operation: string; payload: string | null }): Promise<boolean> {
  const endpoint = getEndpoint(item.entity_type);
  if (!endpoint) {
    console.warn(`[SyncEngine] Unknown entity type: ${item.entity_type}`);
    return false;
  }
  
  const payload = item.payload ? JSON.parse(item.payload) : null;
  
  let response: Response;
  
  switch (item.operation) {
    case 'create':
      response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transformForServer(item.entity_type, payload)),
      });
      break;
      
    case 'update':
      response = await fetch(`${apiBaseUrl}${endpoint}/${item.entity_id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(transformForServer(item.entity_type, payload)),
      });
      break;
      
    case 'delete':
      response = await fetch(`${apiBaseUrl}${endpoint}/${item.entity_id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      break;
      
    default:
      console.warn(`[SyncEngine] Unknown operation: ${item.operation}`);
      return false;
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }
  
  // If create/update, update local record with server response
  if (item.operation === 'create' || item.operation === 'update') {
    const serverData = await response.json();
    markAsSynced(item.entity_type, item.entity_id, serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : Date.now());
  }
  
  return true;
}

/**
 * Pull changes from server
 */
async function pullServerChanges(): Promise<void> {
  console.log('[SyncEngine] Pulling server changes...');
  
  const lastSync = syncState.lastSyncTime;
  const since = lastSync ? new Date(lastSync).toISOString() : undefined;
  
  // Pull each entity type
  await pullEntityType('workspace', since);
  await pullEntityType('project', since);
  await pullEntityType('task', since);
  await pullEntityType('pomodoro_session', since);
}

/**
 * Pull changes for a specific entity type
 */
async function pullEntityType(entityType: string, since?: string): Promise<void> {
  const endpoint = getEndpoint(entityType);
  if (!endpoint) return;
  
  try {
    syncState.currentOperation = `Fetching ${entityType}s`;
    notifyRenderer();
    
    let url = `${apiBaseUrl}${endpoint}`;
    if (since) {
      url += `?updatedSince=${since}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${entityType}s: ${response.status}`);
    }
    
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    
    if (items.length > 0) {
      console.log(`[SyncEngine] Received ${items.length} ${entityType}s from server`);
      const transformedItems = items.map((item: Record<string, unknown>) => transformFromServer(entityType, item));
      upsertFromServer(entityType, transformedItems);
    }
  } catch (error) {
    console.error(`[SyncEngine] Failed to pull ${entityType}s:`, error);
    // Don't throw - continue with other entity types
  }
}

/**
 * Get API endpoint for entity type
 */
function getEndpoint(entityType: string): string | null {
  const endpoints: Record<string, string> = {
    workspace: '/workspaces',
    project: '/projects',
    task: '/tasks',
    tag: '/tags',
    pomodoro_session: '/pomodoro-sessions',
  };
  return endpoints[entityType] ?? null;
}

/**
 * Get headers for API requests
 */
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

/**
 * Transform local data to server format
 */
function transformForServer(entityType: string, data: Record<string, unknown>): Record<string, unknown> {
  // Remove sync-specific fields
  const { is_synced, sync_status, local_updated_at, server_updated_at, is_deleted, ...rest } = data;
  
  // Convert timestamps to ISO strings
  const transformed: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(rest)) {
    if (key.endsWith('_at') || key.endsWith('_date')) {
      transformed[toCamelCase(key)] = value ? new Date(value as number).toISOString() : null;
    } else if (key.includes('_')) {
      transformed[toCamelCase(key)] = value;
    } else {
      transformed[key] = value;
    }
  }
  
  return transformed;
}

/**
 * Transform server data to local format
 */
function transformFromServer(entityType: string, data: Record<string, unknown>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = toSnakeCase(key);
    
    if (snakeKey.endsWith('_at') || snakeKey.endsWith('_date')) {
      transformed[snakeKey] = value ? new Date(value as string).getTime() : null;
    } else {
      transformed[snakeKey] = value;
    }
  }
  
  return transformed;
}

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Force immediate sync
 */
export function forceSync(): Promise<void> {
  return performSync();
}

/**
 * Cleanup sync engine
 */
export function cleanupSyncEngine(): void {
  stopAutoSync();
  mainWindow = null;
  authToken = null;
  console.log('[SyncEngine] Cleaned up');
}
