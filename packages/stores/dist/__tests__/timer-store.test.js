import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore, getDurationForMode, formatTime, defaultTimerConfig } from '../timer-store.js';
describe('timer-store utilities', () => {
    it('should return correct duration for modes', () => {
        const config = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            pomodorosUntilLongBreak: 4,
        };
        expect(getDurationForMode('WORK', config)).toBe(25 * 60);
        expect(getDurationForMode('SHORT_BREAK', config)).toBe(5 * 60);
        expect(getDurationForMode('LONG_BREAK', config)).toBe(15 * 60);
    });
    it('should format time correctly', () => {
        expect(formatTime(60)).toBe('01:00');
        expect(formatTime(3600)).toBe('60:00');
        expect(formatTime(10)).toBe('00:10');
    });
});
describe('useTimerStore', () => {
    beforeEach(() => {
        // Manually reset the store to initial state
        useTimerStore.setState({
            mode: 'IDLE',
            isRunning: false,
            isPaused: false,
            timeLeft: defaultTimerConfig.workDuration * 60,
            completedPomodoros: 0,
            pauseCount: 0,
            selectedTaskId: null,
            selectedTaskTitle: null,
            config: defaultTimerConfig,
        });
    });
    it('should initialize with default state', () => {
        const state = useTimerStore.getState();
        expect(state.mode).toBe('IDLE');
        expect(state.isRunning).toBe(false);
        expect(state.timeLeft).toBe(25 * 60);
    });
    it('should start the timer', () => {
        useTimerStore.getState().start();
        const state = useTimerStore.getState();
        expect(state.mode).toBe('WORK');
        expect(state.isRunning).toBe(true);
    });
    it('should pause and resume', () => {
        useTimerStore.getState().start();
        useTimerStore.getState().pause();
        let state = useTimerStore.getState();
        expect(state.isPaused).toBe(true);
        expect(state.pauseCount).toBe(1);
        useTimerStore.getState().resume();
        state = useTimerStore.getState();
        expect(state.isPaused).toBe(false);
    });
    it('should tick correctly', () => {
        useTimerStore.getState().start();
        const initialTime = useTimerStore.getState().timeLeft;
        useTimerStore.getState().tick();
        expect(useTimerStore.getState().timeLeft).toBe(initialTime - 1);
    });
    it('should skip to next mode', () => {
        useTimerStore.getState().start();
        useTimerStore.getState().skip();
        const state = useTimerStore.getState();
        expect(state.mode).toBe('SHORT_BREAK');
        expect(state.completedPomodoros).toBe(1);
    });
    it('should transition to LONG_BREAK after specified pomodoros', () => {
        useTimerStore.getState().updateConfig({ pomodorosUntilLongBreak: 2 });
        // 1st complete
        useTimerStore.getState().setMode('WORK');
        useTimerStore.getState().skip();
        expect(useTimerStore.getState().mode).toBe('SHORT_BREAK');
        expect(useTimerStore.getState().completedPomodoros).toBe(1);
        // 2nd complete
        useTimerStore.getState().setMode('WORK');
        useTimerStore.getState().skip();
        expect(useTimerStore.getState().mode).toBe('LONG_BREAK');
        expect(useTimerStore.getState().completedPomodoros).toBe(2);
    });
    it('should update config', () => {
        useTimerStore.getState().updateConfig({ workDuration: 30 });
        expect(useTimerStore.getState().config.workDuration).toBe(30);
    });
});
