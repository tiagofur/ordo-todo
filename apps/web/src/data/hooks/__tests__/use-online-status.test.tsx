import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../use-online-status.hook';

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
  });

  afterEach(() => {
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
});
