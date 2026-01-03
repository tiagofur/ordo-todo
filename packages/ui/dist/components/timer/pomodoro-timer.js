import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Play, Pause, Square, SkipForward, RefreshCw, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../ui/dialog.js';
const MODE_COLORS = {
    WORK: '#ef4444',
    SHORT_BREAK: '#4ade80',
    LONG_BREAK: '#15803d',
    CONTINUOUS: '#3b82f6',
};
/**
 * Format time from seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
/**
 * PomodoroTimer - Platform-agnostic timer display with controls
 *
 * All state and actions are passed via props for maximum flexibility.
 *
 * @example
 * // In web app
 * const timerContext = useTimer();
 *
 * <PomodoroTimer
 *   state={{
 *     isLoaded: timerContext.isLoaded,
 *     isRunning: timerContext.isRunning,
 *     // ... other state
 *   }}
 *   actions={{
 *     start: timerContext.start,
 *     pause: timerContext.pause,
 *     // ... other actions
 *   }}
 *   TaskSelectorComponent={<TaskSelector ... />}
 *   onFocusModeClick={() => router.push('/focus')}
 *   labels={{ ... }}
 * />
 */
export function PomodoroTimer({ state, actions, TaskSelectorComponent, onFocusModeClick, labels = {}, showSwitchDialog = false, setShowSwitchDialog, }) {
    const { isLoaded, isRunning, isPaused, timeLeft, mode, completedPomodoros, pauseCount, defaultMode, progress, } = state;
    const { start, pause, resume, stop, skipToNext } = actions;
    const { stopwatch = 'Stopwatch', pomodoroCount = (count) => `Pomodoro ${count}`, shortBreak = 'Short Break', longBreak = 'Long Break', paused = 'Paused', pauseCount: pauseCountLabel = (count) => `${count} pause${count !== 1 ? 's' : ''}`, switchTaskTitle = 'Switch Task', switchTaskDescription = 'Select a different task to track time against.', switchTaskButtonTitle = 'Switch task', enterFocusMode = 'Enter Focus Mode', } = labels;
    const accentColor = MODE_COLORS[mode] || '#ef4444';
    const getModeLabel = () => {
        if (defaultMode === 'CONTINUOUS')
            return stopwatch;
        if (mode === 'WORK')
            return pomodoroCount(completedPomodoros + 1);
        if (mode === 'SHORT_BREAK')
            return shortBreak;
        if (mode === 'LONG_BREAK')
            return longBreak;
        return '';
    };
    const handlePlayPause = () => {
        if (isRunning && !isPaused) {
            pause();
        }
        else if (isPaused) {
            resume();
        }
        else {
            start();
        }
    };
    if (!isLoaded)
        return null;
    return (_jsxs("div", { className: "w-full max-w-lg mx-auto flex flex-col items-center gap-8 relative", children: [onFocusModeClick && (_jsx("div", { className: "absolute top-0 right-0", children: _jsx("button", { onClick: onFocusModeClick, title: enterFocusMode, children: _jsx(Maximize2, { className: "w-6 h-6 text-muted-foreground/50 hover:text-foreground transition-colors" }) }) })), _jsxs("div", { className: "text-center w-full max-w-sm", children: [_jsx("p", { className: "font-semibold text-lg mb-4 transition-colors duration-300 animate-in fade-in", style: { color: accentColor }, children: getModeLabel() }), TaskSelectorComponent, isRunning && pauseCount > 0 && (_jsx("div", { className: "mt-3 text-xs text-muted-foreground flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2", children: _jsx("span", { children: pauseCountLabel(pauseCount) }) }))] }), _jsxs("div", { className: "relative animate-in zoom-in fade-in duration-500", children: [_jsxs("svg", { className: "h-80 w-80 -rotate-90 transform transition-rotate duration-500", children: [_jsx("circle", { cx: "160", cy: "160", r: "150", stroke: "currentColor", strokeWidth: "10", fill: "none", className: "text-muted/20" }), _jsx("circle", { cx: "160", cy: "160", r: "150", strokeWidth: "10", fill: "none", strokeDasharray: `${2 * Math.PI * 150}`, style: {
                                    stroke: accentColor,
                                    strokeDashoffset: `${2 * Math.PI * 150 * (1 - progress / 100)}`,
                                    transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                                }, strokeLinecap: "round" })] }), _jsxs("div", { className: "absolute inset-0 flex items-center justify-center flex-col gap-2", children: [_jsx("h1", { className: "text-7xl font-bold tabular-nums text-foreground", children: formatTime(timeLeft) }), isPaused && (_jsx("span", { className: "text-sm text-muted-foreground animate-pulse", children: paused }))] })] }), _jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsx("button", { onClick: handlePlayPause, className: "flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95", style: {
                            backgroundColor: accentColor,
                            boxShadow: `0 10px 20px -5px ${accentColor}50`,
                        }, children: isRunning && !isPaused ? (_jsx(Pause, { className: "h-8 w-8" })) : (_jsx(Play, { className: "h-8 w-8 ml-1" })) }), (isRunning || isPaused) && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => stop(false), className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background", children: _jsx(Square, { className: "h-6 w-6" }) }), defaultMode === 'POMODORO' && (_jsx("button", { onClick: skipToNext, className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background", children: _jsx(SkipForward, { className: "h-6 w-6" }) })), _jsx("button", { onClick: () => setShowSwitchDialog?.(true), className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background", title: switchTaskButtonTitle, children: _jsx(RefreshCw, { className: "h-6 w-6" }) })] }))] }), _jsx(Dialog, { open: showSwitchDialog, onOpenChange: setShowSwitchDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: switchTaskTitle }), _jsx(DialogDescription, { children: switchTaskDescription })] }), _jsx("div", { className: "py-4", children: TaskSelectorComponent })] }) })] }));
}
