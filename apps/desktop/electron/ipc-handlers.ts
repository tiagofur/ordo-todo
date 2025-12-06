import { ipcMain, BrowserWindow, app } from 'electron'
import Store from 'electron-store'
import { updateTrayState, TrayState } from './tray'
import { notifications, showNotification, NotificationOptions } from './notifications'
import { 
  registerGlobalShortcuts, 
  unregisterAllShortcuts, 
  getRegisteredShortcuts,
  updateShortcut,
  defaultShortcuts,
  ShortcutConfig 
} from './shortcuts'
import {
  initDatabase,
  closeDatabase,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByWorkspace,
  getTasksByProject,
  getPendingTasks,
  getUnsyncedTasks,
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  createProject,
  getProjectsByWorkspace,
  createPomodoroSession,
  getSessionsByWorkspace,
  getSyncQueueStats,
  LocalTask,
  LocalWorkspace,
  LocalProject,
  LocalPomodoroSession,
} from './database'
import {
  initSyncEngine,
  setAuthToken,
  startAutoSync,
  stopAutoSync,
  setOnlineStatus,
  getSyncState,
  forceSync,
  cleanupSyncEngine,
} from './database/sync-engine'

// Define store schema type
interface StoreSchema {
  windowState: {
    width: number
    height: number
    x?: number
    y?: number
    isMaximized: boolean
  }
  settings: {
    minimizeToTray: boolean
    startMinimized: boolean
    alwaysOnTop: boolean
    shortcuts: ShortcutConfig[]
  }
  theme: string
  locale: string
}

