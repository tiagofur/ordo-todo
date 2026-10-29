import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getOnlineStatus,
  subscribeOnlineStatus,
  __resetOnlineStatusMonitor,
} from '../online-status-monitor';

const CONFIRMATION_DELAY_MS = 5000;

function goOffline() {
  window.dispatchEvent(new Event('offline'));
}

function goOnline() {
  window.dispatchEvent(new Event('online'));
}

function trackCustomEvents() {
  const seen: string[] = [];
  window.addEventListener('ordo-todo:online', () => seen.push('online'));
  window.addEventListener('ordo-todo:offline', () => seen.push('offline'));
  return seen;
}

describe('online-status-monitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom leaves navigator.onLine undefined; browsers always report a boolean
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
    __resetOnlineStatusMonitor();
  });

  afterEach(() => {
    __resetOnlineStatusMonitor();
    vi.useRealTimers();
    // Restore jsdom's navigator.onLine if a test overrode it
    delete (window.navigator as unknown as { onLine?: boolean }).onLine;
  });

  it('starts from the current navigator state', () => {
    expect(getOnlineStatus()).toBe(true);

    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });
    __resetOnlineStatusMonitor();
    expect(getOnlineStatus()).toBe(false);
  });

  it('notifies subscribers once per confirmed transition', () => {
    const listener = vi.fn();
    const events = trackCustomEvents();
    const unsubscribe = subscribeOnlineStatus(listener);

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(false);
    expect(getOnlineStatus()).toBe(false);

    goOnline();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(true);
    expect(getOnlineStatus()).toBe(true);
    expect(events).toEqual(['offline', 'online']);

    unsubscribe();
  });

  it('stays silent on micro-flaps', () => {
    const listener = vi.fn();
    const events = trackCustomEvents();
    subscribeOnlineStatus(listener);

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS - 1000);
    goOnline();
    expect(listener).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    expect(getOnlineStatus()).toBe(true);
  });

  it('does not restart the confirmation on repeated offline events', () => {
    const listener = vi.fn();
    subscribeOnlineStatus(listener);

    goOffline();
    goOffline();
    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(false);
  });

  it('does not re-report an already confirmed outage', () => {
    const listener = vi.fn();
    const events = trackCustomEvents();
    subscribeOnlineStatus(listener);

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['offline']);
  });

  it('reports only confirmed transitions across a flap chain', () => {
    const listener = vi.fn();
    subscribeOnlineStatus(listener);

    // Confirmed outage of 6s, then a 3s flap that must stay silent
    goOffline();
    vi.advanceTimersByTime(6000);
    goOnline();
    goOffline();
    vi.advanceTimersByTime(3000);
    goOnline();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, false);
    expect(listener).toHaveBeenNthCalledWith(2, true);
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeOnlineStatus(listener);
    unsubscribe();

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    goOnline();

    // The monitor keeps tracking state internally, just without notifying
    expect(listener).not.toHaveBeenCalled();
    expect(getOnlineStatus()).toBe(true);
  });

  it('keeps fanning out when a listener throws', () => {
    const failing = vi.fn(() => {
      throw new Error('boom');
    });
    const healthy = vi.fn();
    const events = trackCustomEvents();
    subscribeOnlineStatus(failing);
    subscribeOnlineStatus(healthy);

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);

    expect(healthy).toHaveBeenCalledWith(false);
    expect(events).toEqual(['offline']);
  });
});
