import { useEffect, useState, useCallback } from 'react'
import { desktopBridge } from '@/lib/desktop-bridge'

export interface AutoLaunchSettings {
  enabled: boolean
  minimized: boolean
}

export interface UseAutoLaunchReturn {
  /** Whether auto-launch is enabled */
  isEnabled: boolean
  /** Full settings object */
  settings: AutoLaunchSettings
  /** Whether the app was started at system login */
  wasStartedAtLogin: boolean
  /** Enable auto-launch */
  enable: (minimized?: boolean) => Promise<boolean>
  /** Disable auto-launch */
  disable: () => Promise<boolean>
  /** Toggle auto-launch */
  toggle: () => Promise<boolean>
  /** Set whether to start minimized */
  setStartMinimized: (minimized: boolean) => Promise<boolean>
  /** Loading state */
  isLoading: boolean
}

const defaultSettings: AutoLaunchSettings = {
  enabled: false,
  minimized: true,
}

/**
 * Hook to manage auto-launch settings for the Desktop app
 */
export function useAutoLaunch(): UseAutoLaunchReturn {
  const [settings, setSettings] = useState<AutoLaunchSettings>(defaultSettings)
  const [wasStartedAtLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial state from native shell
  useEffect(() => {
    let mounted = true
    desktopBridge.isAutostartEnabled().then((enabled) => {
      if (mounted) {
        setSettings({ enabled, minimized: true })
        setIsLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const enable = useCallback(async (minimized: boolean = true): Promise<boolean> => {
    const success = await desktopBridge.setAutostart(true)
    if (success) {
      setSettings({ enabled: true, minimized })
    }
    return success
  }, [])

  const disable = useCallback(async (): Promise<boolean> => {
    const success = await desktopBridge.setAutostart(false)
    if (success) {
      setSettings((prev) => ({ ...prev, enabled: false }))
    }
    return success
  }, [])

  const toggle = useCallback(async (): Promise<boolean> => {
    const nextState = !settings.enabled
    const success = await desktopBridge.setAutostart(nextState)
    if (success) {
      setSettings((prev) => ({ ...prev, enabled: nextState }))
      return nextState
    }
    return settings.enabled
  }, [settings.enabled])

  const setStartMinimized = useCallback(async (minimized: boolean): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, minimized }))
    return true
  }, [])

  return {
    isEnabled: settings.enabled,
    settings,
    wasStartedAtLogin,
    enable,
    disable,
    toggle,
    setStartMinimized,
    isLoading,
  }
}

export default useAutoLaunch
