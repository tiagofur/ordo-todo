import { useEffect, useState, useCallback, useMemo } from 'react'

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
  /** Current update state */
  state: UpdateState
  /** Current app version */
  currentVersion: string
  /** Check for updates manually */
  checkForUpdates: (silent?: boolean) => Promise<void>
  /** Start downloading the available update */
  downloadUpdate: () => Promise<void>
  /** Install downloaded update and restart */
  installUpdate: () => void
  /** Formatted download progress percentage */
  progressPercent: string
  /** Formatted download speed */
  downloadSpeed: string
  /** Whether an update is available */
  hasUpdate: boolean
  /** Whether update is ready to install */
  isReadyToInstall: boolean
  /** Whether currently checking/downloading */
  isLoading: boolean
}

const defaultState: UpdateState = {
  status: 'idle',
}

/**
 * Hook to manage auto-updates in the Electron app
 *
 * @example
 * ```tsx
 * function UpdateSettings() {
 *   const {
 *     state,
 *     currentVersion,
 *     checkForUpdates,
 *     downloadUpdate,
 *     installUpdate,
 *     hasUpdate,
 *     isReadyToInstall,
 *     progressPercent
 *   } = useAutoUpdater()
 *
 *   return (
 *     <div>
 *       <p>Current version: {currentVersion}</p>
 *       <button onClick={() => checkForUpdates()}>Check for Updates</button>
 *       {hasUpdate && <button onClick={downloadUpdate}>Download</button>}
 *       {isReadyToInstall && <button onClick={installUpdate}>Install & Restart</button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAutoUpdater(): UseAutoUpdaterReturn {
  const [state, setState] = useState<UpdateState>(defaultState)
  const [currentVersion, setCurrentVersion] = useState<string>('')

  // Load initial state and version
  useEffect(() => {
    if (!window.electronAPI?.autoUpdater) {
      console.warn('Auto-updater API not available')
      return
    }

    // Get initial state
    window.electronAPI.autoUpdater.getState().then(setState)

    // Get current version
    window.electronAPI.autoUpdater.getVersion().then(setCurrentVersion)

    // Subscribe to state changes
    window.electronAPI.autoUpdater.onStateChange((newState) => {
      setState(newState)
    })

    return () => {
      window.electronAPI?.removeAllListeners('auto-update:state')
    }
  }, [])

  const checkForUpdates = useCallback(async (silent: boolean = false) => {
    if (!window.electronAPI?.autoUpdater) return

    try {
      const newState = await window.electronAPI.autoUpdater.check(silent)
      setState(newState)
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }, [])

  const downloadUpdate = useCallback(async () => {
    if (!window.electronAPI?.autoUpdater) return

    try {
      const newState = await window.electronAPI.autoUpdater.download()
      setState(newState)
    } catch (error) {
      console.error('Failed to download update:', error)
    }
  }, [])

  const installUpdate = useCallback(() => {
    if (!window.electronAPI?.autoUpdater) return
    window.electronAPI.autoUpdater.install()
  }, [])

  // Computed values
  const progressPercent = useMemo(() => {
    if (state.progress === undefined) return '0%'
    return `${state.progress.toFixed(1)}%`
  }, [state.progress])

  const downloadSpeed = useMemo(() => {
    if (!state.bytesPerSecond) return ''

    const speed = state.bytesPerSecond
    if (speed < 1024) return `${speed.toFixed(0)} B/s`
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`
    return `${(speed / (1024 * 1024)).toFixed(2)} MB/s`
  }, [state.bytesPerSecond])

  const hasUpdate = state.status === 'available' || state.status === 'downloading' || state.status === 'downloaded'

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

export default useAutoUpdater
