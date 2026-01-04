import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Timer, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/index.js';
const MODE_COLORS = {
    WORK: '#ef4444',
    SHORT_BREAK: '#22c55e',
    LONG_BREAK: '#3b82f6',
    CONTINUOUS: '#8b5cf6',
    POMODORO: '#ef4444',
    STOPWATCH: '#f59e0b',
};
const DEFAULT_LABELS = {
    work: 'Work',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    continuous: 'Continuous',
    idle: 'Idle',
    completedPomodoros: 'pomodoros completed',
    reset: 'Reset',
    start: 'Start',
    pause: 'Pause',
    skip: 'Skip',
};
export function DashboardTimerWidget({ mode, isRunning, isPaused, timeLeft, completedPomodoros, progress, accentColor = '#6b7280', onToggle, onReset, onSkip, onClick, formatTime, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const modeColor = MODE_COLORS[mode] || accentColor;
    const isIdle = !isRunning && !isPaused;
    const getModeLabel = (m) => {
        switch (m) {
            case 'WORK': return t.work;
            case 'SHORT_BREAK': return t.shortBreak;
            case 'LONG_BREAK': return t.longBreak;
            case 'CONTINUOUS': return t.continuous;
            default: return isIdle ? t.idle : m;
        }
    };
    return (_jsxs("div", { className: cn('group relative overflow-hidden rounded-2xl border-2 bg-card p-6 transition-all duration-300 cursor-pointer', 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20'), style: { borderColor: modeColor, transition: 'border-color 0.5s' }, onClick: onClick, children: [_jsx("div", { className: "absolute inset-0 opacity-10 transition-all duration-1000 ease-linear", style: {
                    background: `linear-gradient(90deg, ${modeColor} ${progress}%, transparent ${progress}%)`,
                } }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl", style: { backgroundColor: `${modeColor}20`, color: modeColor }, children: _jsx(Timer, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: getModeLabel(mode) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [completedPomodoros, " ", t.completedPomodoros] })] })] }) }), _jsx("div", { className: "text-center mb-4", children: _jsx("p", { className: "text-5xl font-bold font-mono tracking-wider transition-colors duration-300", style: { color: isRunning ? modeColor : undefined }, children: formatTime(timeLeft) }) }), _jsxs("div", { className: "flex items-center justify-center gap-2", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: onReset, disabled: isIdle, className: cn('h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200', isIdle ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'), title: t.reset, children: _jsx(RotateCcw, { className: "h-4 w-4" }) }), _jsx("button", { onClick: onToggle, className: "h-12 w-24 flex items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95", style: {
                                    backgroundColor: modeColor,
                                    boxShadow: `0 4px 14px -3px ${modeColor}60`,
                                }, title: isRunning && !isPaused ? t.pause : t.start, children: isRunning && !isPaused ? (_jsx(Pause, { className: "h-5 w-5" })) : (_jsx(Play, { className: "h-5 w-5 ml-1" })) }), _jsx("button", { onClick: onSkip, disabled: !isRunning, className: cn('h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-background transition-all duration-200', !isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'), title: t.skip, children: _jsx(SkipForward, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "flex items-center justify-center gap-2 mt-4", children: ['WORK', 'SHORT_BREAK', 'LONG_BREAK'].map((m) => (_jsx("div", { className: cn('h-2 w-2 rounded-full transition-all duration-300', mode === m ? 'scale-125' : 'opacity-30'), style: {
                                backgroundColor: MODE_COLORS[m] || '#6b7280',
                            } }, m))) })] })] }));
}
