import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock @ordo-todo/api-client
vi.mock('@ordo-todo/api-client', () => ({
    createApiClient: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    })),
}));
