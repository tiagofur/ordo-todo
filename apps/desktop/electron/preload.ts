import { contextBridge, ipcRenderer } from 'electron'

// Types for Timer State
interface TrayState {
    timerActive: boolean
    isPaused: boolean
    timeRemaining: string
    currentTask: string | null
    mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'
}

interface NotificationOptions {
    title: string
    body: string
    silent?: boolean
    urgency?: 'normal' | 'critical' | 'low'
}

interface ShortcutConfig {
    id: string
    accelerator: string
    action: string
    description: string
    enabled: boolean
}

// Sync State types
interface SyncState {
    status: 'idle' | 'syncing' | 'error' | 'offline'
    lastSyncTime: number | null
    pendingChanges: number
    failedChanges: number
    isOnline: boolean
    currentOperation?: string
    error?: string
}

interface SyncQueueStats {
    pending: number
    failed: number
    total: number
}

// Local entity types
interface LocalTask {
    id: string
    workspace_id: string
    project_id?: string | null
    title: string
    description?: string | null
    status: string
    priority: string
    due_date?: number | null
    estimated_pomodoros: number
    completed_pomodoros: number
    position: number
    parent_task_id?: string | null
    created_at: number
    updated_at: number
    completed_at?: number | null
    is_synced: number
    sync_status: string
    local_updated_at: number
    server_updated_at?: number | null
    is_deleted: number
}

interface LocalWorkspace {
    id: string
    name: string
    description?: string | null
    color?: string | null
    icon?: string | null
    owner_id: string
    created_at: number
    updated_at: number
    is_synced: number
    sync_status: string
    local_updated_at: number
    server_updated_at?: number | null
    is_deleted: number
}

interface LocalProject {
    id: string
    workspace_id: string
    name: string
    description?: string | null
    color?: string | null
    status: string
    start_date?: number | null
    end_date?: number | null
    created_at: number
    updated_at: number
    is_synced: number
    sync_status: string
    local_updated_at: number
    server_updated_at?: number | null
    is_deleted: number
}

interface LocalPomodoroSession {
    id: string
    task_id?: string | null
    workspace_id: string
    type: 'focus' | 'short_break' | 'long_break'
    duration: number
    started_at: number
    completed_at?: number | null
    was_interrupted: number
    notes?: string | null
    created_at: number
    is_synced: number
    sync_status: string
    local_updated_at: number
    server_updated_at?: number | null
    is_deleted: number
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // ============================================
    // Window Controls
    // ============================================
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('window:setAlwaysOnTop', flag),
    isAlwaysOnTop: () => ipcRenderer.invoke('window:isAlwaysOnTop'),
    showWindow: () => ipcRenderer.invoke('window:show'),
    hideWindow: () => ipcRenderer.invoke('window:hide'),

