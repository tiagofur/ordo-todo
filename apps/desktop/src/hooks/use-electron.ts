import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimerStore, startTimerInterval, stopTimerInterval } from '@/stores/timer-store'
import { useUIStore } from '@/stores/ui-store'

/**
 * Hook to handle Electron IPC events and global shortcuts
 * Should be used at the app root level
 */
export function useElectron() {
  const navigate = useNavigate()
  const timerStore = useTimerStore()
  const uiStore = useUIStore()

  // Handle tray actions
  const handleTrayAction = useCallback((action: string) => {
    switch (action) {
      case 'timer:toggle':
        if (timerStore.isRunning && !timerStore.isPaused) {
          timerStore.pause()
        } else if (timerStore.isPaused) {
          timerStore.resume()
        } else {
          timerStore.start()
          startTimerInterval()
        }
        break
      case 'timer:skip':
        timerStore.skip()
        break
      case 'timer:stop':
        timerStore.stop()
        stopTimerInterval()
        break
      case 'task:create':
        uiStore.openCreateTaskDialog()
        break
      case 'navigate:dashboard':
        navigate('/')
        break
      case 'navigate:settings':
        navigate('/settings')
        break
      case 'navigate:tasks-today':
        navigate('/tasks/today')
        break
      case 'navigate:focus':
        navigate('/focus')
        break
      default:
        console.log('Unknown tray action:', action)
    }
  }, [navigate, timerStore, uiStore])

  // Handle global shortcuts
  const handleGlobalShortcut = useCallback((action: string) => {
    switch (action) {
      case 'timer:toggle':
        if (timerStore.isRunning && !timerStore.isPaused) {
          timerStore.pause()
        } else if (timerStore.isPaused) {
          timerStore.resume()
        } else {
          timerStore.start()
          startTimerInterval()
        }
        break
      case 'timer:skip':
        timerStore.skip()
        break
      case 'task:create':
        uiStore.openCreateTaskDialog()
        break
      case 'navigate:dashboard':
        navigate('/')
        break
      case 'navigate:focus':
        navigate('/focus')
        break
      case 'navigate:tasks-today':
        navigate('/tasks/today')
        break
      case 'command:palette':
        // Command palette not implemented yet, show toast
        console.log('Command palette: Feature coming soon')
        // uiStore.openCommandPalette() // TODO: Implement command palette
        break
      case 'timer-window:toggle':
        // Toggle timer window via electronAPI
        window.electronAPI?.timerWindow.toggle?.()
        break
      default:
        console.log('Unknown shortcut action:', action)
    }
  }, [navigate, timerStore, uiStore])

  // Handle menu actions
  const handleMenuAction = useCallback((action: string, ...args: unknown[]) => {
    switch (action) {
      // Timer actions
      case 'timer:toggle':
        if (timerStore.isRunning && !timerStore.isPaused) {
          timerStore.pause()
        } else if (timerStore.isPaused) {
          timerStore.resume()
        } else {
          timerStore.start()
          startTimerInterval()
        }
        break
      case 'timer:skip':
        timerStore.skip()
        break
      case 'timer:stop':
        timerStore.stop()
        stopTimerInterval()
        break
      case 'timer:mode:work':
        timerStore.setMode('WORK')
        break
      case 'timer:mode:shortBreak':
        timerStore.setMode('SHORT_BREAK')
        break
      case 'timer:mode:longBreak':
        timerStore.setMode('LONG_BREAK')
        break

      // Create actions
      case 'task:create':
        uiStore.openCreateTaskDialog()
        break
      case 'project:create':
        uiStore.openCreateProjectDialog()
        break

      // Navigation
      case 'navigate:dashboard':
        navigate('/')
        break
      case 'navigate:tasks':
        navigate('/tasks')
        break
      case 'navigate:projects':
        navigate('/projects')
        break
      case 'navigate:timer':
        navigate('/timer')
        break
      case 'navigate:analytics':
        navigate('/analytics')
        break
      case 'navigate:workspaces':
        navigate('/workspaces')
        break
      case 'navigate:settings':
        navigate('/settings')
        break

      // Window
      case 'window:alwaysOnTop':
        // Already handled by main process
        break

      // Help
      case 'help:shortcuts':
        uiStore.openShortcutsDialog()
        break
      case 'help:about':
        uiStore.openAboutDialog()
        break

      default:
        console.log('Unknown menu action:', action, args)
    }
  }, [navigate, timerStore, uiStore])

  // Handle notification actions
  const handleNotificationAction = useCallback((action: string) => {
    switch (action) {
      case 'task:view-overdue':
        navigate('/tasks?filter=overdue')
        break
      default:
        console.log('Unknown notification action:', action)
    }
  }, [navigate])

  // Setup event listeners
  useEffect(() => {
    if (!window.electronAPI) {
      console.warn('Electron API not available')
      return
    }

    // Register event listeners
    window.electronAPI.onTrayAction(handleTrayAction)
    window.electronAPI.onGlobalShortcut(handleGlobalShortcut)
    window.electronAPI.onMenuAction(handleMenuAction)
    window.electronAPI.onNotificationAction(handleNotificationAction)

    // Cleanup
    return () => {
      window.electronAPI.removeAllListeners('tray-action')
      window.electronAPI.removeAllListeners('global-shortcut')
      window.electronAPI.removeAllListeners('menu-action')
      window.electronAPI.removeAllListeners('notification-action')
    }
  }, [handleTrayAction, handleGlobalShortcut, handleMenuAction, handleNotificationAction])

  // Start timer interval if timer was running
  useEffect(() => {
    if (timerStore.isRunning && !timerStore.isPaused) {
      startTimerInterval()
    }

    return () => {
      stopTimerInterval()
    }
  }, [])

  return {
    isElectron: !!window.electronAPI,
    platform: window.electronAPI?.platform ?? 'unknown',
  }
}

