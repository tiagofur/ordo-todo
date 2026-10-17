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
import { desktopBridge, type TimerMode, type TimerSyncState } from '@/lib/desktop-bridge'

const defaultState: TimerSyncState = {
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
 * Enhanced version for Tauri v2 with:
 * - Native inter-window broadcast sync
 * - data-tauri-drag-region for native window dragging
 * - Mini-mode toggle for ultra-compact display
 * - Circular progress indicator
 */
export function TimerFloatingWindow() {
  const [state, setState] = useState<TimerSyncState>(defaultState)
  const [isMiniMode, setIsMiniMode] = useState(false)

  // Listen for state updates from main process / window
  useEffect(() => {
    const unsubscribe = desktopBridge.onTimerStateUpdate((newState) => {
      setState((prev) => ({ ...prev, ...newState }))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleToggleTimer = useCallback(() => {
    desktopBridge.sendTimerAction({ type: 'toggle' })
  }, [])

  const handleSkip = useCallback(() => {
    desktopBridge.sendTimerAction({ type: 'skip' })
  }, [])

  const handleExpand = useCallback(() => {
    // Hide mini-timer and focus main window
    desktopBridge.setMiniTimerVisible(false)
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
    return (
      <div
        data-tauri-drag-region
        className={cn(
          'w-full h-full rounded-full shadow-2xl overflow-hidden select-none',
          'border-2 border-zinc-700',
          modeStyles.bg,
          'transition-all duration-300'
        )}
      >
        <div className="flex items-center justify-center h-full px-2 py-1" data-tauri-drag-region>
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

  return (
    <div
      data-tauri-drag-region
      className={cn(
        'w-full h-full rounded-2xl shadow-2xl overflow-hidden relative select-none',
        modeStyles.bg,
        'transition-all duration-300'
      )}
    >
      {/* Drag handle */}
      <div
        data-tauri-drag-region
        className="absolute top-1 left-1/2 -translate-x-1/2 cursor-move opacity-50 hover:opacity-100 transition-opacity z-10"
      >
        <GripHorizontal className="h-4 w-4 text-white/60" />
      </div>

      <div className="flex items-center justify-between h-full px-3 py-2" data-tauri-drag-region>
        {/* Left: Mode icon and circular progress */}
        <div className="flex items-center gap-2 relative" data-tauri-drag-region>
          {/* Circular progress indicator */}
          <div className="relative">
            <svg
              className="transform -rotate-90"
              width="60"
              height="60"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/20"
              />
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

      {/* Subtle bottom progress bar */}
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
