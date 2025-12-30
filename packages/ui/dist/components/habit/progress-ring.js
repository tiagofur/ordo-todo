'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';
export function ProgressRing({ progress, size = 120, strokeWidth = 8, color = '#10B981', backgroundColor = 'currentColor', // Changed default to generic
showLabel = true, animate = true, className, children, }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    return (_jsxs("div", { className: cn('relative inline-flex items-center justify-center', className), children: [_jsxs("svg", { width: size, height: size, className: "-rotate-90", children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, stroke: backgroundColor, className: "opacity-10 text-muted-foreground" // Use text-muted-foreground via class
                     }), _jsx(motion.circle, { cx: size / 2, cy: size / 2, r: radius, fill: "none", strokeWidth: strokeWidth, stroke: color, strokeLinecap: "round", strokeDasharray: circumference, initial: animate
                            ? { strokeDashoffset: circumference }
                            : { strokeDashoffset: offset }, animate: { strokeDashoffset: offset }, transition: {
                            duration: animate ? 1 : 0,
                            ease: 'easeOut',
                        }, style: {
                            filter: `drop-shadow(0 0 6px ${color}40)`,
                        } })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: children ? (children) : showLabel ? (_jsx(motion.div, { initial: animate ? { scale: 0.8, opacity: 0 } : false, animate: { scale: 1, opacity: 1 }, transition: { delay: animate ? 0.5 : 0 }, className: "text-center", children: _jsxs("span", { className: "text-2xl font-bold", children: [Math.round(progress), "%"] }) })) : null })] }));
}
export function DailyProgress({ completed, total, color = '#10B981', }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = completed === total && total > 0;
    return (_jsxs("div", { className: "relative", children: [_jsx(ProgressRing, { progress: percentage, size: 100, strokeWidth: 6, color: isComplete ? '#10B981' : color, animate: true, children: _jsxs("div", { className: "text-center", children: [_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: 'spring', damping: 15, delay: 0.3 }, className: "text-lg font-bold", children: [completed, "/", total] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "today" })] }) }), isComplete && (_jsx(motion.div, { initial: { scale: 1, opacity: 0.5 }, animate: { scale: 1.5, opacity: 0 }, transition: {
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'loop',
                }, className: "absolute inset-0 rounded-full", style: {
                    border: `2px solid ${color}`,
                } }))] }));
}
export function MiniProgressBar({ progress, color = '#10B981', height = 4, className, }) {
    return (_jsx("div", { className: cn('w-full rounded-full overflow-hidden bg-muted/50', className), style: { height }, children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${Math.min(100, progress)}%` }, transition: { duration: 0.5, ease: 'easeOut' }, className: "h-full rounded-full", style: { backgroundColor: color } }) }));
}
