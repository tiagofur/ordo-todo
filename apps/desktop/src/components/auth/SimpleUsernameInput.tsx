"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@ordo-todo/ui';
import { Label } from '@ordo-todo/ui';
import { Button } from '@ordo-todo/ui';
import { Badge } from '@ordo-todo/ui';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SimpleUsernameInputProps {
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
}

export function SimpleUsernameInput({
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
}: SimpleUsernameInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  // Validate username when value changes
  useEffect(() => {
    if (value && value.length >= 3) {
      setIsValidating(true);

      // Basic validation rules
      if (!/^[a-z0-9_-]+$/.test(value)) {
        setValidationMessage('Only lowercase letters, numbers, hyphens, and underscores allowed');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      if (/^[-_]/.test(value) || /[-_]$/.test(value)) {
        setValidationMessage('Cannot start or end with hyphen or underscore');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      if (/--/.test(value) || /__/.test(value)) {
        setValidationMessage('No consecutive hyphens or underscores');
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      // Simulate API check with timeout
      const timeout = setTimeout(async () => {
        // For now, assume all valid usernames are available
        // TODO: Implement real API call to check-username endpoint
        setValidationMessage('Username is available');
        setIsValid(true);
        setIsValidating(false);
      }, 500);

      return () => clearTimeout(timeout);
    } else if (value && value.length < 3) {
      setValidationMessage('Username must be at least 3 characters');
      setIsValid(false);
    } else {
      setValidationMessage(helperText || '');
      setIsValid(false);
    }
  }, [value, helperText]);

  const handleUsernameChange = (newValue: string) => {
    // Force lowercase and valid characters only
    const sanitizedValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    onChange(sanitizedValue);
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (!value || value.length < 3) {
      return null;
    }

    if (externalError) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }

    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
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

    return validationMessage;
  };

  const getValidationColor = () => {
    if (externalError || isValid === false && value.length >= 3) {
      return "text-destructive";
    }

    if (isValid) {
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
            isValid && "border-green-500 focus:border-green-500"
          )}
          autoComplete="username"
          spellCheck={false}
        />

        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Validation message */}
      {getValidationMessage() && (
        <p className={cn("text-xs flex items-center gap-1", getValidationColor())}>
          {getValidationMessage()}
        </p>
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