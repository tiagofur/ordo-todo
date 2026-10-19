import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Play, Pause, Square, SkipForward, RefreshCw, Maximize2, LayoutList, CircleDot } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../ui/dialog.js';
import { cn } from '../../utils/index.js';
const MODE_COLORS = {
    WORK: '#f43f5e',
    SHORT_BREAK: '#10b981',
    LONG_BREAK: '#0d9488',
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
 * Supports both horizontal Apple-grade cockpit layout (compact, no scrolling needed)
 * and classic circular SVG ring layout.
 */
export function PomodoroTimer({ state, actions, TaskSelectorComponent, onFocusModeClick, labels = {}, showSwitchDialog = false, setShowSwitchDialog, variant, allowVariantToggle = true, }) {
    const [internalVariant, setInternalVariant] = useState(variant || 'horizontal');
    const activeVariant = variant !== undefined ? variant : internalVariant;
    const { isLoaded, isRunning, isPaused, timeLeft, mode, completedPomodoros, pauseCount, defaultMode, progress, } = state;
    const { start, pause, resume, stop, skipToNext } = actions;
    const { stopwatch = 'Cronómetro', pomodoroCount = (count) => `Pomodoro ${count}`, shortBreak = 'Descanso Corto', longBreak = 'Descanso Largo', paused = 'En Pausa', pauseCount: pauseCountLabel = (count) => `${count} pausa${count !== 1 ? 's' : ''}`, switchTaskTitle = 'Cambiar Tarea', switchTaskDescription = 'Selecciona una tarea diferente para registrar tiempo.', switchTaskButtonTitle = 'Cambiar tarea', enterFocusMode = 'Modo Enfoque', currentTask = 'Tarea Asignada', horizontalView = 'Vista Horizontal', circularView = 'Vista Circular', } = labels;
    const accentColor = MODE_COLORS[mode] || '#f43f5e';
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
    // Horizontal Cockpit (Apple-grade, compact, minimal vertical height)
    if (activeVariant === 'horizontal') {
        return (_jsxs("div", { className: "relative w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/95 via-card/85 to-card p-5 sm:p-6 shadow-xs backdrop-blur-xs transition-all duration-300", children: [_jsx("div", { className: "pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-15", style: { backgroundColor: accentColor } }), _jsxs("div", { className: "relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6", children: [_jsxs("div", { className: "flex-1 min-w-0 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border shadow-2xs", style: {
                                                borderColor: `${accentColor}40`,
                                                backgroundColor: `${accentColor}15`,
                                                color: accentColor,
                                            }, children: [_jsx("span", { className: cn("h-2 w-2 rounded-full", isRunning && !isPaused ? "animate-pulse" : ""), style: { backgroundColor: accentColor } }), _jsx("span", { children: getModeLabel() })] }), isPaused && (_jsx("span", { className: "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse", children: paused })), isRunning && pauseCount > 0 && (_jsx("span", { className: "text-xs text-muted-foreground", children: pauseCountLabel(pauseCount) }))] }), _jsxs("div", { className: "flex items-baseline gap-3 my-0.5", children: [_jsx("h1", { className: "text-5xl sm:text-6xl font-bold font-mono tracking-tight tabular-nums text-foreground leading-none", children: formatTime(timeLeft) }), _jsxs("span", { className: "text-sm font-medium text-muted-foreground tabular-nums", children: [Math.round(progress), "%"] })] }), _jsx("div", { className: "space-y-1.5 w-full max-w-md", children: _jsx("div", { className: "h-2.5 w-full rounded-full bg-muted/50 overflow-hidden relative border border-border/30", children: _jsx("div", { className: "h-full rounded-full transition-all duration-500 ease-out", style: {
                                                width: `${Math.min(100, Math.max(0, progress))}%`,
                                                backgroundColor: accentColor,
                                                boxShadow: `0 0 10px ${accentColor}80`,
                                            } }) }) })] }), _jsxs("div", { className: "flex items-center justify-center lg:justify-start gap-3 sm:gap-4 shrink-0 py-1", children: [_jsx("button", { onClick: handlePlayPause, className: "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0", style: {
                                        backgroundColor: accentColor,
                                        boxShadow: `0 8px 24px -4px ${accentColor}60`,
                                    }, title: isRunning && !isPaused ? "Pausar" : "Iniciar", children: isRunning && !isPaused ? (_jsx(Pause, { className: "h-6 w-6 sm:h-7 sm:w-7" })) : (_jsx(Play, { className: "h-6 w-6 sm:h-7 sm:w-7 ml-0.5" })) }), (isRunning || isPaused) && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => stop(false), className: "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs", title: "Detener", children: _jsx(Square, { className: "h-4 w-4 sm:h-4.5 sm:w-4.5" }) }), defaultMode === 'POMODORO' && (_jsx("button", { onClick: skipToNext, className: "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs", title: "Saltar al siguiente bloque", children: _jsx(SkipForward, { className: "h-4 w-4 sm:h-4.5 sm:w-4.5" }) })), _jsx("button", { onClick: () => setShowSwitchDialog?.(true), className: "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95 cursor-pointer bg-card/80 shadow-xs", title: switchTaskButtonTitle, children: _jsx(RefreshCw, { className: "h-4 w-4 sm:h-4.5 sm:w-4.5" }) })] }))] }), TaskSelectorComponent && (_jsxs("div", { className: "w-full lg:w-72 xl:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-xs font-semibold text-muted-foreground tracking-wider uppercase", children: currentTask }), _jsxs("div", { className: "flex items-center gap-2", children: [allowVariantToggle && (_jsxs("button", { onClick: () => setInternalVariant('circular'), className: "text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer p-1 rounded-lg hover:bg-muted/50", title: circularView, children: [_jsx(CircleDot, { className: "h-3.5 w-3.5" }), _jsx("span", { className: "sr-only", children: "Circular" })] })), onFocusModeClick && (_jsxs("button", { onClick: onFocusModeClick, title: enterFocusMode, className: "text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer p-1 rounded-lg hover:bg-muted/50", children: [_jsx(Maximize2, { className: "h-3.5 w-3.5" }), _jsx("span", { children: "Enfoque" })] }))] })] }), _jsx("div", { className: "w-full", children: TaskSelectorComponent })] }))] }), _jsx(Dialog, { open: showSwitchDialog, onOpenChange: setShowSwitchDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: switchTaskTitle }), _jsx(DialogDescription, { children: switchTaskDescription })] }), _jsx("div", { className: "py-4", children: TaskSelectorComponent })] }) })] }));
    }
    // Circular Layout (Classic Mode)
    return (_jsxs("div", { className: "w-full max-w-lg mx-auto flex flex-col items-center gap-8 relative", children: [_jsxs("div", { className: "absolute top-0 right-0 flex items-center gap-2", children: [allowVariantToggle && (_jsx("button", { onClick: () => setInternalVariant('horizontal'), title: horizontalView, className: "p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors", children: _jsx(LayoutList, { className: "w-5 h-5" }) })), onFocusModeClick && (_jsx("button", { onClick: onFocusModeClick, title: enterFocusMode, className: "p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors", children: _jsx(Maximize2, { className: "w-5 h-5" }) }))] }), _jsxs("div", { className: "text-center w-full max-w-sm", children: [_jsx("p", { className: "font-semibold text-lg mb-4 transition-colors duration-300 animate-in fade-in", style: { color: accentColor }, children: getModeLabel() }), TaskSelectorComponent, isRunning && pauseCount > 0 && (_jsx("div", { className: "mt-3 text-xs text-muted-foreground flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2", children: _jsx("span", { children: pauseCountLabel(pauseCount) }) }))] }), _jsxs("div", { className: "relative animate-in zoom-in fade-in duration-500", children: [_jsxs("svg", { className: "h-80 w-80 -rotate-90 transform transition-rotate duration-500", children: [_jsx("circle", { cx: "160", cy: "160", r: "150", stroke: "currentColor", strokeWidth: "10", fill: "none", className: "text-muted/20" }), _jsx("circle", { cx: "160", cy: "160", r: "150", strokeWidth: "10", fill: "none", strokeDasharray: `${2 * Math.PI * 150}`, style: {
                                    stroke: accentColor,
                                    strokeDashoffset: `${2 * Math.PI * 150 * (1 - progress / 100)}`,
                                    transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                                }, strokeLinecap: "round" })] }), _jsxs("div", { className: "absolute inset-0 flex items-center justify-center flex-col gap-2", children: [_jsx("h1", { className: "text-7xl font-bold tabular-nums text-foreground", children: formatTime(timeLeft) }), isPaused && (_jsx("span", { className: "text-sm text-muted-foreground animate-pulse", children: paused }))] })] }), _jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsx("button", { onClick: handlePlayPause, className: "flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer", style: {
                            backgroundColor: accentColor,
                            boxShadow: `0 10px 20px -5px ${accentColor}50`,
                        }, children: isRunning && !isPaused ? (_jsx(Pause, { className: "h-8 w-8" })) : (_jsx(Play, { className: "h-8 w-8 ml-1" })) }), (isRunning || isPaused) && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => stop(false), className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer", children: _jsx(Square, { className: "h-6 w-6" }) }), defaultMode === 'POMODORO' && (_jsx("button", { onClick: skipToNext, className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer", children: _jsx(SkipForward, { className: "h-6 w-6" }) })), _jsx("button", { onClick: () => setShowSwitchDialog?.(true), className: "flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted/50 text-muted-foreground hover:border-muted-foreground transition-all duration-300 hover:scale-110 active:scale-95 bg-background cursor-pointer", title: switchTaskButtonTitle, children: _jsx(RefreshCw, { className: "h-6 w-6" }) })] }))] }), _jsx(Dialog, { open: showSwitchDialog, onOpenChange: setShowSwitchDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: switchTaskTitle }), _jsx(DialogDescription, { children: switchTaskDescription })] }), _jsx("div", { className: "py-4", children: TaskSelectorComponent })] }) })] }));
}
