/**
 * Background Timer Hook Tests
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useBackgroundTimer } from "../use-background-timer.hook";

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest
    .fn()
    .mockResolvedValue("test-notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("useBackgroundTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useBackgroundTimer());

    expect(result.current).toEqual({
      remaining: 0,
      total: 0,
      isRunning: false,
    });
  });

  it("should start background timer", async () => {
    const { result } = renderHook(() => useBackgroundTimer());
    const { startBackgroundTimer } = result.current;

    await act(async () => {
      await startBackgroundTimer({
        duration: 25 * 60 * 1000, // 25 minutes
        title: "Test Timer",
        body: "Timer completed",
      });
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.total).toBe(25 * 60); // 25 minutes in seconds
    expect(result.current.remaining).toBe(25 * 60);
  });

  it("should stop background timer", async () => {
    const { result } = renderHook(() => useBackgroundTimer());
    const { startBackgroundTimer, stopBackgroundTimer } = result.current;

    await act(async () => {
      await startBackgroundTimer({
        duration: 25 * 60 * 1000,
        title: "Test Timer",
        body: "Timer completed",
      });
    });

    await act(async () => {
      await stopBackgroundTimer();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it("should call onTick every second", async () => {
    const onTickMock = jest.fn();
    const { result } = renderHook(() => useBackgroundTimer());
    const { startBackgroundTimer } = result.current;

    await act(async () => {
      await startBackgroundTimer({
        duration: 5 * 60 * 1000, // 5 minutes
        title: "Test Timer",
        body: "Timer completed",
        onTick: onTickMock,
      });
    });

    // Fast-forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(onTickMock).toHaveBeenCalled();
    });
  });

  it("should call onComplete when timer finishes", async () => {
    const onCompleteMock = jest.fn();
    const { result } = renderHook(() => useBackgroundTimer());
    const { startBackgroundTimer } = result.current;

    await act(async () => {
      await startBackgroundTimer({
        duration: 1 * 60 * 1000, // 1 minute
        title: "Test Timer",
        body: "Timer completed",
        onComplete: onCompleteMock,
      });
    });

    // Fast-forward past completion
    act(() => {
      jest.advanceTimersByTime(61 * 1000); // 1 minute + 1 second
    });

    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalled();
      expect(result.current.isRunning).toBe(false);
    });
  });

  it("should cleanup timer and notification on unmount", () => {
    const { unmount } = renderHook(() => useBackgroundTimer());
    const expoNotifications = jest.requireActual("expo-notifications");
    const { cancelScheduledNotificationAsync } = expoNotifications;

    unmount();

    expect(clearInterval).toHaveBeenCalled();
    expect(cancelScheduledNotificationAsync).toHaveBeenCalled();
  });
});
