import { useState, useCallback } from 'react'
import { desktopBridge } from '@/lib/desktop-bridge'

export interface UseTimerWindowReturn {
  /** Whether the timer window is currently visible */
  isVisible: boolean
  /** Show the timer floating window */
  show: () => Promise<void>
  /** Hide the timer floating window */
  hide: () => Promise<void>
  /** Toggle the timer floating window visibility */
  toggle: () => Promise<void>
  /** Expand to main window (shows main window and hides timer window) */
  expand: () => Promise<void>
  /** Set the position of the timer window */
  setPosition: (x: number, y: number) => Promise<void>
  /** Get the current position of the timer window */
  getPosition: () => Promise<{ x: number; y: number } | null>
}

/**
 * Hook to control the floating timer window in Desktop app
 */
export function useTimerWindow(): UseTimerWindowReturn {
  const [isVisible, setIsVisible] = useState(false)

  const show = useCallback(async () => {
    await desktopBridge.setMiniTimerVisible(true)
    setIsVisible(true)
  }, [])

  const hide = useCallback(async () => {
    await desktopBridge.setMiniTimerVisible(false)
    setIsVisible(false)
  }, [])

  const toggle = useCallback(async () => {
    const next = await desktopBridge.toggleMiniTimer()
    setIsVisible(next)
  }, [])

  const expand = useCallback(async () => {
    await desktopBridge.setMiniTimerVisible(false)
    setIsVisible(false)
  }, [])

  const setPosition = useCallback(async (_x: number, _y: number) => {}, [])
  const getPosition = useCallback(async () => null, [])

  return {
    isVisible,
    show,
    hide,
    toggle,
    expand,
    setPosition,
    getPosition,
  }
}

export default useTimerWindow
