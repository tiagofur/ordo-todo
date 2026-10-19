import { useEffect, useState, useCallback, useMemo } from 'react'
import { desktopBridge } from '@/lib/desktop-bridge'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateState {
  status: UpdateStatus
  version?: string
  releaseNotes?: string
  progress?: number
  bytesPerSecond?: number
  downloadedBytes?: number
  totalBytes?: number
  error?: string
}

export interface UseAutoUpdaterReturn {
  state: UpdateState
  currentVersion: string
  checkForUpdates: (silent?: boolean) => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => void
  progressPercent: string
  downloadSpeed: string
  hasUpdate: boolean
  isReadyToInstall: boolean
  isLoading: boolean
}

const defaultState: UpdateState = {
  status: 'idle',
}

/**
 * Hook to manage app updates in Desktop
 */
export function useAutoUpdater(): UseAutoUpdaterReturn {
  const [state, setState] = useState<UpdateState>(defaultState)
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0')

  useEffect(() => {
    desktopBridge.getSystemInfo().then((info) => {
      if (info.version) {
        setCurrentVersion(info.version)
      }
    })
  }, [])

  const checkForUpdates = useCallback(async (_silent = false) => {
    setState({ status: 'checking' })
    setTimeout(() => {
      setState({ status: 'not-available' })
    }, 800)
  }, [])

  const downloadUpdate = useCallback(async () => {}, [])
  const installUpdate = useCallback(() => {}, [])

  const progressPercent = useMemo(() => {
    return `${Math.round(state.progress || 0)}%`
  }, [state.progress])

  const downloadSpeed = useMemo(() => {
    return '0 KB/s'
  }, [])

  const hasUpdate = state.status === 'available'
  const isReadyToInstall = state.status === 'downloaded'
  const isLoading = state.status === 'checking' || state.status === 'downloading'

  return {
    state,
    currentVersion,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    progressPercent,
    downloadSpeed,
    hasUpdate,
    isReadyToInstall,
    isLoading,
  }
}
