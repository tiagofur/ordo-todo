import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUsernameValidation, generateUsernameSuggestions } from '@ordo-todo/hooks';
import type { ApiClient } from '@ordo-todo/hooks';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  apiClient: ApiClient;
  showSuggestions?: boolean;
  className?: string;
  label?: string;
  id?: string;
  error?: string;
  helperText?: string;
}

export function UsernameInput({
  value,
  onChange,
  onBlur,
  placeholder = "Enter your username",
  disabled = false,
  required = false,
  apiClient,
  showSuggestions = true,
  className,
  label = "Username",
  id = "username",
  error: externalError,
  helperText,
}: UsernameInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);

  const { validationResult, validateUsername, resetValidation } = useUsernameValidation({
    apiClient,
    minLength: 3,
    maxLength: 20,
    debounceMs: 500,
  });

  // Validate username when value changes
  useEffect(() => {
    if (value && value.length >= 3) {
      validateUsername(value);
    } else if (value && value.length < 3) {
      setSuggestions([]);
      setShowSuggestionsList(false);
    } else {
      resetValidation();
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [value, validateUsername, resetValidation]);

  // Generate suggestions when username is taken
  useEffect(() => {
    if (validationResult.isAvailable === false && showSuggestions) {
      const newSuggestions = generateUsernameSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestionsList(true);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [validationResult.isAvailable, value, showSuggestions]);

  const handleUsernameChange = (newValue: string) => {
    // Force lowercase and valid characters only
    const sanitizedValue = newValue.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    onChange(sanitizedValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestionsList(false);
    onBlur?.(suggestion);
  };

  const getValidationIcon = () => {
    if (validationResult.isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }

    if (!value || value.length < 3) {
      return null;
    }

    if (externalError) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }

    if (validationResult.isValid && validationResult.isAvailable === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (validationResult.isAvailable === false) {
      return <XCircle className="h-4 w-4 text-destructive" />;
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
            validationResult.isAvailable === false && "border-destructive focus:border-destructive",
            validationResult.isValid && validationResult.isAvailable === true && "border-green-500 focus:border-green-500"
          )}
          autoComplete="username"
          spellCheck={false}
        />

        {validationResult.isLoading && (
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

      {/* Username suggestions */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Suggested alternatives:</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => {
                const newSuggestions = generateUsernameSuggestions(value);
                setSuggestions(newSuggestions);
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
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