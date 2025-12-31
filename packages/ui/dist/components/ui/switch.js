import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../../utils/index.js";
const Switch = React.forwardRef(({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (_jsxs("button", { type: "button", role: "switch", "aria-checked": checked, className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50", checked ? "bg-primary" : "bg-input", className), onClick: () => onCheckedChange?.(!checked), children: [_jsx("span", { className: cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform", checked ? "translate-x-5" : "translate-x-0") }), _jsx("input", { ref: ref, type: "checkbox", checked: checked, onChange: (e) => onCheckedChange?.(e.target.checked), className: "sr-only", ...props })] }));
});
Switch.displayName = "Switch";
export { Switch };
