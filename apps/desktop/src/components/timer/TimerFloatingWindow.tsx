import { useEffect, useState, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  Maximize2,
  Minimize2,
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
 * Enhanced version with:
 * - Mini-mode toggle for ultra-compact display
 * - Circular progress indicator
 * - Smooth animations
 * - Dynamic colors based on timer state
 */
export function TimerFloatingWindow() {
  const [state, setState] = useState<TimerWindowState>(defaultState)
  const [isDragging, setIsDragging] = useState(false)
  const [isMiniMode, setIsMiniMode] = useState(false)

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

  const handleToggleMiniMode = useCallback(() => {
    setIsMiniMode((prev) => !prev)
  }, [])

  const getModeStyles = (mode: TimerMode) => {
    switch (mode) {
      case 'WORK':
        return {
          bg: 'bg-red-600',
          bgLight: 'bg-red-500',
          text: 'text-white',
          icon: <Zap className="h-3 w-3" />,
          label: 'Trabajo',
        }
      case 'SHORT_BREAK':
        return {
          bg: 'bg-blue-600',
          bgLight: 'bg-blue-500',
          text: 'text-white',
          icon: <Coffee className="h-3 w-3" />,
          label: 'Descanso',
        }
      case 'LONG_BREAK':
        return {
          bg: 'bg-green-600',
          bgLight: 'bg-green-500',
          text: 'text-white',
          icon: <Leaf className="h-3 w-3" />,
          label: 'Descanso Largo',
        }
      default:
        return {
          bg: 'bg-gray-700',
          bgLight: 'bg-gray-600',
          text: 'text-white',
          icon: null,
          label: 'Inactivo',
        }
    }
  }

  const modeStyles = getModeStyles(state.mode)

  // Calculate circular progress
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (state.progress / 100) * circumference

  if (isMiniMode) {
    // Ultra-compact mini mode
    return (
      <div
        className={cn(
          'w-full h-full rounded-full shadow-2xl overflow-hidden',
          'backdrop-blur-xl border-2 border-white/30',
          modeStyles.bg,
          'transition-all duration-300'
        )}
      >
        <div className="flex items-center justify-center h-full px-2 py-1">
          <button
            onClick={handleToggleTimer}
            className={cn(
              'flex items-center gap-1.5 transition-all',
              'focus:outline-none'
            )}
          >
            {state.isRunning && !state.isPaused ? (
              <Pause className="h-3 w-3 text-white" />
            ) : (
              <Play className="h-3 w-3 text-white" />
            )}
            <span className="text-sm font-bold tabular-nums text-white">
              {state.timeRemaining}
            </span>
          </button>
        </div>

        {/* Mini mode toggle */}
        <button
          onClick={handleToggleMiniMode}
          className="absolute bottom-0 right-0 p-0.5 opacity-50 hover:opacity-100 transition-opacity"
          title="Expandir"
        >
          <Maximize2 className="h-2.5 w-2.5 text-white" />
        </button>
      </div>
    )
  }

  // Full mode with circular progress
  return (
    <div
      className={cn(
        'w-full h-full rounded-2xl shadow-2xl overflow-hidden relative',
        modeStyles.bg,
        'transition-all duration-300'
      )}
    >
      {/* Drag handle */}
      <div
        className="absolute top-1 left-1/2 -translate-x-1/2 cursor-move opacity-50 hover:opacity-100 transition-opacity z-10"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <GripHorizontal className="h-4 w-4 text-white/60" />
      </div>

      <div className="flex items-center justify-between h-full px-3 py-2">
        {/* Left: Mode icon and circular progress */}
        <div className="flex items-center gap-2 relative">
          {/* Circular progress indicator */}
          <div className="relative">
            <svg
              className="transform -rotate-90"
              width="60"
              height="60"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/20"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={cn(
                  'text-white/60 transition-all duration-1000 ease-linear',
                  state.isRunning && !state.isPaused && 'text-white/80'
                )}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-white">
                  {state.timeRemaining}
                </div>
              </div>
            </div>
          </div>

          {/* Mode and task info */}
          <div className="flex flex-col min-w-0 max-w-[80px]">
            <div className="flex items-center gap-1">
              {modeStyles.icon}
              <span className="text-[10px] font-medium text-white/80 uppercase tracking-wide">
                {modeStyles.label}
              </span>
            </div>
            {state.taskTitle && (
              <span className="text-[10px] text-white/60 truncate mt-0.5" title={state.taskTitle}>
                {state.taskTitle}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleTimer}
            className={cn(
              'p-2 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30 active:scale-95',
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
              'p-2 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              !state.isRunning && 'opacity-40 cursor-not-allowed'
            )}
            disabled={!state.isRunning}
            title="Saltar"
          >
            <SkipForward className="h-4 w-4 text-white" />
          </button>

          <button
            onClick={handleExpand}
            className={cn(
              'p-2 rounded-full transition-all',
              'bg-white/20 hover:bg-white/30 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            title="Expandir"
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </button>

          <button
            onClick={handleToggleMiniMode}
            className={cn(
              'p-2 rounded-full transition-all',
              'bg-white/10 hover:bg-white/20 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-white/50'
            )}
            title="Mini modo"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Subtle bottom progress bar as backup */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear',
            state.isRunning && !state.isPaused ? 'bg-white/60' : 'bg-white/30'
          )}
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  )
}

export default TimerFloatingWindow
