import { globalShortcut, BrowserWindow } from 'electron'

export interface ShortcutConfig {
  id: string
  accelerator: string
  action: string
  description: string
  enabled: boolean
}

// Default shortcuts configuration
export const defaultShortcuts: ShortcutConfig[] = [
  {
    id: 'timer-toggle',
    accelerator: 'CmdOrCtrl+Shift+T',
    action: 'timer:toggle',
    description: 'Iniciar/Pausar Timer',
    enabled: true,
  },
  {
    id: 'timer-skip',
    accelerator: 'CmdOrCtrl+Shift+K',
    action: 'timer:skip',
    description: 'Saltar al siguiente',
    enabled: true,
  },
  {
    id: 'task-create',
    accelerator: 'CmdOrCtrl+Shift+N',
    action: 'task:create',
    description: 'Nueva Tarea Rápida',
    enabled: true,
  },
  {
    id: 'window-toggle',
    accelerator: 'CmdOrCtrl+Shift+O',
    action: 'window:toggle',
    description: 'Mostrar/Ocultar Ventana',
    enabled: true,
  },
  {
    id: 'navigate-dashboard',
    accelerator: 'CmdOrCtrl+Shift+D',
    action: 'navigate:dashboard',
    description: 'Ir a Dashboard',
    enabled: true,
  },
  {
    id: 'navigate-focus',
    accelerator: 'CmdOrCtrl+Shift+F',
    action: 'navigate:focus',
    description: 'Ir a Modo Focus',
    enabled: true,
  },
  {
    id: 'navigate-tasks-today',
    accelerator: 'CmdOrCtrl+Shift+H',
    action: 'navigate:tasks-today',
    description: 'Ir a Tareas de Hoy',
    enabled: true,
  },
  {
    id: 'command-palette',
    accelerator: 'CmdOrCtrl+Shift+P',
    action: 'command:palette',
    description: 'Abrir Command Palette',
    enabled: true,
  },
  {
    id: 'timer-window-toggle',
    accelerator: 'CmdOrCtrl+Shift+W',
    action: 'timer-window:toggle',
    description: 'Mostrar/Ocultar Timer Flotante',
    enabled: true,
  },
]

const registeredShortcuts: Map<string, ShortcutConfig> = new Map()

export function registerGlobalShortcuts(mainWindow: BrowserWindow, shortcuts: ShortcutConfig[] = defaultShortcuts): void {
  // Unregister existing shortcuts first
  unregisterAllShortcuts()

  shortcuts.forEach((shortcut) => {
    if (!shortcut.enabled) return

    try {
      const success = globalShortcut.register(shortcut.accelerator, () => {
        handleShortcutAction(mainWindow, shortcut.action)
      })

      if (success) {
        registeredShortcuts.set(shortcut.id, shortcut)
        console.log(`Shortcut registered: ${shortcut.accelerator} -> ${shortcut.action}`)
      } else {
        console.warn(`Failed to register shortcut: ${shortcut.accelerator}`)
      }
    } catch (error) {
      console.error(`Error registering shortcut ${shortcut.accelerator}:`, error)
    }
  })
}

function handleShortcutAction(mainWindow: BrowserWindow, action: string): void {
  switch (action) {
    case 'window:toggle':
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
      break

    case 'timer-window:toggle':
      // Send to renderer to handle timer window toggle
      mainWindow.webContents.send('global-shortcut', action)
      break

    default:
      // Send action to renderer process for navigation and other actions
      mainWindow.webContents.send('global-shortcut', action)

      // Show window for navigation and create actions
      if (action.startsWith('navigate:') || action === 'task:create' || action === 'command:palette') {
        mainWindow.show()
        mainWindow.focus()
      }
      break
  }
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
  registeredShortcuts.clear()
  console.log('All global shortcuts unregistered')
}

export function unregisterShortcut(id: string): boolean {
  const shortcut = registeredShortcuts.get(id)
  if (shortcut) {
    globalShortcut.unregister(shortcut.accelerator)
    registeredShortcuts.delete(id)
    console.log(`Shortcut unregistered: ${shortcut.accelerator}`)
    return true
  }
  return false
}

export function isShortcutRegistered(accelerator: string): boolean {
  return globalShortcut.isRegistered(accelerator)
}

export function getRegisteredShortcuts(): ShortcutConfig[] {
  return Array.from(registeredShortcuts.values())
}

export function updateShortcut(mainWindow: BrowserWindow, id: string, updates: Partial<ShortcutConfig>): boolean {
  const shortcut = registeredShortcuts.get(id)
  if (!shortcut) return false

  // Unregister old shortcut
  globalShortcut.unregister(shortcut.accelerator)

  // Update config
  const updatedShortcut = { ...shortcut, ...updates }

  // Re-register if enabled
  if (updatedShortcut.enabled) {
    const success = globalShortcut.register(updatedShortcut.accelerator, () => {
      handleShortcutAction(mainWindow, updatedShortcut.action)
    })

    if (success) {
      registeredShortcuts.set(id, updatedShortcut)
      return true
    }
  }

  registeredShortcuts.delete(id)
  return false
}
