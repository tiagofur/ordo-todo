import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron'
import * as path from 'path'

let tray: Tray | null = null

export interface TrayState {
  timerActive: boolean
  isPaused: boolean
  timeRemaining: string
  currentTask: string | null
  mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'
}

const defaultState: TrayState = {
  timerActive: false,
  isPaused: false,
  timeRemaining: '25:00',
  currentTask: null,
  mode: 'IDLE',
}

let currentState: TrayState = { ...defaultState }

function getIconPath(): string {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png'
  
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', iconName)
  }
  
  // Development path
  return path.join(__dirname, '..', 'build', iconName)
}

function getModeEmoji(mode: TrayState['mode']): string {
  switch (mode) {
    case 'WORK': return '🍅'
    case 'SHORT_BREAK': return '☕'
    case 'LONG_BREAK': return '🌿'
    default: return '⏱️'
  }
}

function getModeLabel(mode: TrayState['mode']): string {
  switch (mode) {
    case 'WORK': return 'Trabajo'
    case 'SHORT_BREAK': return 'Descanso Corto'
    case 'LONG_BREAK': return 'Descanso Largo'
    default: return 'Inactivo'
  }
}

export function createTray(mainWindow: BrowserWindow): Tray {
  const iconPath = getIconPath()
  
  try {
    const icon = nativeImage.createFromPath(iconPath)
    tray = new Tray(icon.resize({ width: 16, height: 16 }))
  } catch (error) {
    // Fallback: create empty tray if icon not found
    console.warn('Tray icon not found, using default')
    tray = new Tray(nativeImage.createEmpty())
  }

  tray.setToolTip('Ordo-Todo')
  updateTrayMenu(mainWindow, defaultState)

  // Click to show/hide window
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  return tray
}

export function updateTrayMenu(mainWindow: BrowserWindow, state: TrayState): void {
  if (!tray) return

  currentState = state
  const modeEmoji = getModeEmoji(state.mode)
  const modeLabel = getModeLabel(state.mode)

  // Update tooltip with timer info
  const tooltipText = state.timerActive
    ? `Ordo-Todo - ${modeLabel} ${state.timeRemaining}`
    : 'Ordo-Todo'
  tray.setToolTip(tooltipText)

  const contextMenu = Menu.buildFromTemplate([
    // Current task info
    {
      label: state.currentTask || 'Sin tarea seleccionada',
      enabled: false,
      icon: undefined,
    },
    { type: 'separator' },

    // Timer status
    {
      label: `${modeEmoji} ${modeLabel}`,
      enabled: false,
    },
    {
      label: `⏱️ ${state.timeRemaining}`,
      enabled: false,
    },
    { type: 'separator' },

    // Timer controls
    {
      label: state.timerActive && !state.isPaused ? '⏸️ Pausar' : '▶️ Iniciar',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: () => {
        mainWindow.webContents.send('tray-action', 'timer:toggle')
      },
    },
    {
      label: '⏭️ Saltar',
      enabled: state.timerActive,
      click: () => {
        mainWindow.webContents.send('tray-action', 'timer:skip')
      },
    },
    {
      label: '⏹️ Detener',
      enabled: state.timerActive,
      click: () => {
        mainWindow.webContents.send('tray-action', 'timer:stop')
      },
    },
    { type: 'separator' },

    // Quick actions
    {
      label: '➕ Nueva Tarea',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('tray-action', 'task:create')
      },
    },
    {
      label: '📊 Dashboard',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('tray-action', 'navigate:dashboard')
      },
    },
    { type: 'separator' },

    // Window controls
    {
      label: mainWindow.isVisible() ? '🔽 Ocultar Ventana' : '🔼 Mostrar Ventana',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },

    // App controls
    {
      label: '⚙️ Configuración',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('tray-action', 'navigate:settings')
      },
    },
    { type: 'separator' },
    {
      label: '❌ Salir',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
}

export function updateTrayState(mainWindow: BrowserWindow, partialState: Partial<TrayState>): void {
  const newState = { ...currentState, ...partialState }
  updateTrayMenu(mainWindow, newState)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

export function getTray(): Tray | null {
  return tray
}
