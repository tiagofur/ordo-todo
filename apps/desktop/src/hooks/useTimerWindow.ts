import { useEffect, useState, useCallback } from 'react'

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
 * Hook to control the floating timer window
 *
 * @example
 * ```tsx
 * function TimerControls() {
 *   const { isVisible, toggle, show, hide } = useTimerWindow()
 *
 *   return (
 *     <Button onClick={toggle}>
 *       {isVisible ? 'Hide Timer' : 'Show Timer'}
 *     </Button>
 *   )
 * }
 * ```
 */
export function useTimerWindow(): UseTimerWindowReturn {
  const [isVisible, setIsVisible] = useState(false)

  // Load initial visibility state
  useEffect(() => {
    if (!window.electronAPI?.timerWindow) {
      console.warn('Timer window API not available')
      return
    }

    window.electronAPI.timerWindow.isVisible().then(setIsVisible)
  }, [])

  const show = useCallback(async () => {
    if (!window.electronAPI?.timerWindow) return
    await window.electronAPI.timerWindow.show()
    setIsVisible(true)
  }, [])

  const hide = useCallback(async () => {
    if (!window.electronAPI?.timerWindow) return
    await window.electronAPI.timerWindow.hide()
    setIsVisible(false)
  }, [])

  const toggle = useCallback(async () => {
    if (!window.electronAPI?.timerWindow) return
    const newVisible = await window.electronAPI.timerWindow.toggle()
    setIsVisible(newVisible)
  }, [])

  const expand = useCallback(async () => {
    if (!window.electronAPI?.timerWindow) return
    await window.electronAPI.timerWindow.expand()
    setIsVisible(false)
  }, [])

  const setPosition = useCallback(async (x: number, y: number) => {
    if (!window.electronAPI?.timerWindow) return
    await window.electronAPI.timerWindow.setPosition(x, y)
  }, [])

  const getPosition = useCallback(async () => {
    if (!window.electronAPI?.timerWindow) return null
    return window.electronAPI.timerWindow.getPosition()
  }, [])

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
