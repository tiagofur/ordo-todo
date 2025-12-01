import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),

    // Platform info
    platform: process.platform,

    // Version info
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },

    // Desktop feature event listeners
    onTrayAction: (callback: (action: string) => void) => {
        ipcRenderer.on('tray-action', (_event, action) => callback(action))
    },
    onGlobalShortcut: (callback: (action: string) => void) => {
        ipcRenderer.on('global-shortcut', (_event, action) => callback(action))
    },
    onMenuAction: (callback: (action: string) => void) => {
        ipcRenderer.on('menu-action', (_event, action) => callback(action))
    },
    onMainProcessMessage: (callback: (message: string) => void) => {
        ipcRenderer.on('main-process-message', (_event, message) => callback(message))
    },

    // Remove listeners
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel)
    },
})

// Declare types for TypeScript
declare global {
    interface Window {
        electronAPI: {
            minimizeWindow: () => Promise<void>
            maximizeWindow: () => Promise<void>
            closeWindow: () => Promise<void>
            isMaximized: () => Promise<boolean>
            platform: string
            versions: {
                node: string
                chrome: string
                electron: string
            }
            onTrayAction: (callback: (action: string) => void) => void
            onGlobalShortcut: (callback: (action: string) => void) => void
            onMenuAction: (callback: (action: string) => void) => void
            onMainProcessMessage: (callback: (message: string) => void) => void
            removeAllListeners: (channel: string) => void
        }
    }
}