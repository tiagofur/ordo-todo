import { app, BrowserWindow } from 'electron'

const PROTOCOL = 'ordo'

let mainWindow: BrowserWindow | null = null
let pendingDeepLink: string | null = null

export interface DeepLinkData {
  type: 'task' | 'project' | 'workspace' | 'timer' | 'settings' | 'unknown'
  id?: string
  action?: string
  params?: Record<string, string>
}

/**
 * Parse ordo:// deep link URL
 * Examples:
 * - ordo://task/123
 * - ordo://task/123/edit
 * - ordo://project/456
 * - ordo://timer/start
 * - ordo://settings/shortcuts
 */
export function parseDeepLink(url: string): DeepLinkData {
  try {
    // Remove protocol prefix
    const path = url.replace(`${PROTOCOL}://`, '')
    const parts = path.split('/')
    const [type, id, action] = parts

    // Parse query params if present
    const params: Record<string, string> = {}
    if (id?.includes('?')) {
      const [actualId, queryString] = id.split('?')
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => {
        params[key] = value
      })
      return {
        type: validateType(type),
        id: actualId,
        action,
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    }

    return {
      type: validateType(type),
      id: id || undefined,
      action: action || undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
    }
  } catch (error) {
    console.error('[DeepLinks] Failed to parse URL:', url, error)
    return { type: 'unknown' }
  }
}

function validateType(type: string): DeepLinkData['type'] {
  const validTypes = ['task', 'project', 'workspace', 'timer', 'settings']
  return validTypes.includes(type) ? (type as DeepLinkData['type']) : 'unknown'
}

/**
 * Handle deep link navigation
 */
export function handleDeepLink(url: string): void {
  console.log('[DeepLinks] Handling URL:', url)

  if (!mainWindow || mainWindow.isDestroyed()) {
    // Store for later processing when window is ready
    pendingDeepLink = url
    return
  }

  const data = parseDeepLink(url)
  console.log('[DeepLinks] Parsed data:', data)

  // Show and focus the main window
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()

  // Send to renderer process for navigation
  mainWindow.webContents.send('deep-link', data)
}

/**
 * Process any pending deep link (called when app is ready)
 */
export function processPendingDeepLink(): void {
  if (pendingDeepLink) {
    handleDeepLink(pendingDeepLink)
    pendingDeepLink = null
  }
}

/**
 * Register as the handler for ordo:// protocol
 */
export function registerDeepLinkProtocol(window: BrowserWindow): void {
  mainWindow = window

  // Set as default protocol client
  if (process.defaultApp) {
    // Development - need to pass path to electron and script
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]])
    }
  } else {
    // Production
    app.setAsDefaultProtocolClient(PROTOCOL)
  }

  // Windows/Linux: Handle protocol URL from second instance
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    // Another instance is already running
    app.quit()
    return
  }

  // Handle second instance launching with deep link (Windows/Linux)
  app.on('second-instance', (_event, commandLine) => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

    // Find the deep link URL in command line
    const deepLinkUrl = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`))
    if (deepLinkUrl) {
      handleDeepLink(deepLinkUrl)
    }
  })

  // macOS: Handle protocol URL
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url)
  })

  // Check if app was opened with a deep link (Windows/Linux)
  const deepLinkArg = process.argv.find((arg) => arg.startsWith(`${PROTOCOL}://`))
  if (deepLinkArg) {
    pendingDeepLink = deepLinkArg
  }

  console.log(`[DeepLinks] Protocol "${PROTOCOL}://" registered`)
}

/**
 * Unregister the protocol handler
 */
export function unregisterDeepLinkProtocol(): void {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]])
    }
  } else {
    app.removeAsDefaultProtocolClient(PROTOCOL)
  }

  console.log(`[DeepLinks] Protocol "${PROTOCOL}://" unregistered`)
}

/**
 * Get the protocol name
 */
export function getProtocolName(): string {
  return PROTOCOL
}

/**
 * Generate a deep link URL
 */
export function createDeepLink(
  type: DeepLinkData['type'],
  id?: string,
  action?: string,
  params?: Record<string, string>
): string {
  let url = `${PROTOCOL}://${type}`

  if (id) {
    url += `/${id}`
  }

  if (action) {
    url += `/${action}`
  }

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  return url
}
