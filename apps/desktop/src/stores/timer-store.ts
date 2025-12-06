import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'

export interface TimerConfig {
  workDuration: number // in minutes
  shortBreakDuration: number
  longBreakDuration: number
  pomodorosUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
}

export interface TimerState {
  // Timer state
  mode: TimerMode
  isRunning: boolean
  isPaused: boolean
  timeLeft: number // in seconds
  completedPomodoros: number
  pauseCount: number
  
  // Selected task
  selectedTaskId: string | null
  selectedTaskTitle: string | null
  
  // Config
  config: TimerConfig
  
  // Actions
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  skip: () => void
  reset: () => void
  tick: () => void
  
  setMode: (mode: TimerMode) => void
  setSelectedTask: (taskId: string | null, taskTitle: string | null) => void
  updateConfig: (config: Partial<TimerConfig>) => void
  
  // Computed
  getTimeFormatted: () => string
  getProgress: () => number
}

const defaultConfig: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
}

function getDurationForMode(mode: TimerMode, config: TimerConfig): number {
  switch (mode) {
    case 'WORK':
      return config.workDuration * 60
    case 'SHORT_BREAK':
      return config.shortBreakDuration * 60
    case 'LONG_BREAK':
      return config.longBreakDuration * 60
    default:
      return config.workDuration * 60
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'IDLE',
      isRunning: false,
      isPaused: false,
      timeLeft: defaultConfig.workDuration * 60,
      completedPomodoros: 0,
      pauseCount: 0,
      selectedTaskId: null,
      selectedTaskTitle: null,
      config: defaultConfig,

      // Actions
      start: () => {
        const { mode, config } = get()
        const newMode = mode === 'IDLE' ? 'WORK' : mode
        const duration = getDurationForMode(newMode, config)
        
        set({
          mode: newMode,
          isRunning: true,
          isPaused: false,
          timeLeft: duration,
          pauseCount: 0,
        })
        
        // Update tray
        updateTray(get())
      },

      pause: () => {
        set((state) => ({
          isPaused: true,
          pauseCount: state.pauseCount + 1,
        }))
        updateTray(get())
      },

      resume: () => {
        set({ isPaused: false })
        updateTray(get())
      },

      stop: () => {
        const { config } = get()
        set({
          mode: 'IDLE',
          isRunning: false,
          isPaused: false,
          timeLeft: config.workDuration * 60,
          pauseCount: 0,
        })
        updateTray(get())
      },

      skip: () => {
        const { mode, completedPomodoros, config } = get()
        let nextMode: TimerMode = 'WORK'
        let newCompletedPomodoros = completedPomodoros

        if (mode === 'WORK') {
          newCompletedPomodoros = completedPomodoros + 1
          if (newCompletedPomodoros % config.pomodorosUntilLongBreak === 0) {
            nextMode = 'LONG_BREAK'
          } else {
            nextMode = 'SHORT_BREAK'
          }
        }

        const duration = getDurationForMode(nextMode, config)

        set({
          mode: nextMode,
          timeLeft: duration,
          completedPomodoros: newCompletedPomodoros,
          pauseCount: 0,
          isRunning: config.autoStartBreaks || config.autoStartPomodoros,
          isPaused: false,
        })
        
        // Notify
        if (mode === 'WORK' && config.notificationsEnabled) {
          window.electronAPI?.notifyPomodoroComplete()
        } else if (mode === 'SHORT_BREAK' && config.notificationsEnabled) {
          window.electronAPI?.notifyShortBreakComplete()
        } else if (mode === 'LONG_BREAK' && config.notificationsEnabled) {
          window.electronAPI?.notifyLongBreakComplete()
        }
        
        updateTray(get())
      },

      reset: () => {
        const { mode, config } = get()
        const duration = getDurationForMode(mode === 'IDLE' ? 'WORK' : mode, config)
        set({
          timeLeft: duration,
          pauseCount: 0,
          isPaused: false,
        })
        updateTray(get())
      },

      tick: () => {
        const { timeLeft, isRunning, isPaused } = get()
        
        if (!isRunning || isPaused) return
        
        if (timeLeft <= 1) {
          // Timer complete
          get().skip()
        } else {
          set({ timeLeft: timeLeft - 1 })
          updateTray(get())
        }
      },

      setMode: (mode: TimerMode) => {
        const { config } = get()
        const duration = getDurationForMode(mode, config)
        set({
          mode,
          timeLeft: duration,
          isRunning: false,
          isPaused: false,
          pauseCount: 0,
        })
        updateTray(get())
      },

      setSelectedTask: (taskId: string | null, taskTitle: string | null) => {
        set({
          selectedTaskId: taskId,
          selectedTaskTitle: taskTitle,
        })
        updateTray(get())
      },

      updateConfig: (partialConfig: Partial<TimerConfig>) => {
        set((state) => ({
          config: { ...state.config, ...partialConfig },
        }))
      },

      // Computed
      getTimeFormatted: () => formatTime(get().timeLeft),

      getProgress: () => {
        const { mode, timeLeft, config } = get()
        const totalDuration = getDurationForMode(mode === 'IDLE' ? 'WORK' : mode, config)
        return ((totalDuration - timeLeft) / totalDuration) * 100
      },
    }),
    {
      name: 'ordo-timer-store',
      partialize: (state) => ({
        config: state.config,
        completedPomodoros: state.completedPomodoros,
      }),
    }
  )
)

// Helper to update tray state
function updateTray(state: TimerState) {
  if (typeof window !== 'undefined' && window.electronAPI) {
    window.electronAPI.sendTimerState({
      timerActive: state.isRunning,
      isPaused: state.isPaused,
      timeRemaining: formatTime(state.timeLeft),
      currentTask: state.selectedTaskTitle,
      mode: state.mode,
    })
  }
}

// Timer interval manager
let timerInterval: NodeJS.Timeout | null = null

export function startTimerInterval() {
  if (timerInterval) return
  
  timerInterval = setInterval(() => {
    useTimerStore.getState().tick()
  }, 1000)
}

export function stopTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}
