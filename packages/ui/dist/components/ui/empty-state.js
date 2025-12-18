import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "./button.js";
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className = "", }) {
    return (_jsxs("div", { className: `flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed bg-muted/50 ${className}`, children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4", children: _jsx(Icon, { className: "h-6 w-6 text-primary" }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: title }), _jsx("p", { className: "text-sm text-muted-foreground max-w-sm mb-6", children: description }), actionLabel && onAction && (_jsx(Button, { onClick: onAction, variant: "default", children: actionLabel }))] }));
}
