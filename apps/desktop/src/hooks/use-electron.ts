import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTimerStore, startTimerInterval, stopTimerInterval } from '@/stores/timer-store'
import { useUIStore } from '@/stores/ui-store'
import { desktopBridge } from '@/lib/desktop-bridge'

/**
 * Hook to handle desktop shortcuts and inter-window actions.
 * Backwards compatible adapter replacing old Electron IPC.
 */
export function useElectron() {
  const navigate = useNavigate()
  const timerStore = useTimerStore()
  const uiStore = useUIStore()

  // Handle timer actions coming from floating timer window or tray
  const handleTimerAction = useCallback((action: { type: string }) => {
    switch (action.type) {
      case 'toggle':
        if (timerStore.isRunning && !timerStore.isPaused) {
          timerStore.pause()
        } else if (timerStore.isPaused) {
          timerStore.resume()
        } else {
          timerStore.start()
          startTimerInterval()
        }
        break
      case 'start':
        timerStore.start()
        startTimerInterval()
        break
      case 'pause':
        timerStore.pause()
        break
      case 'resume':
        timerStore.resume()
        break
      case 'skip':
        timerStore.skip()
        break
      case 'stop':
        timerStore.stop()
        stopTimerInterval()
        break
      default:
        break
    }
  }, [timerStore])

  // Setup desktop listeners and global shortcuts
  useEffect(() => {
    // Listen for timer actions
    const unsubscribe = desktopBridge.onTimerAction(handleTimerAction)

    // Register global shortcuts if in native shell
    if (desktopBridge.isNative()) {
      // Toggle Mini Timer: CommandOrControl+Shift+T
      desktopBridge.registerShortcut('CommandOrControl+Shift+T', () => {
        desktopBridge.toggleMiniTimer()
      })
      // Quick Create Task: CommandOrControl+Shift+N
      desktopBridge.registerShortcut('CommandOrControl+Shift+N', () => {
        uiStore.openCreateTaskDialog()
      })
    }

    return () => {
      unsubscribe()
      if (desktopBridge.isNative()) {
        desktopBridge.unregisterShortcut('CommandOrControl+Shift+T')
        desktopBridge.unregisterShortcut('CommandOrControl+Shift+N')
      }
    }
  }, [handleTimerAction, uiStore])

  // Start timer interval if running
  useEffect(() => {
    if (timerStore.isRunning && !timerStore.isPaused) {
      startTimerInterval()
    }
    return () => {
      stopTimerInterval()
    }
  }, [timerStore.isRunning, timerStore.isPaused])

  return {
    isElectron: desktopBridge.isNative(),
    isNative: desktopBridge.isNative(),
    platform: desktopBridge.getPlatform(),
  }
}

/**
 * Hook for window controls
 */
export function useWindowControls() {
  const minimize = useCallback(() => {
    desktopBridge.minimize()
  }, [])

  const maximize = useCallback(() => {
    desktopBridge.toggleMaximize()
  }, [])

  const close = useCallback(() => {
    desktopBridge.close()
  }, [])

  const setAlwaysOnTop = useCallback(async (_flag: boolean) => {
    // Handled in floating timer window configuration
  }, [])

  const isAlwaysOnTop = useCallback(async () => {
    return false
  }, [])

  const isMaximized = useCallback(async () => {
    return desktopBridge.isMaximized()
  }, [])

  return {
    minimize,
    maximize,
    close,
    setAlwaysOnTop,
    isAlwaysOnTop,
    isMaximized,
  }
}

export const useDesktop = useElectron
