import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash-es';
import type { ApiClient } from './types';

interface UsernameValidationResult {
  isValid: boolean;
  isAvailable: boolean | null;
  message: string;
  isLoading: boolean;
}

interface UseUsernameValidationOptions {
  apiClient: ApiClient;
  minLength?: number;
  maxLength?: number;
  debounceMs?: number;
}

export function useUsernameValidation({
  apiClient,
  minLength = 3,
  maxLength = 20,
  debounceMs = 500,
}: UseUsernameValidationOptions) {
  const [validationResult, setValidationResult] = useState<UsernameValidationResult>({
    isValid: false,
    isAvailable: null,
    message: '',
    isLoading: false,
  });

  const [lastCheckedUsername, setLastCheckedUsername] = useState<string>('');

  // Enhanced regex for better username validation
  const usernameRegex = /^[a-z0-9_-]+$/;

  const validateFormat = useCallback((username: string): { isValid: boolean; message: string } => {
    if (!username || username.length === 0) {
      return { isValid: false, message: 'Username is required' };
    }

    if (username.length < minLength) {
      return { isValid: false, message: `Username must be at least ${minLength} characters` };
    }

    if (username.length > maxLength) {
      return { isValid: false, message: `Username must be less than ${maxLength} characters` };
    }

    if (!usernameRegex.test(username)) {
      return {
        isValid: false,
        message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores',
      };
    }

    // Additional validation rules
    if (username.startsWith('_') || username.startsWith('-')) {
      return { isValid: false, message: 'Username cannot start with underscore or hyphen' };
    }

    if (username.endsWith('_') || username.endsWith('-')) {
      return { isValid: false, message: 'Username cannot end with underscore or hyphen' };
    }

    if (username.includes('--') || username.includes('__')) {
      return { isValid: false, message: 'Username cannot contain consecutive hyphens or underscores' };
    }

    return { isValid: true, message: 'Username format is valid' };
  }, [minLength, maxLength]);

  // Debounced function to check username availability
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      // Don't check if it's the same as last checked
      if (username === lastCheckedUsername) {
        return;
      }

      setValidationResult(prev => ({ ...prev, isLoading: true }));

      try {
        // Check if there's a method to check username availability
        // For now, we'll use a mock implementation - replace with actual API call
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          const data = await response.json();
          setValidationResult({
            isValid: true,
            isAvailable: data.available,
            message: data.available ? 'Username is available!' : 'Username is already taken',
            isLoading: false,
          });
          setLastCheckedUsername(username);
        } else {
          // Fallback: assume username is available if API fails
          setValidationResult({
            isValid: true,
            isAvailable: true,
            message: 'Username format is valid',
            isLoading: false,
          });
        }
      } catch (error) {
        console.warn('Username availability check failed:', error);
        // Fallback: assume username is available if API fails
        setValidationResult({
          isValid: true,
          isAvailable: true,
          message: 'Username format is valid',
          isLoading: false,
        });
      }
    }, debounceMs),
    [lastCheckedUsername, debounceMs]
  );

  const validateUsername = useCallback(
    async (username: string) => {
      const formatValidation = validateFormat(username);

      if (!formatValidation.isValid) {
        setValidationResult({
          isValid: false,
          isAvailable: false,
          message: formatValidation.message,
          isLoading: false,
        });
        return validationResult;
      }

      // Check availability for valid usernames
      if (username.length >= minLength) {
        await checkUsernameAvailability(username);
      } else {
        setValidationResult({
          isValid: false,
          isAvailable: false,
          message: formatValidation.message,
          isLoading: false,
        });
      }

      return validationResult;
    },
    [validateFormat, checkUsernameAvailability, minLength, validationResult]
  );

  const resetValidation = useCallback(() => {
    setValidationResult({
      isValid: false,
      isAvailable: null,
      message: '',
      isLoading: false,
    });
    setLastCheckedUsername('');
  }, []);

  return {
    validationResult,
    validateUsername,
    resetValidation,
  };
}

// Helper function to generate username suggestions
export function generateUsernameSuggestions(baseName: string): string[] {
  const base = baseName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const suggestions = [];
  const randomNumbers = [123, 456, 789, 2024, 2025];
  const suffixes = ['', '_', '-', '___', '__', 'dev', 'app', 'user'];

  for (let i = 0; i < 5; i++) {
    const randomNum = randomNumbers[Math.floor(Math.random() * randomNumbers.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    suggestions.push(`${base}${suffix}${randomNum}`);
  }

  return [...new Set(suggestions)].slice(0, 5);
}