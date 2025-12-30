'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '../../utils/index.js';
const DEFAULT_LABELS = {
    day: 'day',
    days: 'days',
};
export function StreakBadge({ streak, size = 'md', showLabel = true, animate = true, className, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    if (streak <= 0)
        return null;
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-3 py-1 gap-1.5',
        lg: 'text-base px-4 py-2 gap-2',
    };
    const iconSizes = {
        sm: 12,
        md: 16,
        lg: 20,
    };
    // Determine streak tier for styling
    const getTier = (s) => {
        if (s >= 100)
            return 'legendary';
        if (s >= 30)
            return 'epic';
        if (s >= 7)
            return 'rare';
        return 'common';
    };
    const tier = getTier(streak);
    const tierStyles = {
        common: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            glow: 'shadow-amber-500/20',
        },
        rare: {
            bg: 'bg-orange-500/10',
            text: 'text-orange-500',
            glow: 'shadow-orange-500/30',
        },
        epic: {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            glow: 'shadow-red-500/40',
        },
        legendary: {
            bg: 'bg-gradient-to-r from-amber-500/20 via-red-500/20 to-purple-500/20',
            text: 'text-transparent bg-gradient-to-r from-amber-500 via-red-500 to-purple-500 bg-clip-text',
            glow: 'shadow-red-500/50',
        },
    };
    const style = tierStyles[tier];
    return (_jsxs(motion.div, { initial: animate ? { scale: 0.8, opacity: 0 } : false, animate: animate ? { scale: 1, opacity: 1 } : false, whileHover: animate ? { scale: 1.05 } : undefined, className: cn('inline-flex items-center rounded-full font-semibold', sizeClasses[size], style.bg, animate && tier !== 'common' && `shadow-lg ${style.glow}`, className), children: [_jsx(motion.div, { animate: animate && tier !== 'common'
                    ? {
                        rotate: [-5, 5, -5],
                        scale: [1, 1.1, 1],
                    }
                    : {}, transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }, children: _jsx(Flame, { size: iconSizes[size], className: cn(tier === 'legendary' ? 'text-red-500' : style.text), fill: tier === 'legendary' ? 'url(#flameGradient)' : 'currentColor' }) }), _jsx("span", { className: cn('font-bold', style.text), children: streak }), showLabel && size !== 'sm' && (_jsx("span", { className: cn('opacity-70', style.text), children: streak === 1 ? t.day : t.days })), tier === 'legendary' && (_jsx("svg", { width: "0", height: "0", className: "absolute", children: _jsx("defs", { children: _jsxs("linearGradient", { id: "flameGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#fbbf24" }), _jsx("stop", { offset: "50%", stopColor: "#ef4444" }), _jsx("stop", { offset: "100%", stopColor: "#a855f7" })] }) }) }))] }));
}
export function StreakCounter({ from, to, duration = 1, onComplete, }) {
    return (_jsxs(motion.div, { className: "flex items-center gap-2", initial: { scale: 0.8 }, animate: { scale: 1 }, onAnimationComplete: onComplete, children: [_jsx(motion.div, { animate: {
                    rotate: [-10, 10, -10],
                    scale: [1, 1.2, 1],
                }, transition: {
                    duration: 0.3,
                    repeat: 3,
                    repeatType: 'reverse',
                }, children: _jsx(Flame, { className: "h-8 w-8 text-amber-500", fill: "#f59e0b" }) }), _jsx(motion.span, { className: "text-3xl font-bold text-amber-500", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, children: to })] }));
}
