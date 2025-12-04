import { useEffect } from 'react'
import { useElectron } from '@/hooks/use-electron'
import { useTimerStore, startTimerInterval, stopTimerInterval } from '@/stores/timer-store'

interface ElectronProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that initializes Electron-specific features
 * - Registers IPC event listeners (tray, shortcuts, menu)
 * - Manages timer interval
 * - Provides electron context to the app
 */
export function ElectronProvider({ children }: ElectronProviderProps) {
  const { isElectron, platform } = useElectron()
  const { isRunning, isPaused } = useTimerStore()

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
