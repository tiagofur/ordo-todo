import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Bell, Zap, Coffee, Calendar, Trophy, Volume2, VolumeX } from 'lucide-react';
import { desktopBridge } from '@/lib/desktop-bridge';

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

  // Initialize system settings from desktopBridge
  useEffect(() => {
    desktopBridge.isAutostartEnabled().then((launchAtLogin) => {
      setState((prev) => ({ ...prev, launchAtLogin }));
    });
  }, []);

  // Show system notification
  const showNotification = useCallback((options: SystemNotificationOptions) => {
    if (!state.notificationsEnabled) return;

    try {
      desktopBridge.sendNotification(options.title, options.body);
      if (state.soundEnabled && !options.silent) {
        playNotificationSound(options.urgency);
      }
    } catch {
      toast(options.body, {
        icon: getNotificationIcon(options.urgency),
        duration: options.urgency === 'critical' ? 8000 : 4000,
      });
    }
  }, [state.notificationsEnabled, state.soundEnabled]);

  // Update app badge count
  const updateBadgeCount = useCallback((count: number) => {
    setState((prev) => ({ ...prev, badgeCount: count }));
    desktopBridge.setBadgeCount(count);
  }, []);

  // Toggle setting
  const toggleSetting = useCallback((setting: keyof SystemIntegrationState) => {
    setState((prev) => {
      const updated = !prev[setting];
      if (setting === 'launchAtLogin') {
        desktopBridge.setAutostart(updated);
      }
      return { ...prev, [setting]: updated };
    });
  }, []);

  // Set specific setting
  const setSetting = useCallback((setting: keyof SystemIntegrationState, value: any) => {
    setState((prev) => {
      if (setting === 'launchAtLogin') {
        desktopBridge.setAutostart(value);
      }
      return { ...prev, [setting]: value };
    });
  }, []);

  return {
    state,
    showNotification,
    updateBadgeCount,
    toggleSetting,
    setSetting,
    isDesktop: desktopBridge.isNative(),
  };
}

function getNotificationIcon(urgency?: string) {
  switch (urgency) {
    case 'critical':
      return <Bell className="h-4 w-4 text-red-500" />;
    case 'low':
      return <Coffee className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-yellow-500" />;
  }
}

function playNotificationSound(urgency?: string) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (urgency === 'critical') {
      osc.frequency.setValueAtTime(880, audioContext.currentTime);
      osc.frequency.setValueAtTime(440, audioContext.currentTime + 0.15);
    } else {
      osc.frequency.setValueAtTime(587.33, audioContext.currentTime);
      osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc.start();
    osc.stop(audioContext.currentTime + 0.35);
  } catch {
    // Ignore audio context autoplay errors
  }
}

export function SystemIntegrationSettings() {
  const { state, toggleSetting } = useSystemIntegration();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integración del Sistema</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.notificationsEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Notificaciones del Sistema</p>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificaciones de escritorio para eventos y pomodoros
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('notificationsEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.notificationsEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.soundEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {state.soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-medium">Sonidos de Notificación</p>
                <p className="text-sm text-muted-foreground">
                  Reproducir tonos sutiles al completar ciclos
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('soundEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.soundEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${state.launchAtLogin ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Iniciar al Arrancar el Sistema</p>
                <p className="text-sm text-muted-foreground">
                  Abrir Ordo-Todo en segundo plano al iniciar sesión
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('launchAtLogin')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                state.launchAtLogin ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.launchAtLogin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}