    // ============================================
    // Platform Info
    // ============================================
    platform: process.platform,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },

    // ============================================
    // App Info
    // ============================================
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    isPackaged: () => ipcRenderer.invoke('app:isPackaged'),

    // ============================================
    // Tray Controls
    // ============================================
    updateTray: (state: Partial<TrayState>) => ipcRenderer.invoke('tray:update', state),
    sendTimerState: (state: TrayState) => ipcRenderer.send('timer:stateUpdate', state),

    // ============================================
    // Notifications
    // ============================================
    showNotification: (options: NotificationOptions) => ipcRenderer.invoke('notification:show', options),
    notifyPomodoroComplete: () => ipcRenderer.invoke('notification:pomodoroComplete'),
    notifyShortBreakComplete: () => ipcRenderer.invoke('notification:shortBreakComplete'),
    notifyLongBreakComplete: () => ipcRenderer.invoke('notification:longBreakComplete'),
    notifyTaskDue: (taskTitle: string) => ipcRenderer.invoke('notification:taskDue', taskTitle),
    notifyTaskReminder: (taskTitle: string, dueIn: string) => 
        ipcRenderer.invoke('notification:taskReminder', taskTitle, dueIn),

    // ============================================
    // Shortcuts
    // ============================================
    getShortcuts: () => ipcRenderer.invoke('shortcuts:getAll'),
    getDefaultShortcuts: () => ipcRenderer.invoke('shortcuts:getDefaults'),
    updateShortcut: (id: string, updates: Partial<ShortcutConfig>) => 
        ipcRenderer.invoke('shortcuts:update', id, updates),
    resetShortcuts: () => ipcRenderer.invoke('shortcuts:reset'),

    // ============================================
    // Store (Persistent Settings)
    // ============================================
    storeGet: (key: string) => ipcRenderer.invoke('store:get', key),
    storeSet: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    storeDelete: (key: string) => ipcRenderer.invoke('store:delete', key),
    storeClear: () => ipcRenderer.invoke('store:clear'),

    // ============================================
    // Event Listeners
    // ============================================
    onTrayAction: (callback: (action: string) => void) => {
        ipcRenderer.on('tray-action', (_event, action) => callback(action))
    },
    onGlobalShortcut: (callback: (action: string) => void) => {
        ipcRenderer.on('global-shortcut', (_event, action) => callback(action))
    },
    onMenuAction: (callback: (action: string, ...args: unknown[]) => void) => {
        ipcRenderer.on('menu-action', (_event, action, ...args) => callback(action, ...args))
    },
    onNotificationAction: (callback: (action: string) => void) => {
        ipcRenderer.on('notification-action', (_event, action) => callback(action))
    },
    onMainProcessMessage: (callback: (message: string) => void) => {
        ipcRenderer.on('main-process-message', (_event, message) => callback(message))
    },

    // ============================================
    // Remove Listeners
    // ============================================
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel)
    },

    // ============================================
    // Database - Tasks (Offline Mode)
    // ============================================
    db: {
        task: {
            create: (task: unknown) => ipcRenderer.invoke('db:task:create', task),
            update: (id: string, updates: unknown) => ipcRenderer.invoke('db:task:update', id, updates),
            delete: (id: string, soft?: boolean) => ipcRenderer.invoke('db:task:delete', id, soft),
            getById: (id: string) => ipcRenderer.invoke('db:task:getById', id),
            getByWorkspace: (workspaceId: string) => ipcRenderer.invoke('db:task:getByWorkspace', workspaceId),
            getByProject: (projectId: string) => ipcRenderer.invoke('db:task:getByProject', projectId),
            getPending: (workspaceId: string) => ipcRenderer.invoke('db:task:getPending', workspaceId),
            getUnsynced: () => ipcRenderer.invoke('db:task:getUnsynced'),
        },
        workspace: {
            create: (workspace: unknown) => ipcRenderer.invoke('db:workspace:create', workspace),
            getAll: () => ipcRenderer.invoke('db:workspace:getAll'),
            getById: (id: string) => ipcRenderer.invoke('db:workspace:getById', id),
        },
        project: {
            create: (project: unknown) => ipcRenderer.invoke('db:project:create', project),
            getByWorkspace: (workspaceId: string) => ipcRenderer.invoke('db:project:getByWorkspace', workspaceId),
        },
        session: {
            create: (session: unknown) => ipcRenderer.invoke('db:session:create', session),
            getByWorkspace: (workspaceId: string, startDate?: number, endDate?: number) => 
                ipcRenderer.invoke('db:session:getByWorkspace', workspaceId, startDate, endDate),
        },
    },

    // ============================================
    // Sync Engine
    // ============================================
    sync: {
        setAuthToken: (token: string | null) => ipcRenderer.invoke('sync:setAuthToken', token),
        startAuto: (intervalMs?: number) => ipcRenderer.invoke('sync:startAuto', intervalMs),
        stopAuto: () => ipcRenderer.invoke('sync:stopAuto'),
        setOnlineStatus: (isOnline: boolean) => ipcRenderer.invoke('sync:setOnlineStatus', isOnline),
        getState: () => ipcRenderer.invoke('sync:getState'),
        force: () => ipcRenderer.invoke('sync:force'),
        getQueueStats: () => ipcRenderer.invoke('sync:getQueueStats'),
        onStateChanged: (callback: (state: SyncState) => void) => {
            ipcRenderer.on('sync-state-changed', (_event, state) => callback(state))
        },
    },
})

