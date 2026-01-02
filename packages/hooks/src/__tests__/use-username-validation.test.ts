import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUsernameValidation, generateUsernameSuggestions } from '../use-username-validation';

// Mock fetch
global.fetch = vi.fn();

describe('useUsernameValidation', () => {
    const mockApiClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate format correctly: too short', async () => {
        const { result } = renderHook(() => useUsernameValidation({ apiClient: mockApiClient }));

        await act(async () => {
            await result.current.validateUsername('ab');
        });

        expect(result.current.validationResult.isValid).toBe(false);
        expect(result.current.validationResult.message).toContain('at least 3 characters');
    });

    it('should validate format correctly: invalid characters', async () => {
        const { result } = renderHook(() => useUsernameValidation({ apiClient: mockApiClient }));

        await act(async () => {
            await result.current.validateUsername('user!name');
        });

        expect(result.current.validationResult.isValid).toBe(false);
        expect(result.current.validationResult.message).toContain('can only contain lowercase letters');
    });

    it('should validate format correctly: valid format', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ available: true }),
        });

        const { result } = renderHook(() => useUsernameValidation({
            apiClient: mockApiClient,
            debounceMs: 0
        }));

        await act(async () => {
            await result.current.validateUsername('valid_user');
        });

        // Wait for the internal setTimeout in the hook
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        expect(result.current.validationResult.isValid).toBe(true);
        expect(result.current.validationResult.isAvailable).toBe(true);
    });

    it('should handle unavailable username', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ available: false }),
        });

        const { result } = renderHook(() => useUsernameValidation({
            apiClient: mockApiClient,
            debounceMs: 0
        }));

        await act(async () => {
            await result.current.validateUsername('taken_user');
        });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        expect(result.current.validationResult.isAvailable).toBe(false);
        expect(result.current.validationResult.message).toBe('Username is already taken');
    });

    it('should handle API failure gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('API Down'));

        const { result } = renderHook(() => useUsernameValidation({
            apiClient: mockApiClient,
            debounceMs: 0
        }));

        await act(async () => {
            await result.current.validateUsername('any_user');
        });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        expect(result.current.validationResult.isValid).toBe(true);
        expect(result.current.validationResult.isAvailable).toBe(true);
    });
});

describe('generateUsernameSuggestions', () => {
    it('should generate suggestions', () => {
        // Mock Math.random to be deterministic
        let i = 0.1;
        vi.spyOn(Math, 'random').mockImplementation(() => {
            i += 0.1;
            if (i >= 1) i = 0.1;
            return i;
        });

        const suggestions = generateUsernameSuggestions('John Doe');
        expect(suggestions.length).toBeGreaterThanOrEqual(1);
        suggestions.forEach(s => {
            expect(s).toMatch(/^[a-z0-9_-]+$/);
        });

        vi.restoreAllMocks();
    });
});
