import { Notification, shell, BrowserWindow } from 'electron'
import * as path from 'path'

export interface NotificationOptions {
  title: string
  body: string
  silent?: boolean
  urgency?: 'normal' | 'critical' | 'low'
  timeoutType?: 'default' | 'never'
  actions?: Array<{ type: 'button'; text: string }>
  onClick?: () => void
  onAction?: (index: number) => void
}

function getIconPath(): string {
  const { app } = require('electron')
  
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'icon.png')
  }
  
  return path.join(__dirname, '..', 'build', 'icon.png')
}

export function showNotification(options: NotificationOptions): Notification | null {
  if (!Notification.isSupported()) {
    console.warn('Notifications are not supported on this system')
    return null
  }

  const notification = new Notification({
    title: options.title,
    body: options.body,
    silent: options.silent ?? false,
    icon: getIconPath(),
    urgency: options.urgency ?? 'normal',
    timeoutType: options.timeoutType ?? 'default',
    actions: options.actions,
  })

  notification.on('click', () => {
    options.onClick?.()
  })

  notification.on('action', (event, index) => {
    options.onAction?.(index)
  })

  notification.show()
  return notification
}

// Pre-configured notification types
export const notifications = {
  pomodoroComplete: (mainWindow: BrowserWindow) => {
    return showNotification({
      title: '🍅 ¡Pomodoro Completado!',
      body: '¡Excelente trabajo! Es hora de tomar un descanso.',
      urgency: 'normal',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    })
  },

  shortBreakComplete: (mainWindow: BrowserWindow) => {
    return showNotification({
      title: '☕ Descanso Terminado',
      body: 'Es hora de volver al trabajo. ¡Tú puedes!',
      urgency: 'normal',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    })
  },

  longBreakComplete: (mainWindow: BrowserWindow) => {
    return showNotification({
      title: '🌿 Descanso Largo Terminado',
      body: '¡Recargado! Es hora de empezar una nueva sesión.',
      urgency: 'normal',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    })
  },

  taskDue: (mainWindow: BrowserWindow, taskTitle: string) => {
    return showNotification({
      title: '⏰ Tarea Vencida',
      body: `La tarea "${taskTitle}" ha vencido.`,
      urgency: 'critical',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('notification-action', 'task:view-overdue')
      },
    })
  },

  taskReminder: (mainWindow: BrowserWindow, taskTitle: string, dueIn: string) => {
    return showNotification({
      title: '📋 Recordatorio de Tarea',
      body: `"${taskTitle}" vence ${dueIn}.`,
      urgency: 'normal',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    })
  },

  syncComplete: () => {
    return showNotification({
      title: '✅ Sincronización Completada',
      body: 'Todos los cambios han sido sincronizados.',
      urgency: 'low',
      silent: true,
    })
  },

  syncError: (mainWindow: BrowserWindow) => {
    return showNotification({
      title: '❌ Error de Sincronización',
      body: 'No se pudieron sincronizar los cambios. Reintentar.',
      urgency: 'critical',
      onClick: () => {
        mainWindow.show()
        mainWindow.focus()
      },
    })
  },

  achievementUnlocked: (achievementName: string) => {
    return showNotification({
      title: '🏆 ¡Logro Desbloqueado!',
      body: achievementName,
      urgency: 'normal',
    })
  },

  streakMilestone: (days: number) => {
    return showNotification({
      title: '🔥 ¡Racha de Productividad!',
      body: `¡Has mantenido tu racha por ${days} días consecutivos!`,
      urgency: 'normal',
    })
  },

  custom: (title: string, body: string, options?: Partial<NotificationOptions>) => {
    return showNotification({
      title,
      body,
      ...options,
    })
  },
}

// Play system sound (cross-platform)
export function playSound(): void {
  shell.beep()
}
