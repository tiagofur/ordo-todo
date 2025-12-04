import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater, UpdateCheckResult, UpdateInfo, ProgressInfo } from 'electron-updater'

let mainWindow: BrowserWindow | null = null

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateState {
  status: UpdateStatus
  version?: string
  releaseNotes?: string
  progress?: number
  bytesPerSecond?: number
  downloadedBytes?: number
  totalBytes?: number
  error?: string
}

let currentState: UpdateState = { status: 'idle' }

function updateState(newState: Partial<UpdateState>): void {
  currentState = { ...currentState, ...newState }
  notifyRenderer()
}

function notifyRenderer(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('auto-update:state', currentState)
  }
}

/**
 * Initialize auto-updater with configuration
 */
export function initAutoUpdater(window: BrowserWindow): void {
  mainWindow = window

  // Configure auto-updater
  autoUpdater.autoDownload = false // Don't download automatically, let user decide
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.autoRunAppAfterInstall = true

  // Allow prereleases based on channel
  autoUpdater.allowPrerelease = false

  // Set up logging
  autoUpdater.logger = {
    info: (message: string) => console.log('[AutoUpdater]', message),
    warn: (message: string) => console.warn('[AutoUpdater]', message),
    error: (message: string) => console.error('[AutoUpdater]', message),
    debug: (message: string) => console.log('[AutoUpdater DEBUG]', message),
  }

  // ============================================
  // Event Handlers
  // ============================================

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...')
    updateState({ status: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('[AutoUpdater] Update available:', info.version)
    updateState({
      status: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
          ? info.releaseNotes.map((n) => n.note).join('\n')
          : undefined,
    })
  })

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('[AutoUpdater] No updates available. Current:', info.version)
    updateState({
      status: 'not-available',
      version: info.version,
    })
  })

  autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
    console.log(`[AutoUpdater] Download progress: ${progressObj.percent.toFixed(1)}%`)
    updateState({
      status: 'downloading',
      progress: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      downloadedBytes: progressObj.transferred,
      totalBytes: progressObj.total,
    })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    console.log('[AutoUpdater] Update downloaded:', info.version)
    updateState({
      status: 'downloaded',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
          ? info.releaseNotes.map((n) => n.note).join('\n')
          : undefined,
    })

    // Show dialog to user
    showUpdateReadyDialog(info.version)
  })

  autoUpdater.on('error', (error: Error) => {
    console.error('[AutoUpdater] Error:', error.message)
    updateState({
      status: 'error',
      error: error.message,
    })
  })

  // Setup IPC handlers
  setupAutoUpdaterIpcHandlers()

  // Check for updates after a delay (don't block startup)
  if (app.isPackaged) {
    setTimeout(() => {
      checkForUpdates(false)
    }, 10000) // 10 seconds after launch

    // Check periodically (every 4 hours)
    setInterval(() => {
      checkForUpdates(false)
    }, 4 * 60 * 60 * 1000)
  }

  console.log('[AutoUpdater] Initialized')
}

/**
 * Check for updates
 */
export async function checkForUpdates(silent: boolean = true): Promise<UpdateCheckResult | null> {
  try {
    if (!app.isPackaged) {
      console.log('[AutoUpdater] Skipping update check in development mode')
      if (!silent) {
        updateState({
          status: 'not-available',
          version: app.getVersion(),
        })
      }
      return null
    }

    const result = await autoUpdater.checkForUpdates()
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[AutoUpdater] Check failed:', errorMessage)

    if (!silent) {
      updateState({
        status: 'error',
        error: errorMessage,
      })
    }
    return null
  }
}

/**
 * Download the available update
 */
export async function downloadUpdate(): Promise<void> {
  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Download failed'
    console.error('[AutoUpdater] Download failed:', errorMessage)
    updateState({
      status: 'error',
      error: errorMessage,
    })
  }
}

/**
 * Install the downloaded update and restart
 */
export function installUpdate(): void {
  console.log('[AutoUpdater] Installing update and restarting...')
  autoUpdater.quitAndInstall(false, true)
}

/**
 * Get current update state
 */
export function getUpdateState(): UpdateState {
  return currentState
}

/**
 * Show dialog when update is ready to install
 */
async function showUpdateReadyDialog(version: string): Promise<void> {
  if (!mainWindow || mainWindow.isDestroyed()) return

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización Lista',
    message: `Una nueva versión (${version}) está lista para instalar.`,
    detail: 'La aplicación se reiniciará para aplicar la actualización.',
    buttons: ['Reiniciar Ahora', 'Más Tarde'],
    defaultId: 0,
    cancelId: 1,
  })

  if (response === 0) {
    installUpdate()
  }
}

/**
 * Setup IPC handlers for auto-updater
 */
function setupAutoUpdaterIpcHandlers(): void {
  ipcMain.handle('auto-update:check', async (_, silent?: boolean) => {
    await checkForUpdates(silent ?? true)
    return currentState
  })

  ipcMain.handle('auto-update:download', async () => {
    await downloadUpdate()
    return currentState
  })

  ipcMain.handle('auto-update:install', () => {
    installUpdate()
  })

  ipcMain.handle('auto-update:getState', () => {
    return currentState
  })

  ipcMain.handle('auto-update:getVersion', () => {
    return app.getVersion()
  })
}

/**
 * Cleanup auto-updater handlers
 */
export function cleanupAutoUpdater(): void {
  ipcMain.removeHandler('auto-update:check')
  ipcMain.removeHandler('auto-update:download')
  ipcMain.removeHandler('auto-update:install')
  ipcMain.removeHandler('auto-update:getState')
  ipcMain.removeHandler('auto-update:getVersion')
  mainWindow = null
}
