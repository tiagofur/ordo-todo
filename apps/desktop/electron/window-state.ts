import Store from 'electron-store'
import { BrowserWindow, screen } from 'electron'

export interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

const store = new Store<{ windowState: WindowState }>({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: false,
    },
  },
})

export function getWindowState(): WindowState {
  const state = store.get('windowState')
  
  // Validate that the window is still on a visible display
  if (state.x !== undefined && state.y !== undefined) {
    const displays = screen.getAllDisplays()
    const isOnDisplay = displays.some((display) => {
      const bounds = display.bounds
      return (
        state.x! >= bounds.x &&
        state.x! < bounds.x + bounds.width &&
        state.y! >= bounds.y &&
        state.y! < bounds.y + bounds.height
      )
    })

    if (!isOnDisplay) {
      // Reset position if window is off-screen
      return {
        width: state.width,
        height: state.height,
        isMaximized: state.isMaximized,
      }
    }
  }

  return state
}

export function saveWindowState(win: BrowserWindow): void {
  if (!win) return

  const isMaximized = win.isMaximized()

  // Don't save position/size if maximized
  if (!isMaximized) {
    const bounds = win.getBounds()
    store.set('windowState', {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: false,
    })
  } else {
    // Keep previous position/size but update maximized state
    const currentState = store.get('windowState')
    store.set('windowState', {
      ...currentState,
      isMaximized: true,
    })
  }
}

export function trackWindowState(win: BrowserWindow): void {
  // Save state on resize (debounced)
  let resizeTimeout: NodeJS.Timeout | null = null
  
  win.on('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      saveWindowState(win)
    }, 500)
  })

  // Save state on move (debounced)
  let moveTimeout: NodeJS.Timeout | null = null
  
  win.on('move', () => {
    if (moveTimeout) clearTimeout(moveTimeout)
    moveTimeout = setTimeout(() => {
      saveWindowState(win)
    }, 500)
  })

  // Save maximized state immediately
  win.on('maximize', () => {
    saveWindowState(win)
  })

  win.on('unmaximize', () => {
    saveWindowState(win)
  })

  // Save state before close
  win.on('close', () => {
    saveWindowState(win)
  })
}

export function applyWindowState(win: BrowserWindow): void {
  const state = getWindowState()

  // Apply saved bounds
  if (state.x !== undefined && state.y !== undefined) {
    win.setBounds({
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
    })
  } else {
    // Center window if no position saved
    win.setSize(state.width, state.height)
    win.center()
  }

  // Apply maximized state
  if (state.isMaximized) {
    win.maximize()
  }
}