/**
 * Hook for window controls
 */
export function useWindowControls() {
  const minimize = useCallback(() => {
    window.electronAPI?.minimizeWindow()
  }, [])

  const maximize = useCallback(() => {
    window.electronAPI?.maximizeWindow()
  }, [])

  const close = useCallback(() => {
    window.electronAPI?.closeWindow()
  }, [])

  const setAlwaysOnTop = useCallback((flag: boolean) => {
    return window.electronAPI?.setAlwaysOnTop(flag)
  }, [])

  const isAlwaysOnTop = useCallback(() => {
    return window.electronAPI?.isAlwaysOnTop() ?? Promise.resolve(false)
  }, [])

  return {
    minimize,
    maximize,
    close,
    setAlwaysOnTop,
    isAlwaysOnTop,
    platform: window.electronAPI?.platform ?? 'unknown',
  }
}

/**
 * Hook for notifications
 */
export function useNotifications() {
  const showNotification = useCallback((title: string, body: string, options?: {
    silent?: boolean
    urgency?: 'normal' | 'critical' | 'low'
  }) => {
    return window.electronAPI?.showNotification({
      title,
      body,
      ...options,
    })
  }, [])

  const notifyPomodoroComplete = useCallback(() => {
    return window.electronAPI?.notifyPomodoroComplete()
  }, [])

  const notifyTaskDue = useCallback((taskTitle: string) => {
    return window.electronAPI?.notifyTaskDue(taskTitle)
  }, [])

  return {
    showNotification,
    notifyPomodoroComplete,
    notifyTaskDue,
  }
}

/**
 * Hook for persistent store
 */
export function useElectronStore() {
  const get = useCallback(async <T>(key: string): Promise<T | undefined> => {
    return window.electronAPI?.storeGet(key) as Promise<T | undefined>
  }, [])

  const set = useCallback(async (key: string, value: unknown): Promise<boolean> => {
    return window.electronAPI?.storeSet(key, value) ?? false
  }, [])

  const remove = useCallback(async (key: string): Promise<boolean> => {
    return window.electronAPI?.storeDelete(key) ?? false
  }, [])

  return { get, set, remove }
}
