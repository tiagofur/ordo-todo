/**
 * Ordo-Todo Desktop Bridge
 * Unified abstraction layer for native Tauri v2 functionality
 * with automatic, graceful fallbacks for web/dev environments.
 */

import { getCurrentWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification as tauriSendNotification,
} from '@tauri-apps/plugin-notification';
import { openUrl as tauriOpenUrl } from '@tauri-apps/plugin-opener';
import {
  enable as enableAutostart,
  disable as disableAutostart,
  isEnabled as isAutostartEnabled,
} from '@tauri-apps/plugin-autostart';
import {
  register as registerShortcut,
  unregister as unregisterShortcut,
} from '@tauri-apps/plugin-global-shortcut';

export type TimerMode = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE';

export interface TimerSyncState {
  timeRemaining: string;
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  taskTitle: string | null;
  progress: number;
}

export interface TimerAction {
  type: 'start' | 'pause' | 'resume' | 'skip' | 'stop' | 'toggle';
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

class DesktopBridge {
  private isTauri: boolean;
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('ordo-desktop-timer-sync');
    }
  }

  /**
   * Check if running in native desktop shell (Tauri)
   */
  public isNative(): boolean {
    return this.isTauri;
  }

  /**
   * Platform identifier ('macos', 'windows', 'linux', or 'web')
   */
  public getPlatform(): string {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      const plat = (navigator.platform || '').toLowerCase();
      if (ua.includes('mac') || plat.includes('mac')) return 'darwin';
      if (ua.includes('win') || plat.includes('win')) return 'win32';
      if (ua.includes('linux') || plat.includes('linux')) return 'linux';
    }
    return 'unknown';
  }

  // ==========================================
  // Window Controls
  // ==========================================

  public async minimize(): Promise<void> {
    if (this.isTauri) {
      await getCurrentWindow().minimize();
    }
  }

  public async toggleMaximize(): Promise<void> {
    if (this.isTauri) {
      await getCurrentWindow().toggleMaximize();
    }
  }

  public async close(): Promise<void> {
    if (this.isTauri) {
      await getCurrentWindow().close();
    }
  }

  public async startDragging(): Promise<void> {
    if (this.isTauri) {
      await getCurrentWindow().startDragging();
    }
  }

  public async isMaximized(): Promise<boolean> {
    if (this.isTauri) {
      return await getCurrentWindow().isMaximized();
    }
    return false;
  }

  // ==========================================
  // System Tray & Mini Timer
  // ==========================================

  public async toggleMiniTimer(): Promise<boolean> {
    if (this.isTauri) {
      return await invoke<boolean>('toggle_mini_timer');
    }
    return false;
  }

  public async setMiniTimerVisible(visible: boolean): Promise<void> {
    if (this.isTauri) {
      await invoke('set_timer_window_visible', { visible });
    }
  }

  public async updateTrayTitle(title: string): Promise<void> {
    if (this.isTauri) {
      try {
        await invoke('update_tray_title', { title });
      } catch (err) {
        console.warn('Failed to update tray title:', err);
      }
    }
  }

  public async setBadgeCount(count: number | null): Promise<void> {
    if (this.isTauri) {
      try {
        await invoke('set_badge_count', { count });
      } catch (err) {
        console.warn('Failed to set badge count:', err);
      }
    }
  }

  public async getSystemInfo(): Promise<SystemInfo> {
    if (this.isTauri) {
      try {
        return await invoke<SystemInfo>('get_system_info');
      } catch {
        // Fallback below
      }
    }
    return {
      platform: navigator.platform || 'web',
      arch: 'unknown',
      version: '1.0.0',
    };
  }

  // ==========================================
  // Notifications
  // ==========================================

  public async sendNotification(title: string, body?: string): Promise<void> {
    if (this.isTauri) {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      if (permissionGranted) {
        tauriSendNotification({ title, body });
        return;
      }
    }

    // Web Notification fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  // ==========================================
  // External URLs
  // ==========================================

  public async openExternal(url: string): Promise<void> {
    if (this.isTauri) {
      try {
        await tauriOpenUrl(url);
        return;
      } catch (e) {
        console.warn('Failed to open URL with Tauri opener, falling back to window.open:', e);
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ==========================================
  // Auto-Start (Launch at Login)
  // ==========================================

  public async isAutostartEnabled(): Promise<boolean> {
    if (this.isTauri) {
      try {
        return await isAutostartEnabled();
      } catch {
        return false;
      }
    }
    return false;
  }

  public async setAutostart(enable: boolean): Promise<boolean> {
    if (this.isTauri) {
      try {
        if (enable) {
          await enableAutostart();
        } else {
          await disableAutostart();
        }
        return true;
      } catch (err) {
        console.error('Failed to update autostart setting:', err);
        return false;
      }
    }
    return false;
  }

  // ==========================================
  // Global Shortcuts
  // ==========================================

  public async registerShortcut(shortcut: string, handler: () => void): Promise<boolean> {
    if (this.isTauri) {
      try {
        await registerShortcut(shortcut, (event) => {
          if (event.state === 'Pressed') {
            handler();
          }
        });
        return true;
      } catch (err) {
        console.warn(`Failed to register shortcut ${shortcut}:`, err);
        return false;
      }
    }
    return false;
  }

  public async unregisterShortcut(shortcut: string): Promise<void> {
    if (this.isTauri) {
      try {
        await unregisterShortcut(shortcut);
      } catch (err) {
        console.warn(`Failed to unregister shortcut ${shortcut}:`, err);
      }
    }
  }

  // ==========================================
  // Inter-Window State Synchronization
  // ==========================================

  public async broadcastTimerState(state: TimerSyncState): Promise<void> {
    if (this.isTauri) {
      try {
        await emit('timer:state-update', state);
      } catch (err) {
        console.warn('Failed to emit tauri timer state update:', err);
      }
    }
    if (this.channel) {
      this.channel.postMessage({ type: 'timer:state-update', payload: state });
    }
  }

  public onTimerStateUpdate(callback: (state: TimerSyncState) => void): () => void {
    let unlistenTauri: UnlistenFn | null = null;

    if (this.isTauri) {
      listen<TimerSyncState>('timer:state-update', (event) => {
        callback(event.payload);
      }).then((unlisten) => {
        unlistenTauri = unlisten;
      });
    }

    const channelHandler = (event: MessageEvent) => {
      if (event.data?.type === 'timer:state-update') {
        callback(event.data.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', channelHandler);
    }

    return () => {
      if (unlistenTauri) {
        unlistenTauri();
      }
      if (this.channel) {
        this.channel.removeEventListener('message', channelHandler);
      }
    };
  }

  public async sendTimerAction(action: TimerAction): Promise<void> {
    if (this.isTauri) {
      try {
        await emit('timer:action', action);
      } catch (err) {
        console.warn('Failed to emit tauri timer action:', err);
      }
    }
    if (this.channel) {
      this.channel.postMessage({ type: 'timer:action', payload: action });
    }
  }

  public onTimerAction(callback: (action: TimerAction) => void): () => void {
    let unlistenTauri: UnlistenFn | null = null;

    if (this.isTauri) {
      listen<TimerAction>('timer:action', (event) => {
        callback(event.payload);
      }).then((unlisten) => {
        unlistenTauri = unlisten;
      });
    }

    const channelHandler = (event: MessageEvent) => {
      if (event.data?.type === 'timer:action') {
        callback(event.data.payload);
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', channelHandler);
    }

    return () => {
      if (unlistenTauri) {
        unlistenTauri();
      }
      if (this.channel) {
        this.channel.removeEventListener('message', channelHandler);
      }
    };
  }
}

export const desktopBridge = new DesktopBridge();
