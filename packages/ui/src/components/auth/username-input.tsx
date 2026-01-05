'use client';

import { useState } from 'react';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Button } from '../ui/button.js';
import { Badge } from '../ui/badge.js';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../utils/index.js';

export interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  id?: string;
  error?: string;
  helperText?: string;
  
  // Validation state props (lifted up)
  isLoading?: boolean;
  isValid?: boolean;
  isAvailable?: boolean | null;
  validationMessage?: string;
  
  // Suggestions props (lifted up)
  suggestions?: string[];
  showSuggestions?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  onRefreshSuggestions?: () => void;
}

export function UsernameInput({
  value,
  onChange,
  onBlur,
  placeholder = "Enter your username",
  disabled = false,
  required = false,
  className,
  label = "Username",
  id = "username",
  error: externalError,
  helperText,
  
  isLoading = false,
  isValid = false,
  isAvailable = null,
  validationMessage,
  
  suggestions = [],
  showSuggestions = true,
  onSuggestionClick,
  onRefreshSuggestions,
}: UsernameInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleUsernameChange = (newValue: string) => {
    // Force lowercase and valid characters only - UI cleanup only
    const sanitizedValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    onChange(sanitizedValue);
  };

  const getValidationIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (!value || value.length < 3) {
      return null;
    }

    if (externalError) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }

    if (isValid && isAvailable === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (isAvailable === false) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }

    if (value.length >= 3 && !isValid) {
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
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

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {getValidationIcon()}
      </div>

      <div className="relative">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => handleUsernameChange(e.target.value)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10",
            externalError && "border-destructive focus:border-destructive",
            isAvailable === false && "border-destructive focus:border-destructive",
            isValid && isAvailable === true && "border-green-500 focus:border-green-500"
          )}
          autoComplete="username"
          spellCheck={false}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Validation message */}
      <p className={cn("text-xs flex items-center gap-1", getValidationColor())}>
        {getMessage()}
      </p>

      {/* Username suggestions */}
      {showSuggestions && suggestions.length > 0 && isAvailable === false && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Suggested alternatives:</span>
            {onRefreshSuggestions && (
                <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs hover:bg-transparent hover:text-primary"
                onClick={onRefreshSuggestions}
                type="button"
                >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
                </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Username rules */}
      {isFocused && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Username requirements:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>3-20 characters</li>
            <li>Lowercase letters, numbers, hyphens, and underscores only</li>
            <li>Cannot start or end with hyphen or underscore</li>
            <li>No consecutive hyphens or underscores</li>
          </ul>
        </div>
      )}
    </div>
  );
}
