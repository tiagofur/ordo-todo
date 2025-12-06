import { TimerFloatingWindow } from '@/components/timer/TimerFloatingWindow'

/**
 * TimerFloating Page
 * 
 * This page is rendered in the floating timer window.
 * It's a frameless, always-on-top window that shows the current timer status.
 */
export function TimerFloating() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent">
      <TimerFloatingWindow />
    </div>
  )
}

export default TimerFloating
