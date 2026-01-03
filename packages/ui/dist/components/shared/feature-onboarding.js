import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowRight, X, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button.js";
import { cn } from "../../utils/index.js";
export function FeatureOnboarding({ steps, isOpen, currentStep, onNext, onSkip, skipText = "Skip", nextText = "Next", getStartedText = "Get Started", }) {
    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    if (!isOpen || !step)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300", children: _jsxs("div", { className: "relative w-full max-w-lg mx-4 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-10", children: [_jsx("button", { onClick: onSkip, className: "absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10", children: _jsx(X, { className: "h-5 w-5 text-muted-foreground" }) }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsxs("div", { className: "relative mb-6 animate-in zoom-in delay-150 duration-500", children: [_jsx("div", { className: "absolute inset-0 rounded-full blur-2xl opacity-30", style: { backgroundColor: step.color } }), _jsx("div", { className: "relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-500 hover:scale-105", style: {
                                                backgroundColor: step.color,
                                                boxShadow: `0 20px 40px -10px ${step.color}60`,
                                            }, children: _jsx(step.icon, { className: "h-12 w-12" }) })] }), _jsx("h2", { className: "text-2xl font-bold mb-3 animate-in slide-in-from-bottom-2 fade-in delay-200 duration-500", children: step.title }), _jsx("p", { className: "text-muted-foreground max-w-sm animate-in slide-in-from-bottom-2 fade-in delay-300 duration-500", children: step.description })] }), _jsx("div", { className: "flex items-center justify-center gap-2 mt-8", children: steps.map((_, index) => (_jsx("div", { className: cn("h-2 rounded-full transition-all duration-300", index === currentStep ? "w-6" : "w-2"), style: {
                                    backgroundColor: index <= currentStep ? step.color : "var(--muted)",
                                    opacity: index <= currentStep ? 1 : 0.3
                                } }, index))) }), _jsxs("div", { className: "flex items-center justify-between mt-8 animate-in slide-in-from-bottom-4 fade-in delay-500 duration-500", children: [_jsx("button", { onClick: onSkip, className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: skipText }), _jsx(Button, { onClick: onNext, className: "flex items-center gap-2 px-6 rounded-xl transition-all hover:scale-105 active:scale-95", style: { backgroundColor: step.color }, children: isLastStep ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), getStartedText] })) : (_jsxs(_Fragment, { children: [nextText, _jsx(ArrowRight, { className: "h-4 w-4" })] })) })] })] })] }) }));
}