// Persistent store for settings
const store = new Store<StoreSchema>({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined,
      isMaximized: false,
    },
    settings: {
      minimizeToTray: true,
      startMinimized: false,
      alwaysOnTop: false,
      shortcuts: defaultShortcuts,
    },
    theme: 'system',
    locale: 'es',
  },
})

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  // ============================================
  // Initialize Database & Sync Engine
  // ============================================
  
  try {
    initDatabase()
    initSyncEngine(mainWindow, process.env.VITE_API_URL || 'http://localhost:3001/api/v1')
    console.log('[IPC] Database and Sync Engine initialized')
  } catch (error) {
    console.error('[IPC] Failed to initialize database:', error)
  }

  // ============================================
  // Window Controls
  // ============================================
  
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle('close-window', () => {
    const minimizeToTray = store.get('settings.minimizeToTray', true)
    if (minimizeToTray) {
      mainWindow.hide()
    } else {
      mainWindow.close()
    }
  })

  ipcMain.handle('is-maximized', () => {
    return mainWindow.isMaximized()
  })

  ipcMain.handle('window:setAlwaysOnTop', (_, flag: boolean) => {
    mainWindow.setAlwaysOnTop(flag)
    store.set('settings.alwaysOnTop', flag)
    return flag
  })

  ipcMain.handle('window:isAlwaysOnTop', () => {
    return mainWindow.isAlwaysOnTop()
  })

  ipcMain.handle('window:show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  ipcMain.handle('window:hide', () => {
    mainWindow.hide()
  })

  // ============================================
  // Tray Controls
  // ============================================

  ipcMain.handle('tray:update', (_, state: Partial<TrayState>) => {
    updateTrayState(mainWindow, state)
  })

  // ============================================
  // Notifications
  // ============================================

  ipcMain.handle('notification:show', (_, options: NotificationOptions) => {
    return showNotification(options) !== null
  })

  ipcMain.handle('notification:pomodoroComplete', () => {
    notifications.pomodoroComplete(mainWindow)
  })

  ipcMain.handle('notification:shortBreakComplete', () => {
    notifications.shortBreakComplete(mainWindow)
  })

  ipcMain.handle('notification:longBreakComplete', () => {
    notifications.longBreakComplete(mainWindow)
  })

  ipcMain.handle('notification:taskDue', (_, taskTitle: string) => {
    notifications.taskDue(mainWindow, taskTitle)
  })

  ipcMain.handle('notification:taskReminder', (_, taskTitle: string, dueIn: string) => {
    notifications.taskReminder(mainWindow, taskTitle, dueIn)
  })

  // ============================================
  // Shortcuts
  // ============================================

  ipcMain.handle('shortcuts:getAll', () => {
    return getRegisteredShortcuts()
  })

  ipcMain.handle('shortcuts:getDefaults', () => {
    return defaultShortcuts
  })

  ipcMain.handle('shortcuts:update', (_, id: string, updates: Partial<ShortcutConfig>) => {
    return updateShortcut(mainWindow, id, updates)
  })

  ipcMain.handle('shortcuts:reset', () => {
    registerGlobalShortcuts(mainWindow, defaultShortcuts)
    store.set('settings.shortcuts', defaultShortcuts)
    return defaultShortcuts
  })

  // ============================================
  // Store (Persistent Settings)
  // ============================================

  ipcMain.handle('store:get', (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('store:set', (_, key: string, value: unknown) => {
    store.set(key, value)
    return true
  })

  ipcMain.handle('store:delete', (_, key: string) => {
    store.delete(key as any)
    return true
  })

  ipcMain.handle('store:clear', () => {
    store.clear()
    return true
  })

  // ============================================
  // App Info
  // ============================================

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:getName', () => {
    return app.getName()
  })

  ipcMain.handle('app:getPath', (_, name: string) => {
    return app.getPath(name as any)
  })

  ipcMain.handle('app:isPackaged', () => {
    return app.isPackaged
  })

  // ============================================
  // Timer State (for tray updates)
  // ============================================

  ipcMain.on('timer:stateUpdate', (_, state: TrayState) => {
    updateTrayState(mainWindow, state)
  })

  // ============================================
  // Database - Tasks (Offline Mode)
  // ============================================

  ipcMain.handle('db:task:create', (_, task: Omit<LocalTask, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => {
    return createTask(task)
  })

  ipcMain.handle('db:task:update', (_, id: string, updates: Partial<LocalTask>) => {
    return updateTask(id, updates)
  })

  ipcMain.handle('db:task:delete', (_, id: string, soft?: boolean) => {
    return deleteTask(id, soft !== false)
  })

  ipcMain.handle('db:task:getById', (_, id: string) => {
    return getTaskById(id)
  })

  ipcMain.handle('db:task:getByWorkspace', (_, workspaceId: string) => {
    return getTasksByWorkspace(workspaceId)
  })

  ipcMain.handle('db:task:getByProject', (_, projectId: string) => {
    return getTasksByProject(projectId)
  })

  ipcMain.handle('db:task:getPending', (_, workspaceId: string) => {
    return getPendingTasks(workspaceId)
  })

  ipcMain.handle('db:task:getUnsynced', () => {
    return getUnsyncedTasks()
  })

  // ============================================
  // Database - Workspaces (Offline Mode)
  // ============================================

  ipcMain.handle('db:workspace:create', (_, workspace: Omit<LocalWorkspace, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => {
    return createWorkspace(workspace)
  })

  ipcMain.handle('db:workspace:getAll', () => {
    return getWorkspaces()
  })

  ipcMain.handle('db:workspace:getById', (_, id: string) => {
    return getWorkspaceById(id)
  })

  // ============================================
  // Database - Projects (Offline Mode)
  // ============================================

  ipcMain.handle('db:project:create', (_, project: Omit<LocalProject, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => {
    return createProject(project)
  })

  ipcMain.handle('db:project:getByWorkspace', (_, workspaceId: string) => {
    return getProjectsByWorkspace(workspaceId)
  })

  // ============================================
  // Database - Pomodoro Sessions (Offline Mode)
  // ============================================

  ipcMain.handle('db:session:create', (_, session: Omit<LocalPomodoroSession, 'id' | 'created_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => {
    return createPomodoroSession(session)
  })

  ipcMain.handle('db:session:getByWorkspace', (_, workspaceId: string, startDate?: number, endDate?: number) => {
    return getSessionsByWorkspace(workspaceId, startDate, endDate)
  })

  // ============================================
  // Sync Engine
  // ============================================

  ipcMain.handle('sync:setAuthToken', (_, token: string | null) => {
    setAuthToken(token)
    return true
  })

  ipcMain.handle('sync:startAuto', (_, intervalMs?: number) => {
    startAutoSync(intervalMs)
    return true
  })

  ipcMain.handle('sync:stopAuto', () => {
    stopAutoSync()
    return true
  })

  ipcMain.handle('sync:setOnlineStatus', (_, isOnline: boolean) => {
    setOnlineStatus(isOnline)
    return true
  })

  ipcMain.handle('sync:getState', () => {
    return getSyncState()
  })

  ipcMain.handle('sync:force', async () => {
    await forceSync()
    return getSyncState()
  })

  ipcMain.handle('sync:getQueueStats', () => {
    return getSyncQueueStats()
  })
}

export function getStore(): Store<StoreSchema> {
  return store
}

export function cleanupIpcHandlers(): void {
  // Remove all handlers
  ipcMain.removeAllListeners()
  unregisterAllShortcuts()
  
  // Cleanup database and sync engine
  cleanupSyncEngine()
  closeDatabase()
}
