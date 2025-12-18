'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
const DEFAULT_LABELS = {
    trigger: 'Generate Report',
    title: 'Generate AI Report',
    description: 'Our AI will analyze your productivity data and generate a personalized weekly report.',
    includes: {
        title: 'Your report will include:',
        metrics: 'Weekly productivity metrics and trends',
        strengths: 'Your strengths and achievements',
        recommendations: 'Personalized recommendations',
        patterns: 'Work pattern analysis',
        score: 'Focus score and improvement tips',
    },
    buttons: {
        cancel: 'Cancel',
        generate: 'Generate Report',
        close: 'Close',
        retry: 'Try Again',
    },
    loading: {
        title: 'Generating your report...',
        description: 'This may take a few seconds',
    },
    success: {
        title: 'Report Generated!',
        description: 'Your weekly report is ready to view.',
    },
    error: 'Failed to generate report. Please try again.',
};
export function GenerateReportDialog({ onGenerate, onSuccess, trigger, isPending = false, isSuccess = false, isError = false, onReset, labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        includes: { ...DEFAULT_LABELS.includes, ...labels.includes },
        buttons: { ...DEFAULT_LABELS.buttons, ...labels.buttons },
        loading: { ...DEFAULT_LABELS.loading, ...labels.loading },
        success: { ...DEFAULT_LABELS.success, ...labels.success },
    };
    const [open, setOpen] = useState(false);
    const [internalPending, setInternalPending] = useState(false);
    const [internalSuccess, setInternalSuccess] = useState(false);
    const [internalError, setInternalError] = useState(false);
    // Use external state if provided, otherwise internal
    const loading = isPending || internalPending;
    const success = isSuccess || internalSuccess;
    const error = isError || internalError;
    const handleGenerate = async () => {
        if (!onGenerate)
            return;
        setInternalPending(true);
        setInternalError(false);
        try {
            const result = await onGenerate();
            setInternalPending(false);
            setInternalSuccess(true);
            onSuccess?.(result);
            setTimeout(() => {
                setOpen(false);
                setInternalSuccess(false);
                onReset?.();
            }, 2000);
        }
        catch (err) {
            console.error('Failed to generate report:', err);
            setInternalPending(false);
            setInternalError(true);
        }
    };
    const handleClose = () => {
        setOpen(false);
        setInternalPending(false);
        setInternalSuccess(false);
        setInternalError(false);
        onReset?.();
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: setOpen, children: [_jsx(DialogTrigger, { asChild: true, children: trigger || (_jsxs(Button, { className: "gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4" }), t.trigger] })) }), _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "h-5 w-5 text-primary" }), t.title] }), _jsx(DialogDescription, { children: t.description })] }), _jsxs("div", { className: "space-y-4 py-4", children: [!loading && !success && !error && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-3 text-sm text-muted-foreground", children: [_jsx("p", { children: t.includes.title }), _jsxs("ul", { className: "space-y-2 ml-4", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-primary mt-0.5", children: "\u2022" }), _jsx("span", { children: t.includes.metrics })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-primary mt-0.5", children: "\u2022" }), _jsx("span", { children: t.includes.strengths })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-primary mt-0.5", children: "\u2022" }), _jsx("span", { children: t.includes.recommendations })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-primary mt-0.5", children: "\u2022" }), _jsx("span", { children: t.includes.patterns })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-primary mt-0.5", children: "\u2022" }), _jsx("span", { children: t.includes.score })] })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: handleClose, children: t.buttons.cancel }), _jsxs(Button, { onClick: handleGenerate, className: "gap-2", children: [_jsx(Sparkles, { className: "h-4 w-4" }), t.buttons.generate] })] })] })), loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 space-y-4", children: [_jsx(Loader2, { className: "h-12 w-12 animate-spin text-primary" }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("p", { className: "font-medium", children: t.loading.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.loading.description })] })] })), success && (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 space-y-4", children: [_jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20", children: _jsx(CheckCircle2, { className: "h-10 w-10 text-green-600" }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("p", { className: "font-medium text-green-600", children: t.success.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.success.description })] })] })), error && (_jsxs("div", { className: "rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4", children: [_jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: t.error }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx(Button, { variant: "outline", onClick: handleClose, children: t.buttons.close }), _jsx(Button, { onClick: handleGenerate, variant: "destructive", className: "gap-2", children: t.buttons.retry })] })] }))] })] })] }));
}
