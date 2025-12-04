import { app, ipcMain } from 'electron'
import Store from 'electron-store'

// Cross-platform auto-launch settings
interface AutoLaunchSettings {
  enabled: boolean
  minimized: boolean
}

interface AutoLaunchStore {
  autoLaunch: AutoLaunchSettings
}

const store = new Store<AutoLaunchStore>({
  name: 'auto-launch-settings',
  defaults: {
    autoLaunch: {
      enabled: false,
      minimized: true, // Start minimized by default
    },
  },
})

/**
 * Check if auto-launch is enabled
 */
export function isAutoLaunchEnabled(): boolean {
  return store.get('autoLaunch.enabled', false)
}

/**
 * Check if should start minimized
 */
export function shouldStartMinimized(): boolean {
  return store.get('autoLaunch.minimized', true)
}

/**
 * Get auto-launch settings
 */
export function getAutoLaunchSettings(): AutoLaunchSettings {
  return store.get('autoLaunch')
}

/**
 * Enable auto-launch at system startup
 */
export function enableAutoLaunch(minimized: boolean = true): boolean {
  try {
    const loginItemSettings = getLoginItemSettings()

    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: minimized,
      // Windows specific
      args: minimized ? ['--hidden'] : [],
      // macOS/Linux path
      path: process.execPath,
    })

    store.set('autoLaunch', {
      enabled: true,
      minimized,
    })

    console.log('[AutoLaunch] Enabled:', { minimized })
    return true
  } catch (error) {
    console.error('[AutoLaunch] Failed to enable:', error)
    return false
  }
}

/**
 * Disable auto-launch at system startup
 */
export function disableAutoLaunch(): boolean {
  try {
    app.setLoginItemSettings({
      openAtLogin: false,
      openAsHidden: false,
    })

    store.set('autoLaunch.enabled', false)

    console.log('[AutoLaunch] Disabled')
    return true
  } catch (error) {
    console.error('[AutoLaunch] Failed to disable:', error)
    return false
  }
}

/**
 * Toggle auto-launch
 */
export function toggleAutoLaunch(): boolean {
  const currentlyEnabled = isAutoLaunchEnabled()

  if (currentlyEnabled) {
    disableAutoLaunch()
  } else {
    enableAutoLaunch(shouldStartMinimized())
  }

  return !currentlyEnabled
}

/**
 * Set start minimized preference
 */
export function setStartMinimized(minimized: boolean): void {
  store.set('autoLaunch.minimized', minimized)

  // If auto-launch is enabled, update the setting
  if (isAutoLaunchEnabled()) {
    enableAutoLaunch(minimized)
  }
}

/**
 * Get login item settings from the system
 */
export function getLoginItemSettings(): Electron.LoginItemSettings {
  return app.getLoginItemSettings()
}

/**
 * Check if we were started at login (hidden)
 */
export function wasStartedAtLogin(): boolean {
  // Check command line args for --hidden flag
  const hasHiddenArg = process.argv.includes('--hidden')

  // Check macOS/Linux hidden start
  const loginSettings = getLoginItemSettings()
  const wasOpenedAsHidden = loginSettings.wasOpenedAsHidden ?? false

  return hasHiddenArg || wasOpenedAsHidden
}

/**
 * Initialize auto-launch module and sync with system state
 */
export function initAutoLaunch(): void {
  // Sync store with actual system state
  const systemSettings = getLoginItemSettings()
  const storedEnabled = store.get('autoLaunch.enabled', false)

  // If system state differs from stored state, update store
  if (systemSettings.openAtLogin !== storedEnabled) {
    store.set('autoLaunch.enabled', systemSettings.openAtLogin)
  }

  // Setup IPC handlers
  setupAutoLaunchIpcHandlers()

  console.log('[AutoLaunch] Initialized:', {
    enabled: systemSettings.openAtLogin,
    wasOpenedAtLogin: wasStartedAtLogin(),
  })
}

/**
 * Setup IPC handlers for auto-launch
 */
function setupAutoLaunchIpcHandlers(): void {
  ipcMain.handle('auto-launch:isEnabled', () => {
    return isAutoLaunchEnabled()
  })

  ipcMain.handle('auto-launch:getSettings', () => {
    return getAutoLaunchSettings()
  })

  ipcMain.handle('auto-launch:enable', (_, minimized?: boolean) => {
    return enableAutoLaunch(minimized ?? true)
  })

  ipcMain.handle('auto-launch:disable', () => {
    return disableAutoLaunch()
  })

  ipcMain.handle('auto-launch:toggle', () => {
    return toggleAutoLaunch()
  })

  ipcMain.handle('auto-launch:setStartMinimized', (_, minimized: boolean) => {
    setStartMinimized(minimized)
    return true
  })

  ipcMain.handle('auto-launch:wasStartedAtLogin', () => {
    return wasStartedAtLogin()
  })
}

/**
 * Cleanup IPC handlers
 */
export function cleanupAutoLaunch(): void {
  ipcMain.removeHandler('auto-launch:isEnabled')
  ipcMain.removeHandler('auto-launch:getSettings')
  ipcMain.removeHandler('auto-launch:enable')
  ipcMain.removeHandler('auto-launch:disable')
  ipcMain.removeHandler('auto-launch:toggle')
  ipcMain.removeHandler('auto-launch:setStartMinimized')
  ipcMain.removeHandler('auto-launch:wasStartedAtLogin')
}
