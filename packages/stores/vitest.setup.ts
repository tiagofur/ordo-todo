import { vi, afterEach } from 'vitest';

// Reset all mocks after each test
afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

// Mock @ordo-todo/core if needed
vi.mock('@ordo-todo/core', () => ({
    formatTimerDisplay: vi.fn((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }),
}));
