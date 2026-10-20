import { useEffect, useCallback } from 'react'
import { desktopBridge } from '@/lib/desktop-bridge'

/**
 * Hook to handle desktop shortcuts and inter-window actions.
 * Backwards compatible adapter replacing old Electron IPC.
 *
 * Note (ODD 014 T3): timer actions from the tray / floating mini-timer are
 * handled by the bridge inside TimerProvider (timer-context), which owns the
 * unified timer. This hook only wires global shortcuts and quick-add.
 */
export function useElectron() {
  // Setup desktop listeners and global shortcuts
  useEffect(() => {
    // Tray "Quick Add Task..." → focus main window + open Quick-Add.
    const unsubscribeTray = desktopBridge.onQuickAddTask(() => {
      window.dispatchEvent(new CustomEvent('openQuickAdd'))
    })

    // Register global shortcuts if in native shell
    if (desktopBridge.isNative()) {
      // Toggle Mini Timer: CommandOrControl+Shift+T
      desktopBridge.registerShortcut('CommandOrControl+Shift+T', () => {
        desktopBridge.toggleMiniTimer()
      })
      // Quick Create Task: CommandOrControl+Shift+N
      desktopBridge.registerShortcut('CommandOrControl+Shift+N', () => {
        desktopBridge.focusMainWindow().then(() => {
          window.dispatchEvent(new CustomEvent('openQuickAdd'))
        })
      })
    }

    return () => {
      unsubscribeTray()
      if (desktopBridge.isNative()) {
        desktopBridge.unregisterShortcut('CommandOrControl+Shift+T')
        desktopBridge.unregisterShortcut('CommandOrControl+Shift+N')
      }
    }
  }, [])

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
