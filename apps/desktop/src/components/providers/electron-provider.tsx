import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useElectron } from '@/hooks/use-electron'
import {
  useTimerStore,
  startTimerInterval,
  stopTimerInterval,
  initializeDesktopTimerCallbacks,
} from '@/stores/timer-store'

interface ElectronProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that initializes Electron-specific features
 * - Registers IPC event listeners (tray, shortcuts, menu, timer window, deep links)
 * - Manages timer interval
 * - Provides electron context to the app
 */
export function ElectronProvider({ children }: ElectronProviderProps) {
  const { isElectron, platform } = useElectron()
  const timerStore = useTimerStore()
  const { isRunning, isPaused, start, pause, resume, skip } = timerStore

  // Manage timer interval based on running state
  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimerInterval()
    } else {
      stopTimerInterval()
    }

    return () => {
      stopTimerInterval()
    }
  }, [isRunning, isPaused])

  // Listen for timer window actions
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.timerWindow) return

    window.electronAPI.timerWindow.onAction((action: string) => {
      console.log('[ElectronProvider] Timer window action:', action)
      
      switch (action) {
        case 'timer:start':
          start()
          break
        case 'timer:pause':
          pause()
          break
        case 'timer:resume':
          resume()
          break
        case 'timer:skip':
          skip()
          break
        default:
          console.warn('[ElectronProvider] Unknown timer action:', action)
      }
    })

    return () => {
      window.electronAPI?.removeAllListeners('timer-window:action')
    }
  }, [isElectron, start, pause, resume, skip])

  // Listen for deep links
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.deepLinks) return

    window.electronAPI.deepLinks.onDeepLink((data) => {
      console.log('[ElectronProvider] Deep link received:', data)
      
      // Handle navigation based on deep link type
      switch (data.type) {
        case 'task':
          if (data.id) {
            // Navigate to task (could open a modal or go to tasks page)
            window.location.hash = `/tasks?taskId=${data.id}`
          }
          break
        case 'project':
          if (data.id) {
            window.location.hash = `/projects/${data.id}`
          }
          break
        case 'timer':
          if (data.action === 'start') {
            start()
          }
          window.location.hash = '/timer'
          break
        case 'settings':
          window.location.hash = `/settings${data.id ? `?tab=${data.id}` : ''}`
          break
        case 'workspace':
          // Handle workspace switch
          window.location.hash = '/dashboard'
          break
        default:
          console.warn('[ElectronProvider] Unknown deep link type:', data.type)
      }
    })

    return () => {
      window.electronAPI?.removeAllListeners('deep-link')
    }
  }, [isElectron, start])

  // Initialize Electron-specific timer callbacks (tray updates, notifications)
  useEffect(() => {
    if (isElectron) {
      initializeDesktopTimerCallbacks()
    }
  }, [isElectron])

  // Log platform info in development
  useEffect(() => {
    if (isElectron) {
      console.log(`Running on Electron (${platform})`)
    } else {
      console.log('Running in browser mode')
    }
  }, [isElectron, platform])

  return <>{children}</>
}
