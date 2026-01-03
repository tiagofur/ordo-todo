import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.js';
import { cn } from '../../utils/index.js';
function getColor(score) {
    if (score >= 0.8)
        return 'text-green-600';
    if (score >= 0.5)
        return 'text-yellow-600';
    return 'text-red-600';
}
function getStrokeColor(score) {
    if (score >= 0.8)
        return 'stroke-green-600';
    if (score >= 0.5)
        return 'stroke-yellow-600';
    return 'stroke-red-600';
}
function getBackgroundColor(score) {
    if (score >= 0.8)
        return 'bg-green-50 dark:bg-green-950';
    if (score >= 0.5)
        return 'bg-yellow-50 dark:bg-yellow-950';
    return 'bg-red-50 dark:bg-red-950';
}
/**
 * FocusScoreGauge - Platform-agnostic circular gauge for focus score
 *
 * @example
 * <FocusScoreGauge
 *   score={0.75}
 *   labels={{ label: t('label'), excellent: t('excellent') }}
 * />
 */
export function FocusScoreGauge({ score, labels = {}, className = '', }) {
    const { label = 'Focus Score', description = 'Your concentration level based on work sessions', excellent = 'Excellent!', veryGood = 'Very Good', good = 'Good', moderate = 'Moderate', low = 'Low', needsImprovement = 'Needs Improvement', } = labels;
    const percentage = Math.round(score * 100);
    const getMessage = (score) => {
        if (score >= 0.9)
            return excellent;
        if (score >= 0.8)
            return veryGood;
        if (score >= 0.7)
            return good;
        if (score >= 0.5)
            return moderate;
        if (score >= 0.3)
            return low;
        return needsImprovement;
    };
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - score * circumference;
    return (_jsxs(Card, { className: cn('transition-colors', getBackgroundColor(score), className), children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: label }), _jsx(CardDescription, { children: description })] }), _jsxs(CardContent, { className: "flex flex-col items-center gap-4", children: [_jsxs("div", { className: "relative w-40 h-40", children: [_jsxs("svg", { className: "w-full h-full transform -rotate-90", children: [_jsx("circle", { cx: "80", cy: "80", r: radius, stroke: "currentColor", strokeWidth: "12", fill: "none", className: "text-slate-100 dark:text-slate-800" }), _jsx("circle", { cx: "80", cy: "80", r: radius, stroke: "currentColor", strokeWidth: "12", fill: "none", strokeDasharray: circumference, strokeDashoffset: strokeDashoffset, strokeLinecap: "round", className: cn('transition-all duration-1000 ease-out', getStrokeColor(score)) })] }), _jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: _jsxs("span", { className: cn('text-4xl font-bold', getColor(score)), children: [percentage, "%"] }) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: cn('font-medium', getColor(score)), children: getMessage(score) }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description })] }), _jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-green-600" }), _jsx("span", { children: "80-100%" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-600" }), _jsx("span", { children: "50-79%" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-600" }), _jsx("span", { children: "0-49%" })] })] })] })] }));
}
