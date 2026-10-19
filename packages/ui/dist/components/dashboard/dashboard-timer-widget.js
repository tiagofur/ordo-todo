import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Play, Pause, Square, SkipForward, Target, Maximize2, ChevronsUpDown, Coffee, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
import { TomatoIcon } from '../ui/custom-icons.js';
const MODE_COLORS = {
    WORK: '#f43f5e',
    POMODORO: '#f43f5e',
    SHORT_BREAK: '#10b981',
    LONG_BREAK: '#0d9488',
    CONTINUOUS: '#3b82f6',
    STOPWATCH: '#3b82f6',
};
const DEFAULT_LABELS = {
    work: 'Enfoque',
    shortBreak: 'Pausa Corta',
    longBreak: 'Pausa Larga',
    continuous: 'Continuo',
    freeFlow: 'Libre',
    idle: 'Inactivo',
    completedPomodoros: 'pomodoros completados',
    reset: 'Reiniciar',
    start: 'Iniciar',
    pause: 'Pausar',
    skip: 'Saltar',
    paused: 'En Pausa',
    focusMode: 'Modo Enfoque',
    assignedTask: 'TAREA ASIGNADA',
    selectTaskPlaceholder: 'Seleccionar tarea para trabajar...',
    pomodoroCount: (count) => `Pomodoro #${count}`,
    pauseCount: (count) => `${count} pausa${count !== 1 ? 's' : ''}`,
};
export function DashboardTimerWidget({ mode, isRunning, isPaused, timeLeft, completedPomodoros, progress, pauseCount = 0, accentColor: customAccentColor, onToggle, onReset, onSkip, onClick, onFocusModeClick, TaskSelectorComponent, taskTitle, config, formatTime, className, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const activeModeColor = MODE_COLORS[mode] || customAccentColor || '#f43f5e';
    const isActiveRun = isRunning && !isPaused;
    const isContinuous = mode === 'CONTINUOUS' || mode === 'STOPWATCH';
    const clampedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
    const getModeLabel = () => {
        if (mode === 'CONTINUOUS' || mode === 'STOPWATCH')
            return t.continuous;
        if (mode === 'WORK' || mode === 'POMODORO')
            return t.pomodoroCount(completedPomodoros + 1);
        if (mode === 'SHORT_BREAK')
            return t.shortBreak;
        if (mode === 'LONG_BREAK')
            return t.longBreak;
        return mode;
    };
    return (_jsxs(motion.div, { whileHover: {
            y: -2,
            borderColor: `${activeModeColor}60`,
            boxShadow: `0 12px 28px -6px ${activeModeColor}20`,
        }, className: cn('group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card text-card-foreground backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between shadow-xs h-full cursor-pointer gap-3', className), onClick: onClick, children: [_jsx("div", { className: "pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl opacity-15 transition-colors duration-500", style: { backgroundColor: activeModeColor } }), _jsxs("div", { className: "relative z-10 flex items-center justify-between gap-2 w-full", children: [_jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [_jsx("div", { className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border shadow-2xs shrink-0 select-none", style: {
                                    borderColor: `${activeModeColor}40`,
                                    backgroundColor: `${activeModeColor}15`,
                                    color: activeModeColor,
                                }, title: getModeLabel(), "aria-label": getModeLabel(), children: mode === 'WORK' || mode === 'POMODORO' ? (_jsxs(_Fragment, { children: [_jsx(TomatoIcon, { className: cn('h-3.5 w-3.5 shrink-0', isActiveRun ? 'animate-pulse' : '') }), _jsxs("span", { className: "font-semibold tabular-nums text-xs", children: ["#", completedPomodoros + 1] })] })) : mode === 'SHORT_BREAK' || mode === 'LONG_BREAK' ? (_jsxs(_Fragment, { children: [_jsx(Coffee, { className: "h-3.5 w-3.5 shrink-0" }), _jsx("span", { className: "text-xs truncate", children: mode === 'SHORT_BREAK' ? t.shortBreak : t.longBreak })] })) : mode === 'CONTINUOUS' || mode === 'STOPWATCH' ? (_jsxs(_Fragment, { children: [_jsx(Timer, { className: "h-3.5 w-3.5 shrink-0" }), _jsx("span", { className: "text-xs truncate", children: t.continuous })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: cn('h-1.5 w-1.5 rounded-full shrink-0', isActiveRun ? 'animate-pulse' : ''), style: { backgroundColor: activeModeColor } }), _jsx("span", { className: "truncate", children: getModeLabel() })] })) }), isPaused && (_jsx("span", { className: "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse shrink-0", children: t.paused })), isRunning && pauseCount > 0 && (_jsx("span", { className: "text-[10px] text-muted-foreground tabular-nums shrink-0 hidden sm:inline", children: t.pauseCount(pauseCount) }))] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", onClick: (e) => e.stopPropagation(), children: [isContinuous ? (_jsxs("div", { className: "flex items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 text-[10px] font-semibold gap-1 select-none", children: [_jsx("span", { className: "font-mono text-xs leading-none", children: "\u221E" }), _jsx("span", { children: t.freeFlow })] })) : (_jsxs("div", { className: "flex items-center bg-muted/40 px-1.5 py-0.5 rounded-lg border border-border/40 text-[10px] font-semibold text-muted-foreground gap-1 select-none", children: [_jsxs("span", { className: cn('px-1 py-0.5 rounded transition-colors', mode === 'WORK' || mode === 'POMODORO'
                                            ? 'text-rose-500 font-bold bg-rose-500/10'
                                            : 'opacity-60'), title: t.work, children: [config?.workDuration || 25, "m"] }), _jsx("span", { className: "opacity-30", children: "\u2022" }), _jsxs("span", { className: cn('px-1 py-0.5 rounded transition-colors', mode === 'SHORT_BREAK'
                                            ? 'text-emerald-500 font-bold bg-emerald-500/10'
                                            : 'opacity-60'), title: t.shortBreak, children: [config?.shortBreakDuration || 5, "m"] }), _jsx("span", { className: "opacity-30", children: "\u2022" }), _jsxs("span", { className: cn('px-1 py-0.5 rounded transition-colors', mode === 'LONG_BREAK'
                                            ? 'text-teal-500 font-bold bg-teal-500/10'
                                            : 'opacity-60'), title: t.longBreak, children: [config?.longBreakDuration || 15, "m"] })] })), onFocusModeClick && (_jsx("button", { type: "button", onClick: onFocusModeClick, className: "h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer", title: t.focusMode, "aria-label": t.focusMode, children: _jsx(Maximize2, { className: "h-3.5 w-3.5" }) }))] })] }), _jsxs("div", { className: "relative z-10 flex items-center justify-between gap-3 my-0.5", children: [_jsx("span", { className: "text-3.5xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums text-foreground leading-none", children: formatTime(timeLeft) }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", onClick: (e) => e.stopPropagation(), children: [(isRunning || isPaused) && (_jsxs("div", { className: "flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200", children: [_jsx("button", { type: "button", onClick: onReset, className: "flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs", title: t.reset, "aria-label": t.reset, children: _jsx(Square, { className: "h-3.5 w-3.5" }) }), (mode === 'WORK' || mode === 'POMODORO') && (_jsx("button", { type: "button", onClick: onSkip, className: "flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-2xs", title: t.skip, "aria-label": t.skip, children: _jsx(SkipForward, { className: "h-3.5 w-3.5" }) }))] })), _jsx("button", { type: "button", onClick: onToggle, className: "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0", style: {
                                    backgroundColor: activeModeColor,
                                    boxShadow: `0 8px 20px -4px ${activeModeColor}60`,
                                }, title: isActiveRun ? t.pause : t.start, "aria-label": isActiveRun ? t.pause : t.start, children: isActiveRun ? (_jsx(Pause, { className: "h-5 w-5 fill-current" })) : (_jsx(Play, { className: "h-5 w-5 fill-current ml-0.5" })) })] })] }), _jsxs("div", { className: "relative z-10 flex items-center gap-2.5 w-full", children: [_jsx("div", { className: "flex-1 h-2 rounded-full bg-muted/50 overflow-hidden relative border border-border/30", children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-500 ease-out', isContinuous && isActiveRun ? 'animate-pulse' : ''), style: {
                                width: isContinuous ? '100%' : `${clampedProgress}%`,
                                backgroundColor: activeModeColor,
                                boxShadow: `0 0 10px ${activeModeColor}${isActiveRun ? '80' : '20'}`,
                                opacity: isContinuous && !isActiveRun ? 0.35 : 1,
                            } }) }), _jsx("span", { className: "text-xs font-semibold tabular-nums text-muted-foreground shrink-0 min-w-[28px] text-right font-mono", children: isContinuous ? '∞' : `${Math.round(clampedProgress)}%` })] }), _jsxs("div", { className: "relative z-10 pt-2 border-t border-border/50 space-y-1.5", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "flex items-center justify-between text-[10px] font-semibold text-muted-foreground tracking-wider uppercase", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Target, { className: "h-3 w-3 text-muted-foreground" }), _jsx("span", { children: t.assignedTask })] }) }), _jsx("div", { className: "w-full", children: TaskSelectorComponent ? (TaskSelectorComponent) : (_jsxs("button", { type: "button", onClick: onClick, className: "flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer", children: [_jsx("span", { className: "truncate", children: taskTitle || t.selectTaskPlaceholder }), _jsx(ChevronsUpDown, { className: "h-3.5 w-3.5 opacity-50 shrink-0" })] })) })] })] }));
}
