import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { createTray, destroyTray, updateTrayMenu } from './tray'
import { registerGlobalShortcuts, unregisterAllShortcuts } from './shortcuts'
import { createApplicationMenu } from './menu'
import { setupIpcHandlers, cleanupIpcHandlers, getStore } from './ipc-handlers'
import { getWindowState, trackWindowState } from './window-state'

// Extend App interface for isQuitting flag
interface ExtendedApp extends Electron.App {
  isQuitting?: boolean
}

const extApp = app as ExtendedApp

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
//
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null = null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite#6931
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function getIconPath(): string {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'build', 'icon.png')
    }
    return path.join(process.env.VITE_PUBLIC!, 'icon.png')
}

function createWindow() {
    const windowState = getWindowState()

    win = new BrowserWindow({
        icon: getIconPath(),
        width: windowState.width,
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    // Track window state changes
    trackWindowState(win)

    // Apply saved window state (maximize, etc.)
    if (windowState.isMaximized) {
        win.maximize()
    }

    // Setup IPC handlers
    setupIpcHandlers(win)

    // Create application menu
    createApplicationMenu(win)

    // Create system tray
    createTray(win)

    // Register global shortcuts
    registerGlobalShortcuts(win)

    // Handle window close (minimize to tray if enabled)
    win.on('close', (event) => {
        const store = getStore()
        const minimizeToTray = store.get('settings.minimizeToTray', true)
        
        if (minimizeToTray && !extApp.isQuitting) {
            event.preventDefault()
            win?.hide()
        }
    })

    // Test active push message to Renderer-process
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
        
        // Send initial tray state
        updateTrayMenu(win!, {
            timerActive: false,
            isPaused: false,
            timeRemaining: '25:00',
            currentTask: null,
            mode: 'IDLE',
        })
    })

    if (VITE_DEV_SERVER_URL) {
        console.log('Loading URL:', VITE_DEV_SERVER_URL)
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        const filePath = path.join(process.env.DIST!, 'index.html')
        console.log('Loading file:', filePath)
        win.loadFile(filePath)
    }

    // Show window when ready to prevent visual flash
    win.once('ready-to-show', () => {
        const store = getStore()
        const startMinimized = store.get('settings.startMinimized', false)
        
        if (!startMinimized) {
            win?.show()
        }
    })

    // Open DevTools in development
    if (!app.isPackaged) {
        win.webContents.openDevTools()
    }
}

// Handle app quit properly
app.on('before-quit', () => {
    extApp.isQuitting = true
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(createWindow)

// Cleanup on quit
app.on('will-quit', () => {
    unregisterAllShortcuts()
    destroyTray()
    cleanupIpcHandlers()
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    } else {
        // Show the window if hidden
        win?.show()
    }
})