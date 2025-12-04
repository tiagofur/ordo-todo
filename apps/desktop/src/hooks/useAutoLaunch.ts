import { useEffect, useState, useCallback } from 'react'

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
 * Hook to manage auto-launch settings for the Electron app
 *
 * @example
 * ```tsx
 * function StartupSettings() {
 *   const {
 *     isEnabled,
 *     settings,
 *     toggle,
 *     setStartMinimized,
 *   } = useAutoLaunch()
 *
 *   return (
 *     <div>
 *       <Switch
 *         checked={isEnabled}
 *         onCheckedChange={() => toggle()}
 *       />
 *       <Switch
 *         checked={settings.minimized}
 *         onCheckedChange={(checked) => setStartMinimized(checked)}
 *         disabled={!isEnabled}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function useAutoLaunch(): UseAutoLaunchReturn {
  const [settings, setSettings] = useState<AutoLaunchSettings>(defaultSettings)
  const [wasStartedAtLogin, setWasStartedAtLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial state
  useEffect(() => {
    if (!window.electronAPI?.autoLaunch) {
      console.warn('Auto-launch API not available')
      setIsLoading(false)
      return
    }

    const loadSettings = async () => {
      try {
        const [fetchedSettings, startedAtLogin] = await Promise.all([
          window.electronAPI.autoLaunch.getSettings(),
          window.electronAPI.autoLaunch.wasStartedAtLogin(),
        ])

        setSettings(fetchedSettings)
        setWasStartedAtLogin(startedAtLogin)
      } catch (error) {
        console.error('Failed to load auto-launch settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const enable = useCallback(async (minimized: boolean = true): Promise<boolean> => {
    if (!window.electronAPI?.autoLaunch) return false

    try {
      const success = await window.electronAPI.autoLaunch.enable(minimized)
      if (success) {
        setSettings({ enabled: true, minimized })
      }
      return success
    } catch (error) {
      console.error('Failed to enable auto-launch:', error)
      return false
    }
  }, [])

  const disable = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI?.autoLaunch) return false

    try {
      const success = await window.electronAPI.autoLaunch.disable()
      if (success) {
        setSettings((prev) => ({ ...prev, enabled: false }))
      }
      return success
    } catch (error) {
      console.error('Failed to disable auto-launch:', error)
      return false
    }
  }, [])

  const toggle = useCallback(async (): Promise<boolean> => {
    if (!window.electronAPI?.autoLaunch) return false

    try {
      const newEnabled = await window.electronAPI.autoLaunch.toggle()
      setSettings((prev) => ({ ...prev, enabled: newEnabled }))
      return newEnabled
    } catch (error) {
      console.error('Failed to toggle auto-launch:', error)
      return false
    }
  }, [])

  const setStartMinimized = useCallback(async (minimized: boolean): Promise<boolean> => {
    if (!window.electronAPI?.autoLaunch) return false

    try {
      const success = await window.electronAPI.autoLaunch.setStartMinimized(minimized)
      if (success) {
        setSettings((prev) => ({ ...prev, minimized }))
      }
      return success
    } catch (error) {
      console.error('Failed to set start minimized:', error)
      return false
    }
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
