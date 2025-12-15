import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, Zap, Coffee, Calendar, Trophy, Volume2, VolumeX } from 'lucide-react';

// Get electron APIs from window if available (set by preload script)
const electronAPI = (window as any).electronAPI;
const ipcRenderer = electronAPI?.ipcRenderer ?? {
  invoke: async (channel: string, ...args: any[]) => {
    console.log(`IPC invoke ${channel}:`, args);
    return null;
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    console.log(`IPC on ${channel}`);
  },
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    console.log(`IPC removeListener ${channel}`);
  },
};

interface SystemNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  urgency?: 'low' | 'normal' | 'critical';
  actions?: Array<{
    type: string;
    text: string;
  }>;
  silent?: boolean;
}

interface SystemIntegrationState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  launchAtLogin: boolean;
  minimizeToTray: boolean;
  badgeCount: number;
}

export function useSystemIntegration() {
  const [state, setState] = useState<SystemIntegrationState>({
    notificationsEnabled: true,
    soundEnabled: true,
    launchAtLogin: false,
    minimizeToTray: true,
    badgeCount: 0,
  });

  // Initialize system settings
  useEffect(() => {
    // Load settings from electron store
    const loadSettings = async () => {
      try {
        const settings = await ipcRenderer.invoke('getSystemSettings');
        setState(prev => ({ ...prev, ...settings }));
      } catch (error) {
        console.error('Failed to load system settings:', error);
      }
    };

    loadSettings();

    // Listen for system setting changes
    const handleSettingsChange = (_event: unknown, newSettings: Partial<SystemIntegrationState>) => {
      setState(prev => ({ ...prev, ...newSettings }));
    };

    ipcRenderer.on('systemSettingsChanged', handleSettingsChange);

    return () => {
      ipcRenderer.removeListener('systemSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Show system notification
  const showNotification = useCallback((options: SystemNotificationOptions) => {
    if (!state.notificationsEnabled) return;

    try {
      // Use browser Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon.png',
          silent: options.silent || !state.soundEnabled,
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          // Navigate to relevant page based on notification type
          if (options.title.includes('Task')) {
            window.location.hash = '/tasks';
          } else if (options.title.includes('Timer')) {
            window.location.hash = '/timer';
          }
        };

        // Play notification sound if enabled
        if (state.soundEnabled && !options.silent) {
          playNotificationSound(options.urgency);
        }

        return notification;
      } else {
        // Fallback to toast notification
        toast(options.body, {
          icon: getNotificationIcon(options.urgency),
          duration: options.urgency === 'critical' ? 8000 : 4000,
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Fallback to toast notification
      toast(options.body, {
        icon: getNotificationIcon(options.urgency),
        duration: options.urgency === 'critical' ? 8000 : 4000,
      });
    }
  }, [state.notificationsEnabled, state.soundEnabled]);

  // Update app badge count
  const updateBadgeCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, badgeCount: count }));

    try {
      ipcRenderer.invoke('updateBadge', count);
    } catch (error) {
      console.error('Failed to update badge count:', error);
    }
  }, []);

  // Toggle setting
  const toggleSetting = useCallback(async (setting: keyof SystemIntegrationState) => {
    const newValue = !state[setting];

    try {
      await ipcRenderer.invoke('updateSystemSetting', setting, newValue);
      setState(prev => ({ ...prev, [setting]: newValue }));

      toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error(`Failed to toggle ${setting}:`, error);
      toast.error(`Failed to toggle ${setting}`);
    }
  }, [state]);

  // Predefined notification types
  const notifications = {
    taskCompleted: (taskTitle: string) => showNotification({
      title: 'Task Completed! 🎉',
      body: `Great job! You completed "${taskTitle}"`,
      urgency: 'low',
      actions: [
        { type: 'view-tasks', text: 'View Tasks' },
        { type: 'start-new', text: 'Start New Task' },
      ],
    }),

    pomodoroComplete: () => showNotification({
      title: 'Pomodoro Complete! 🍅',
      body: 'Time for a short break',
      urgency: 'normal',
      actions: [
        { type: 'start-break', text: 'Start Break' },
        { type: 'skip-break', text: 'Skip Break' },
      ],
    }),

    breakComplete: () => showNotification({
      title: 'Break Complete! ☕',
      body: 'Ready for another focused session?',
      urgency: 'normal',
      actions: [
        { type: 'start-pomodoro', text: 'Start Pomodoro' },
        { type: 'start-timer', text: 'Custom Timer' },
      ],
    }),

    taskReminder: (taskTitle: string) => showNotification({
      title: 'Task Reminder ⏰',
      body: `"${taskTitle}" is due soon`,
      urgency: 'critical',
    }),

    focusModeStarted: () => showNotification({
      title: 'Focus Mode Started 🧘',
      body: 'All notifications paused. Stay focused!',
      silent: true,
      urgency: 'low',
    }),

    focusModeEnded: (completedTasks: number) => showNotification({
      title: 'Focus Mode Complete! 🏆',
      body: `Great focus session! You completed ${completedTasks} tasks`,
      urgency: 'normal',
    }),

    workspaceInvitation: (workspaceName: string, inviterName: string) => showNotification({
      title: 'Workspace Invitation 📬',
      body: `${inviterName} invited you to "${workspaceName}"`,
      urgency: 'normal',
      actions: [
        { type: 'accept', text: 'Accept' },
        { type: 'decline', text: 'Decline' },
      ],
    }),
  };

  return {
    state,
    showNotification,
    updateBadgeCount,
    toggleSetting,
    notifications,
  };
}

// Helper functions
function getNotificationIcon(urgency?: 'low' | 'normal' | 'critical') {
  switch (urgency) {
    case 'critical':
      return <Calendar className="h-4 w-4 text-red-500" />;
    case 'normal':
      return <Bell className="h-4 w-4 text-blue-500" />;
    default:
      return <Trophy className="h-4 w-4 text-green-500" />;
  }
}

function playNotificationSound(urgency?: 'low' | 'normal' | 'critical') {
  try {
    const audio = new Audio();

    switch (urgency) {
      case 'critical':
        audio.src = '/sounds/critical.mp3';
        break;
      case 'normal':
        audio.src = '/sounds/notification.mp3';
        break;
      default:
        audio.src = '/sounds/soft.mp3';
    }

    audio.volume = 0.3;
    audio.play().catch(console.error);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

// System Integration Settings Component
export function SystemIntegrationSettings() {
  const { state, toggleSetting } = useSystemIntegration();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">System Integration</h3>

        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.notificationsEnabled ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Bell className={`h-5 w-5 ${state.notificationsEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="font-medium">System Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show desktop notifications for important events
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('notificationsEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.soundEnabled ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {state.soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Notification Sounds</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Play sounds for notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('soundEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Launch at Login */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.launchAtLogin ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Zap className={`h-5 w-5 ${state.launchAtLogin ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="font-medium">Launch at Login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start Ordo Todo automatically when you log in
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('launchAtLogin')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.launchAtLogin ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.launchAtLogin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Minimize to Tray */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.minimizeToTray ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Coffee className={`h-5 w-5 ${state.minimizeToTray ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="font-medium">Minimize to Tray</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep app running in system tray when closed
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('minimizeToTray')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.minimizeToTray ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.minimizeToTray ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Badge Count Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="font-medium text-blue-900 dark:text-blue-100">App Badge</p>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Current badge count: <span className="font-semibold">{state.badgeCount}</span>
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Shows pending tasks and notifications count on app icon
        </p>
      </div>
    </div>
  );
}