"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const use_username_validation_1 = require("../use-username-validation");
// Mock fetch
global.fetch = vitest_1.vi.fn();
(0, vitest_1.describe)('useUsernameValidation', () => {
    const mockApiClient = {};
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should validate format correctly: too short', async () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_username_validation_1.useUsernameValidation)({ apiClient: mockApiClient }));
        await (0, react_1.act)(async () => {
            await result.current.validateUsername('ab');
        });
        (0, vitest_1.expect)(result.current.validationResult.isValid).toBe(false);
        (0, vitest_1.expect)(result.current.validationResult.message).toContain('at least 3 characters');
    });
    (0, vitest_1.it)('should validate format correctly: invalid characters', async () => {
        const { result } = (0, react_1.renderHook)(() => (0, use_username_validation_1.useUsernameValidation)({ apiClient: mockApiClient }));
        await (0, react_1.act)(async () => {
            await result.current.validateUsername('user!name');
        });
        (0, vitest_1.expect)(result.current.validationResult.isValid).toBe(false);
        (0, vitest_1.expect)(result.current.validationResult.message).toContain('can only contain lowercase letters');
    });
    (0, vitest_1.it)('should validate format correctly: valid format', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ available: true }),
        });
        const { result } = (0, react_1.renderHook)(() => (0, use_username_validation_1.useUsernameValidation)({
            apiClient: mockApiClient,
            debounceMs: 0
        }));
        await (0, react_1.act)(async () => {
            await result.current.validateUsername('valid_user');
        });
        // Wait for the internal setTimeout in the hook
        await (0, react_1.act)(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        (0, vitest_1.expect)(result.current.validationResult.isValid).toBe(true);
        (0, vitest_1.expect)(result.current.validationResult.isAvailable).toBe(true);
    });
    (0, vitest_1.it)('should handle unavailable username', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ available: false }),
        });
        const { result } = (0, react_1.renderHook)(() => (0, use_username_validation_1.useUsernameValidation)({
            apiClient: mockApiClient,
            debounceMs: 0
        }));
        await (0, react_1.act)(async () => {
            await result.current.validateUsername('taken_user');
        });
        await (0, react_1.act)(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        (0, vitest_1.expect)(result.current.validationResult.isAvailable).toBe(false);
        (0, vitest_1.expect)(result.current.validationResult.message).toBe('Username is already taken');
    });
    (0, vitest_1.it)('should handle API failure gracefully', async () => {
        global.fetch.mockRejectedValue(new Error('API Down'));
        const { result } = (0, react_1.renderHook)(() => (0, use_username_validation_1.useUsernameValidation)({
            apiClient: mockApiClient,
            debounceMs: 0
        }));
        await (0, react_1.act)(async () => {
            await result.current.validateUsername('any_user');
        });
        await (0, react_1.act)(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        (0, vitest_1.expect)(result.current.validationResult.isValid).toBe(true);
        (0, vitest_1.expect)(result.current.validationResult.isAvailable).toBe(true);
    });
});
(0, vitest_1.describe)('generateUsernameSuggestions', () => {
    (0, vitest_1.it)('should generate suggestions', () => {
        // Mock Math.random to be deterministic
        let i = 0.1;
        vitest_1.vi.spyOn(Math, 'random').mockImplementation(() => {
            i += 0.1;
            if (i >= 1)
                i = 0.1;
            return i;
        });
        const suggestions = (0, use_username_validation_1.generateUsernameSuggestions)('John Doe');
        (0, vitest_1.expect)(suggestions.length).toBeGreaterThanOrEqual(1);
        suggestions.forEach(s => {
            (0, vitest_1.expect)(s).toMatch(/^[a-z0-9_-]+$/);
        });
        vitest_1.vi.restoreAllMocks();
    });
});
