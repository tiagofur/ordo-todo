import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@ordo-todo/ui";
// Create a loading component
const LoadingSpinner = () => (_jsx(Card, { className: "min-h-[400px] flex items-center justify-center", children: _jsxs(CardContent, { className: "flex flex-col items-center gap-4", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Cargando..." })] }) }));
// Lazy loading wrapper
export function LazyLoad(factory, fallback) {
    const LazyComponent = lazy(factory);
    const LazyWrapper = (props) => (_jsx(Suspense, { fallback: fallback || _jsx(LoadingSpinner, {}), children: _jsx(LazyComponent, { ...props }) }));
    LazyWrapper.displayName = 'LazyWrapper';
    return LazyWrapper;
}
// Preload component (for critical paths)
export function preloadComponent(factory) {
    factory();
}
