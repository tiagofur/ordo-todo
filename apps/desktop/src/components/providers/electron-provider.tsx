import { useEffect } from 'react'
import { useElectron } from '@/hooks/use-electron'
import { useTrayTasks } from '@/hooks/use-tray-tasks'
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
 * Provider component that initializes Desktop-specific features
 * - Initializes tray timer synchronization & notifications
 * - Manages timer interval
 * - Tracks pending tasks for app dock/badge count
 */
export function ElectronProvider({ children }: ElectronProviderProps) {
  useElectron()
  const timerStore = useTimerStore()
  const { isRunning, isPaused } = timerStore

  // Initialize native tray timer updates and notification callbacks
  useEffect(() => {
    initializeDesktopTimerCallbacks()
  }, [])

  // Update tray and dock badge count with pending tasks
  useTrayTasks()

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

  return <>{children}</>
}

export const DesktopProvider = ElectronProvider
