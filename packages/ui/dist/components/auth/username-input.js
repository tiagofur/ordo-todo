import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { cn } from '../../utils/index.js';
export function UsernameInput({ value, onChange, onBlur, placeholder = "Enter your username", disabled = false, required = false, className, label = "Username", id = "username", error: externalError, helperText, isLoading = false, isValid = false, isAvailable = null, validationMessage, suggestions = [], showSuggestions = true, onSuggestionClick, onRefreshSuggestions, }) {
    const [isFocused, setIsFocused] = useState(false);
    const handleUsernameChange = (newValue) => {
        // Force lowercase and valid characters only - UI cleanup only
        const sanitizedValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        onChange(sanitizedValue);
    };
    const getValidationIcon = () => {
        if (isLoading) {
            return _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" });
        }
        if (!value || value.length < 3) {
            return null;
        }
        if (externalError) {
            return _jsx(XCircle, { className: "h-4 w-4 text-destructive" });
        }
        if (isValid && isAvailable === true) {
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        }
        if (isAvailable === false) {
            return _jsx(XCircle, { className: "h-4 w-4 text-destructive" });
        }
        if (value.length >= 3 && !isValid) {
            return _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" });
        }
        return null;
    };
    const getMessage = () => {
        if (externalError) {
            return externalError;
        }
        if (!value) {
            return helperText;
        }
        if (value.length > 0 && value.length < 3) {
            return "Username must be at least 3 characters";
        }
        if (validationMessage && value.length >= 3) {
            return validationMessage;
        }
        return helperText;
    };
    const getValidationColor = () => {
        if (externalError || isAvailable === false) {
            return "text-destructive";
        }
        if (isValid && isAvailable === true) {
            return "text-green-600 dark:text-green-400";
        }
        return "text-muted-foreground";
    };
    return (_jsxs("div", { className: cn("space-y-2", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: id, className: "text-sm font-medium", children: [label, required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] }), getValidationIcon()] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: id, type: "text", value: value, onChange: (e) => handleUsernameChange(e.target.value), onBlur: (e) => {
                            setIsFocused(false);
                            onBlur?.(e.target.value);
                        }, onFocus: () => setIsFocused(true), placeholder: placeholder, disabled: disabled, className: cn("pr-10", externalError && "border-destructive focus:border-destructive", isAvailable === false && "border-destructive focus:border-destructive", isValid && isAvailable === true && "border-green-500 focus:border-green-500"), autoComplete: "username", spellCheck: false }), isLoading && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }))] }), _jsx("p", { className: cn("text-xs flex items-center gap-1", getValidationColor()), children: getMessage() }), showSuggestions && suggestions.length > 0 && isAvailable === false && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Lightbulb, { className: "h-3 w-3" }), _jsx("span", { children: "Suggested alternatives:" }), onRefreshSuggestions && (_jsxs(Button, { variant: "ghost", size: "sm", className: "h-auto p-0 text-xs hover:bg-transparent hover:text-primary", onClick: onRefreshSuggestions, type: "button", children: [_jsx(RefreshCw, { className: "h-3 w-3 mr-1" }), "Refresh"] }))] }), _jsx("div", { className: "flex flex-wrap gap-2", children: suggestions.map((suggestion, index) => (_jsx(Badge, { variant: "secondary", className: "cursor-pointer hover:bg-primary hover:text-white transition-colors", onClick: () => onSuggestionClick?.(suggestion), children: suggestion }, index))) })] })), isFocused && (_jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [_jsx("p", { children: "Username requirements:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 ml-2", children: [_jsx("li", { children: "3-20 characters" }), _jsx("li", { children: "Lowercase letters, numbers, hyphens, and underscores only" }), _jsx("li", { children: "Cannot start or end with hyphen or underscore" }), _jsx("li", { children: "No consecutive hyphens or underscores" })] })] }))] }));
}
