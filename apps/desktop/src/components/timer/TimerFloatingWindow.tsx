import { useEffect, useState, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  Maximize2,
  GripHorizontal,
  Coffee,
  Zap,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'

interface TimerWindowState {
  timeRemaining: string
  mode: TimerMode
  isRunning: boolean
  isPaused: boolean
  taskTitle: string | null
  progress: number
}

const defaultState: TimerWindowState = {
  timeRemaining: '25:00',
  mode: 'IDLE',
  isRunning: false,
  isPaused: false,
  taskTitle: null,
  progress: 0,
}

/**
 * TimerFloatingWindow - Floating timer widget displayed in always-on-top window
 * 
 * This component is designed to be rendered in a small, frameless window
 * that floats above other applications.
 */
export function TimerFloatingWindow() {
  const [state, setState] = useState<TimerWindowState>(defaultState)
  const [isDragging, setIsDragging] = useState(false)

  // Listen for state updates from main process
  useEffect(() => {
    if (!window.electronAPI?.timerWindow) return

    window.electronAPI.timerWindow.onStateUpdate((newState) => {
      setState((prev) => ({ ...prev, ...newState }))
    })

    return () => {
      window.electronAPI?.removeAllListeners('timer-window:state-update')
    }
  }, [])

  const handleToggleTimer = useCallback(() => {
    if (state.isRunning && !state.isPaused) {
      window.electronAPI?.timerWindow.sendAction('timer:pause')
    } else if (state.isPaused) {
      window.electronAPI?.timerWindow.sendAction('timer:resume')
    } else {
      window.electronAPI?.timerWindow.sendAction('timer:start')
    }
  }, [state.isRunning, state.isPaused])

  const handleSkip = useCallback(() => {
    window.electronAPI?.timerWindow.sendAction('timer:skip')
  }, [])

  const handleExpand = useCallback(() => {
    window.electronAPI?.timerWindow.expand()
  }, [])

  const getModeStyles = (mode: TimerMode) => {
    switch (mode) {
      case 'WORK':
        return {
          bg: 'bg-gradient-to-br from-red-500/90 to-orange-600/90',
          text: 'text-white',
          icon: <Zap className="h-3 w-3" />,
          label: 'Trabajo',
        }
      case 'SHORT_BREAK':
        return {
          bg: 'bg-gradient-to-br from-blue-500/90 to-cyan-600/90',
          text: 'text-white',
          icon: <Coffee className="h-3 w-3" />,
          label: 'Descanso',
        }
      case 'LONG_BREAK':
        return {
          bg: 'bg-gradient-to-br from-green-500/90 to-emerald-600/90',
          text: 'text-white',
          icon: <Leaf className="h-3 w-3" />,
          label: 'Descanso Largo',
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-700/90 to-gray-800/90',
          text: 'text-white',
          icon: null,
          label: 'Inactivo',
        }
    }
  }

  const modeStyles = getModeStyles(state.mode)

  return (
    <div
      className={cn(
        'w-full h-full rounded-xl shadow-2xl overflow-hidden',
        'backdrop-blur-xl border border-white/20',
        modeStyles.bg
      )}
    >
      {/* Drag handle */}
      <div
        className="absolute top-1 left-1/2 -translate-x-1/2 cursor-move opacity-50 hover:opacity-100 transition-opacity"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <GripHorizontal className="h-4 w-4 text-white/60" />
      </div>

      <div className="flex items-center justify-between h-full px-3 py-2">
        {/* Left: Mode & Task */}
        <div className="flex flex-col min-w-0 flex-1 mr-2">
          <div className="flex items-center gap-1.5">
            {modeStyles.icon}
            <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
              {modeStyles.label}
            </span>
          </div>
          {state.taskTitle && (
            <span className="text-xs text-white/60 truncate mt-0.5">
              {state.taskTitle}
            </span>
          )}
        </div>

        {/* Center: Timer */}
        <div className="flex-shrink-0 mx-2">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-white">
            {state.timeRemaining}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleTimer}
            className={cn(
              'p-1.5 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            title={state.isRunning && !state.isPaused ? 'Pausar' : 'Iniciar'}
          >
            {state.isRunning && !state.isPaused ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </button>

          <button
            onClick={handleSkip}
            className={cn(
              'p-1.5 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              !state.isRunning && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!state.isRunning}
            title="Saltar"
          >
            <SkipForward className="h-4 w-4 text-white" />
          </button>

          <button
            onClick={handleExpand}
            className={cn(
              'p-1.5 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            title="Expandir"
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-white/40 transition-all duration-1000 ease-linear"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  )
}

export default TimerFloatingWindow
