import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, Play } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { TomatoIcon } from '../ui/custom-icons.js';
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
 * TimerWidget - Compact timer display for sidebar/navigation
 *
 * Platform-agnostic component. Navigation and timer state are passed via props.
 *
 * @example
 * // In web app with router
 * const { isRunning, timeLeft, mode } = useTimer();
 *
 * <TimerWidget
 *   isRunning={isRunning}
 *   timeLeft={timeLeft}
 *   mode={mode}
 *   isActive={pathname === '/timer'}
 *   onClick={() => router.push('/timer')}
 *   labels={{ startTimer: t('startTimer') }}
 * />
 */
export function TimerWidget({ isRunning, timeLeft, mode, defaultMode = 'POMODORO', isActive = false, onClick, labels = {}, className = '', }) {
    const { startTimer = 'Start Timer' } = labels;
    const getThemeClasses = () => {
        if (!isActive && !isRunning) {
            return 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground';
        }
        const colorKey = {
            WORK: 'red',
            SHORT_BREAK: 'green-light',
            LONG_BREAK: 'green-dark',
            CONTINUOUS: 'blue',
        }[mode] || 'blue';
        if (isActive) {
            // Replaced shadow transparencies with standard active states or solid borders if necessary
            // For now using solid backgrounds which is consistent with active states
            const activeClasses = {
                red: 'bg-red-500 text-white',
                'green-light': 'bg-green-400 text-white',
                'green-dark': 'bg-green-800 text-white',
                blue: 'bg-blue-500 text-white',
            };
            return activeClasses[colorKey];
        }
        // isRunning
        // Replaced transparencies like /70 with solid colors
        const runningClasses = {
            red: 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900',
            'green-light': 'border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900',
            'green-dark': 'border border-green-700 bg-green-100 text-green-900 hover:bg-green-200 dark:border-green-600 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
            blue: 'border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900',
        };
        return runningClasses[colorKey];
    };
    const content = (_jsxs(_Fragment, { children: [isRunning ? (_jsx(Play, { className: "h-4 w-4" })) : defaultMode === 'POMODORO' ? (_jsx(TomatoIcon, { className: "h-4 w-4" })) : (_jsx(Clock, { className: "h-4 w-4" })), _jsx("div", { className: "flex-1", children: isRunning ? (_jsx("div", { className: "font-medium tabular-nums", children: formatTime(timeLeft) })) : (_jsx("span", { children: startTimer })) })] }));
    return (_jsx("div", { className: "animate-in fade-in duration-200", children: _jsx("button", { onClick: onClick, className: cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 w-full', getThemeClasses(), className), children: content }) }));
}
