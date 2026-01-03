import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/index.js';
export function ProgressRing({ progress, size = 120, strokeWidth = 8, color = '#10B981', backgroundColor = 'currentColor', // Changed default to generic
showLabel = true, animate = true, className, children, }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    return (_jsxs("div", { className: cn('relative inline-flex items-center justify-center', className), children: [_jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, stroke: backgroundColor, className: "text-muted/20" }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, stroke: color, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: {
                            transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none',
                        } })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: children ? (children) : showLabel ? (_jsx("div", { className: cn("text-center", animate && "animate-in zoom-in fade-in duration-500 delay-500"), children: _jsxs("span", { className: "text-2xl font-bold", children: [Math.round(progress), "%"] }) })) : null })] }));
}
export function DailyProgress({ completed, total, color = '#10B981', }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = completed === total && total > 0;
    return (_jsxs("div", { className: "relative", children: [_jsx(ProgressRing, { progress: percentage, size: 100, strokeWidth: 6, color: isComplete ? '#10B981' : color, animate: true, children: _jsxs("div", { className: "text-center animate-in zoom-in duration-500", children: [_jsxs("div", { className: "text-lg font-bold", children: [completed, "/", total] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "today" })] }) }), isComplete && (_jsx("div", { className: "absolute inset-0 rounded-full animate-ping", style: {
                    border: `2px solid ${color}`,
                    opacity: 0.5
                } }))] }));
}
export function MiniProgressBar({ progress, color = '#10B981', height = 4, className, }) {
    return (_jsx("div", { className: cn('w-full rounded-full overflow-hidden bg-muted/50', className), style: { height }, children: _jsx("div", { className: "h-full rounded-full transition-all duration-500 ease-out", style: {
                width: `${Math.min(100, progress)}%`,
                backgroundColor: color
            } }) }));
}
