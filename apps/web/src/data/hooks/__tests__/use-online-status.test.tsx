import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../use-online-status.hook';
import { __resetOnlineStatusMonitor } from '@/lib/online-status-monitor';

const OFFLINE_CONFIRMATION_DELAY_MS = 5000;

function goOffline() {
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
}

function goOnline() {
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
}

describe('useOnlineStatus', () => {
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

  it('stays silent during a micro-flap (offline under 5s)', () => {
    const { result } = renderHook(() => useOnlineStatus());

    goOffline();
    expect(result.current.isOnline).toBe(true);

    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS - 1000);
    });
    expect(result.current.isOnline).toBe(true);

    goOnline();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('confirms offline only after the delay', () => {
    const { result } = renderHook(() => useOnlineStatus());

    goOffline();
    expect(result.current.isOnline).toBe(true);

    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS);
    });
    expect(result.current.isOnline).toBe(false);
  });

  it('announces recovery after a confirmed offline period', () => {
    const { result } = renderHook(() => useOnlineStatus());

    goOffline();
    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS);
    });
    expect(result.current.isOnline).toBe(false);

    goOnline();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.wasOffline).toBe(false);
  });

  it('announces recovery when the page was loaded offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });
    __resetOnlineStatusMonitor();

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);

    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
    goOnline();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);
  });

  it('stays silent for a second flap right after a confirmed cycle', () => {
    const { result } = renderHook(() => useOnlineStatus());

    // First cycle: confirmed outage and recovery
    goOffline();
    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS);
    });
    goOnline();
    expect(result.current.wasOffline).toBe(true);
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Second flap under 5s must not re-announce anything
    goOffline();
    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS - 1000);
    });
    goOnline();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('does not update state after unmount with a pending confirmation', () => {
    const { result, unmount } = renderHook(() => useOnlineStatus());

    goOffline();
    unmount();
    act(() => {
      vi.advanceTimersByTime(OFFLINE_CONFIRMATION_DELAY_MS + 1000);
    });

    // The hook unsubscribed on unmount: its state stays frozen at the last
    // rendered value even though the monitor confirms the outage
    expect(result.current.isOnline).toBe(true);
  });
});