// Declare types for TypeScript
declare global {
    interface Window {
        electronAPI: {
            // Window Controls
            minimizeWindow: () => Promise<void>
            maximizeWindow: () => Promise<void>
            closeWindow: () => Promise<void>
            isMaximized: () => Promise<boolean>
            setAlwaysOnTop: (flag: boolean) => Promise<boolean>
            isAlwaysOnTop: () => Promise<boolean>
            showWindow: () => Promise<void>
            hideWindow: () => Promise<void>

            // Platform Info
            platform: string
            versions: {
                node: string
                chrome: string
                electron: string
            }

            // App Info
            getVersion: () => Promise<string>
            getName: () => Promise<string>
            getPath: (name: string) => Promise<string>
            isPackaged: () => Promise<boolean>

            // Tray Controls
            updateTray: (state: Partial<TrayState>) => Promise<void>
            sendTimerState: (state: TrayState) => void

            // Notifications
            showNotification: (options: NotificationOptions) => Promise<boolean>
            notifyPomodoroComplete: () => Promise<void>
            notifyShortBreakComplete: () => Promise<void>
            notifyLongBreakComplete: () => Promise<void>
            notifyTaskDue: (taskTitle: string) => Promise<void>
            notifyTaskReminder: (taskTitle: string, dueIn: string) => Promise<void>

            // Shortcuts
            getShortcuts: () => Promise<ShortcutConfig[]>
            getDefaultShortcuts: () => Promise<ShortcutConfig[]>
            updateShortcut: (id: string, updates: Partial<ShortcutConfig>) => Promise<boolean>
            resetShortcuts: () => Promise<ShortcutConfig[]>

            // Store
            storeGet: (key: string) => Promise<unknown>
            storeSet: (key: string, value: unknown) => Promise<boolean>
            storeDelete: (key: string) => Promise<boolean>
            storeClear: () => Promise<boolean>

            // Event Listeners
            onTrayAction: (callback: (action: string) => void) => void
            onGlobalShortcut: (callback: (action: string) => void) => void
            onMenuAction: (callback: (action: string, ...args: unknown[]) => void) => void
            onNotificationAction: (callback: (action: string) => void) => void
            onMainProcessMessage: (callback: (message: string) => void) => void

            // Remove Listeners
            removeAllListeners: (channel: string) => void

            // Database (Offline Mode)
            db: {
                task: {
                    create: (task: Omit<LocalTask, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => Promise<LocalTask>
                    update: (id: string, updates: Partial<LocalTask>) => Promise<LocalTask | null>
                    delete: (id: string, soft?: boolean) => Promise<boolean>
                    getById: (id: string) => Promise<LocalTask | null>
                    getByWorkspace: (workspaceId: string) => Promise<LocalTask[]>
                    getByProject: (projectId: string) => Promise<LocalTask[]>
                    getPending: (workspaceId: string) => Promise<LocalTask[]>
                    getUnsynced: () => Promise<LocalTask[]>
                }
                workspace: {
                    create: (workspace: Omit<LocalWorkspace, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => Promise<LocalWorkspace>
                    getAll: () => Promise<LocalWorkspace[]>
                    getById: (id: string) => Promise<LocalWorkspace | null>
                }
                project: {
                    create: (project: Omit<LocalProject, 'id' | 'created_at' | 'updated_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => Promise<LocalProject>
                    getByWorkspace: (workspaceId: string) => Promise<LocalProject[]>
                }
                session: {
                    create: (session: Omit<LocalPomodoroSession, 'id' | 'created_at' | 'local_updated_at' | 'is_synced' | 'sync_status' | 'is_deleted'>) => Promise<LocalPomodoroSession>
                    getByWorkspace: (workspaceId: string, startDate?: number, endDate?: number) => Promise<LocalPomodoroSession[]>
                }
            }

            // Sync Engine
            sync: {
                setAuthToken: (token: string | null) => Promise<boolean>
                startAuto: (intervalMs?: number) => Promise<boolean>
                stopAuto: () => Promise<boolean>
                setOnlineStatus: (isOnline: boolean) => Promise<boolean>
                getState: () => Promise<SyncState>
                force: () => Promise<SyncState>
                getQueueStats: () => Promise<SyncQueueStats>
                onStateChanged: (callback: (state: SyncState) => void) => void
            }
        }
    }
}