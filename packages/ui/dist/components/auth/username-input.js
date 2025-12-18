"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUsernameValidation, generateUsernameSuggestions } from '@ordo-todo/hooks';
export function UsernameInput({ value, onChange, onBlur, placeholder = "Enter your username", disabled = false, required = false, apiClient, showSuggestions = true, className, label = "Username", id = "username", error: externalError, helperText, }) {
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const { validationResult, validateUsername, resetValidation } = useUsernameValidation({
        apiClient,
        minLength: 3,
        maxLength: 20,
        debounceMs: 500,
    });
    // Validate username when value changes
    // Note: validateUsername and resetValidation are intentionally excluded from deps
    // They are stable callbacks that shouldn't trigger re-validation
    useEffect(() => {
        if (value && value.length >= 3) {
            validateUsername(value);
        }
        else if (value && value.length < 3) {
            setSuggestions([]);
            setShowSuggestionsList(false);
        }
        else {
            resetValidation();
            setSuggestions([]);
            setShowSuggestionsList(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    // Generate suggestions when username is taken
    useEffect(() => {
        if (validationResult.isAvailable === false && showSuggestions) {
            const newSuggestions = generateUsernameSuggestions(value);
            setSuggestions(newSuggestions);
            setShowSuggestionsList(true);
        }
        else {
            setSuggestions([]);
            setShowSuggestionsList(false);
        }
    }, [validationResult.isAvailable, value, showSuggestions]);
    const handleUsernameChange = (newValue) => {
        // Force lowercase and valid characters only
        const sanitizedValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        onChange(sanitizedValue);
    };
    const handleSuggestionClick = (suggestion) => {
        onChange(suggestion);
        setShowSuggestionsList(false);
        onBlur?.(suggestion);
    };
    const getValidationIcon = () => {
        if (validationResult.isLoading) {
            return _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" });
        }
        if (!value || value.length < 3) {
            return null;
        }
        if (externalError) {
            return _jsx(XCircle, { className: "h-4 w-4 text-destructive" });
        }
        if (validationResult.isValid && validationResult.isAvailable === true) {
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        }
        if (validationResult.isAvailable === false) {
            return _jsx(XCircle, { className: "h-4 w-4 text-destructive" });
        }
        return _jsx(AlertCircle, { className: "h-4 w-4 text-yellow-500" });
    };
    const getValidationMessage = () => {
        if (externalError) {
            return externalError;
        }
        if (!value) {
            return helperText;
        }
        if (value.length > 0 && value.length < 3) {
            return "Username must be at least 3 characters";
        }
        if (validationResult.message && value.length >= 3) {
            return validationResult.message;
        }
        return helperText;
    };
    const getValidationColor = () => {
        if (externalError || validationResult.isAvailable === false) {
            return "text-destructive";
        }
        if (validationResult.isValid && validationResult.isAvailable === true) {
            return "text-green-600 dark:text-green-400";
        }
        return "text-muted-foreground";
    };
    return (_jsxs("div", { className: cn("space-y-2", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: id, className: "text-sm font-medium", children: [label, required && _jsx("span", { className: "text-destructive ml-1", children: "*" })] }), getValidationIcon()] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: id, type: "text", value: value, onChange: (e) => handleUsernameChange(e.target.value), onBlur: (e) => {
                            setIsFocused(false);
                            onBlur?.(e.target.value);
                        }, onFocus: () => setIsFocused(true), placeholder: placeholder, disabled: disabled, className: cn("pr-10", externalError && "border-destructive focus:border-destructive", validationResult.isAvailable === false && "border-destructive focus:border-destructive", validationResult.isValid && validationResult.isAvailable === true && "border-green-500 focus:border-green-500"), autoComplete: "username", spellCheck: false }), validationResult.isLoading && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }))] }), getValidationMessage() && (_jsx("p", { className: cn("text-xs flex items-center gap-1", getValidationColor()), children: getValidationMessage() })), showSuggestionsList && suggestions.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Lightbulb, { className: "h-3 w-3" }), _jsx("span", { children: "Suggested alternatives:" }), _jsxs(Button, { variant: "ghost", size: "sm", className: "h-auto p-0 text-xs", onClick: () => {
                                    const newSuggestions = generateUsernameSuggestions(value);
                                    setSuggestions(newSuggestions);
                                }, children: [_jsx(RefreshCw, { className: "h-3 w-3 mr-1" }), "Refresh"] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: suggestions.map((suggestion, index) => (_jsx(Badge, { variant: "secondary", className: "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors", onClick: () => handleSuggestionClick(suggestion), children: suggestion }, index))) })] })), isFocused && (_jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [_jsx("p", { children: "Username requirements:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 ml-2", children: [_jsx("li", { children: "3-20 characters" }), _jsx("li", { children: "Lowercase letters, numbers, hyphens, and underscores only" }), _jsx("li", { children: "Cannot start or end with hyphen or underscore" }), _jsx("li", { children: "No consecutive hyphens or underscores" })] })] }))] }));
}
