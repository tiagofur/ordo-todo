import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
export function LoadingOverlay({ renderLogo, text = 'Processing...', isVisible = true, }) {
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "h-screen", children: _jsxs("div", { className: "\n          flex flex-col justify-center items-center\n          absolute top-0 left-0 w-full h-full gap-4\n          bg-background/95 text-center z-50\n        ", children: [renderLogo ? (renderLogo()) : (_jsx(Loader2, { className: "h-12 w-12 animate-spin text-primary" })), _jsx("span", { className: "font-light text-muted-foreground", children: text })] }) }));
}
const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};
export function LoadingSpinner({ size = 'md', text, className = '', }) {
    return (_jsxs("div", { className: `flex flex-col items-center justify-center gap-2 ${className}`, children: [_jsx(Loader2, { className: `${sizeClasses[size]} animate-spin text-primary` }), text && _jsx("span", { className: "text-sm text-muted-foreground", children: text })] }));
}
