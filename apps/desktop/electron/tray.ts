import { Tray, Menu, nativeImage, app, BrowserWindow, nativeTheme } from 'electron'
import * as path from 'path'

let tray: Tray | null = null

export interface TrayState {
  timerActive: boolean
  isPaused: boolean
  timeRemaining: string
  currentTask: string | null
  mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'
  pendingTasksCount?: number
  nextTaskTitle?: string | null
  nextTaskDue?: string | null
}

const defaultState: TrayState = {
  timerActive: false,
  isPaused: false,
  timeRemaining: '25:00',
  currentTask: null,
  mode: 'IDLE',
  pendingTasksCount: 0,
  nextTaskTitle: null,
  nextTaskDue: null,
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

  // Update tooltip with timer info and next task
  let tooltipText = 'Ordo-Todo'

  if (state.timerActive) {
    tooltipText += ` - ${modeLabel} ${state.timeRemaining}`
  }

  if (state.currentTask) {
    tooltipText += `\n🎯 ${state.currentTask}`
  }

  if (state.nextTaskTitle) {
    tooltipText += `\n📌 Próxima: ${state.nextTaskTitle}`
    if (state.nextTaskDue) {
      tooltipText += ` (${state.nextTaskDue})`
    }
  }

  if (state.pendingTasksCount !== undefined && state.pendingTasksCount > 0) {
    tooltipText += `\n📊 ${state.pendingTasksCount} pendiente${state.pendingTasksCount !== 1 ? 's' : ''}`
  }

  tray.setToolTip(tooltipText)

  // Build menu items array
  const menuItems: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    // Current task info
    {
      label: state.currentTask || 'Sin tarea seleccionada',
      enabled: false,
      icon: undefined,
    },
  ]

  // Next task info
  if (state.nextTaskTitle) {
    menuItems.push({ type: 'separator' })
    menuItems.push({
      label: `📌 Próxima: ${state.nextTaskTitle}`,
      enabled: false,
    })
    if (state.nextTaskDue) {
      menuItems.push({
        label: `⏰ Vence: ${state.nextTaskDue}`,
        enabled: false,
      })
    }
  }

  // Pending tasks count
  if (state.pendingTasksCount !== undefined) {
    menuItems.push({
      label: `📊 ${state.pendingTasksCount} tarea${state.pendingTasksCount !== 1 ? 's' : ''} pendiente${state.pendingTasksCount !== 1 ? 's' : ''}`,
      enabled: false,
    })
  }

  // Timer section
  menuItems.push({ type: 'separator' })
  menuItems.push({
    label: `${modeEmoji} ${modeLabel}`,
    enabled: false,
  })
  menuItems.push({
    label: `⏱️ ${state.timeRemaining}`,
    enabled: false,
  })
  menuItems.push({ type: 'separator' })

  // Timer controls
  menuItems.push({
    label: state.timerActive && !state.isPaused ? '⏸️ Pausar' : '▶️ Iniciar',
    accelerator: 'CmdOrCtrl+Shift+T',
    click: () => {
      mainWindow.webContents.send('tray-action', 'timer:toggle')
    },
  })
  menuItems.push({
    label: '⏭️ Saltar',
    enabled: state.timerActive,
    click: () => {
      mainWindow.webContents.send('tray-action', 'timer:skip')
    },
  })
  menuItems.push({
    label: '⏹️ Detener',
    enabled: state.timerActive,
    click: () => {
      mainWindow.webContents.send('tray-action', 'timer:stop')
    },
  })
  menuItems.push({ type: 'separator' })

  // Quick actions
  menuItems.push({
    label: '➕ Nueva Tarea',
    accelerator: 'CmdOrCtrl+Shift+N',
    click: () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.webContents.send('tray-action', 'task:create')
    },
  })
  menuItems.push({
    label: '📋 Ver Tareas de Hoy',
    click: () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.webContents.send('tray-action', 'navigate:tasks-today')
    },
  })
  menuItems.push({
    label: '📊 Dashboard',
    accelerator: 'CmdOrCtrl+Shift+D',
    click: () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.webContents.send('tray-action', 'navigate:dashboard')
    },
  })
  menuItems.push({
    label: '🎯 Focus Mode',
    accelerator: 'CmdOrCtrl+Shift+F',
    click: () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.webContents.send('tray-action', 'navigate:focus')
    },
  })
  menuItems.push({ type: 'separator' })

  // Window controls
  menuItems.push({
    label: mainWindow.isVisible() ? '🔽 Ocultar Ventana' : '🔼 Mostrar Ventana',
    click: () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    },
  })
  menuItems.push({ type: 'separator' })

  // App controls
  menuItems.push({
    label: '⚙️ Configuración',
    click: () => {
      mainWindow.show()
      mainWindow.focus()
      mainWindow.webContents.send('tray-action', 'navigate:settings')
    },
  })
  menuItems.push({ type: 'separator' })
  menuItems.push({
    label: '❌ Salir',
    click: () => {
      app.quit()
    },
  })

  const contextMenu = Menu.buildFromTemplate(menuItems)

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
