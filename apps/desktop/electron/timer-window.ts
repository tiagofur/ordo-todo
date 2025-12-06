import { BrowserWindow, screen, ipcMain, app } from 'electron'
import * as path from 'path'

let timerWindow: BrowserWindow | null = null
let mainWindow: BrowserWindow | null = null

export interface TimerWindowState {
  timeRemaining: string
  mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'
  isRunning: boolean
  isPaused: boolean
  taskTitle: string | null
  progress: number
}

const TIMER_WINDOW_WIDTH = 280
const TIMER_WINDOW_HEIGHT = 120

function getDefaultPosition(): { x: number; y: number } {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  return {
    x: width - TIMER_WINDOW_WIDTH - 20,
    y: 20,
  }
}

export function createTimerWindow(parent: BrowserWindow): BrowserWindow {
  mainWindow = parent

  const { x, y } = getDefaultPosition()

  timerWindow = new BrowserWindow({
    width: TIMER_WINDOW_WIDTH,
    height: TIMER_WINDOW_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    focusable: true,
    show: false,
    hasShadow: true,
    vibrancy: process.platform === 'darwin' ? 'popover' : undefined,
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Load the timer window content
  const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

  if (VITE_DEV_SERVER_URL) {
    timerWindow.loadURL(`${VITE_DEV_SERVER_URL}#/timer-floating`)
  } else {
    timerWindow.loadFile(path.join(process.env.DIST!, 'index.html'), {
      hash: '/timer-floating',
    })
  }

  // Prevent close, just hide
  timerWindow.on('close', (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault()
      timerWindow?.hide()
    }
  })

  return timerWindow
}

export function showTimerWindow(): void {
  if (timerWindow) {
    timerWindow.show()
  }
}

export function hideTimerWindow(): void {
  if (timerWindow) {
    timerWindow.hide()
  }
}

export function toggleTimerWindow(): void {
  if (timerWindow) {
    if (timerWindow.isVisible()) {
      timerWindow.hide()
    } else {
      timerWindow.show()
    }
  }
}

export function isTimerWindowVisible(): boolean {
  return timerWindow?.isVisible() ?? false
}

export function destroyTimerWindow(): void {
  if (timerWindow) {
    timerWindow.destroy()
    timerWindow = null
  }
}

export function updateTimerWindowState(state: Partial<TimerWindowState>): void {
  if (timerWindow && !timerWindow.isDestroyed()) {
    timerWindow.webContents.send('timer-window:state-update', state)
  }
}

export function setTimerWindowPosition(x: number, y: number): void {
  if (timerWindow) {
    timerWindow.setPosition(x, y)
  }
}

export function getTimerWindowPosition(): { x: number; y: number } | null {
  if (timerWindow) {
    const [x, y] = timerWindow.getPosition()
    return { x, y }
  }
  return null
}

export function getTimerWindow(): BrowserWindow | null {
  return timerWindow
}

// IPC Handlers for timer window
export function setupTimerWindowIpcHandlers(): void {
  ipcMain.handle('timer-window:show', () => {
    showTimerWindow()
  })

  ipcMain.handle('timer-window:hide', () => {
    hideTimerWindow()
  })

  ipcMain.handle('timer-window:toggle', () => {
    toggleTimerWindow()
    return isTimerWindowVisible()
  })

  ipcMain.handle('timer-window:isVisible', () => {
    return isTimerWindowVisible()
  })

  ipcMain.handle('timer-window:setPosition', (_, x: number, y: number) => {
    setTimerWindowPosition(x, y)
  })

  ipcMain.handle('timer-window:getPosition', () => {
    return getTimerWindowPosition()
  })

  // Handle timer actions from floating window
  ipcMain.handle('timer-window:action', (_, action: string) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('timer-window:action', action)
    }
  })

  // Handle expand to main window
  ipcMain.handle('timer-window:expand', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
    hideTimerWindow()
  })

  // Receive timer state updates from renderer
  ipcMain.on('timer:stateUpdate', (_, state: TimerWindowState) => {
    updateTimerWindowState(state)
  })
}

export function cleanupTimerWindowIpcHandlers(): void {
  ipcMain.removeHandler('timer-window:show')
  ipcMain.removeHandler('timer-window:hide')
  ipcMain.removeHandler('timer-window:toggle')
  ipcMain.removeHandler('timer-window:isVisible')
  ipcMain.removeHandler('timer-window:setPosition')
  ipcMain.removeHandler('timer-window:getPosition')
  ipcMain.removeHandler('timer-window:action')
  ipcMain.removeHandler('timer-window:expand')
}
