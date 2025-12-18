"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsernameValidation = useUsernameValidation;
exports.generateUsernameSuggestions = generateUsernameSuggestions;
const react_1 = require("react");
function useUsernameValidation({ apiClient, minLength = 3, maxLength = 20, debounceMs = 500, currentUsername, }) {
    const [validationResult, setValidationResult] = (0, react_1.useState)({
        isValid: false,
        isAvailable: null,
        message: '',
        isLoading: false,
    });
    const [lastCheckedUsername, setLastCheckedUsername] = (0, react_1.useState)('');
    // Enhanced regex for better username validation
    const usernameRegex = /^[a-z0-9_-]+$/;
    const validateFormat = (0, react_1.useCallback)((username) => {
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
    const timeoutRef = (0, react_1.useRef)(null);
    // Debounced function to check username availability
    const checkUsernameAvailability = (0, react_1.useCallback)(async (username) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // custom debounce using setTimeout
        timeoutRef.current = setTimeout(async () => {
            // Don't check if it's the same as last checked
            if (username === lastCheckedUsername) {
                return;
            }
            // If username matches current user's username, consider it available
            if (currentUsername && username === currentUsername) {
                setValidationResult({
                    isValid: true,
                    isAvailable: true,
                    message: 'This is your current username',
                    isLoading: false,
                });
                setLastCheckedUsername(username);
                return;
            }
            setValidationResult(prev => ({ ...prev, isLoading: true }));
            try {
                // Try to get API URL from environment or use relative path
                const baseUrl = typeof window !== 'undefined'
                    ? window.__ENV__?.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || ''
                    : '';
                // Use /api/v1 prefix for the backend endpoint
                const apiUrl = baseUrl ? `${baseUrl}/auth/check-username` : '/api/v1/auth/check-username';
                const response = await fetch(apiUrl, {
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
                }
                else {
                    // Fallback: assume username is available if API fails
                    setValidationResult({
                        isValid: true,
                        isAvailable: true,
                        message: 'Username format is valid',
                        isLoading: false,
                    });
                }
            }
            catch (error) {
                console.warn('Username availability check failed:', error);
                // Fallback: assume username is available if API fails
                setValidationResult({
                    isValid: true,
                    isAvailable: true,
                    message: 'Username format is valid',
                    isLoading: false,
                });
            }
        }, debounceMs);
    }, [lastCheckedUsername, debounceMs, currentUsername]);
    const validateUsername = (0, react_1.useCallback)(async (username) => {
        const formatValidation = validateFormat(username);
        if (!formatValidation.isValid) {
            setValidationResult({
                isValid: false,
                isAvailable: false,
                message: formatValidation.message,
                isLoading: false,
            });
            return;
        }
        // Check availability for valid usernames
        if (username.length >= minLength) {
            await checkUsernameAvailability(username);
        }
        else {
            setValidationResult({
                isValid: false,
                isAvailable: false,
                message: formatValidation.message,
                isLoading: false,
            });
        }
    }, [validateFormat, checkUsernameAvailability, minLength]);
    const resetValidation = (0, react_1.useCallback)(() => {
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
function generateUsernameSuggestions(baseName) {
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
