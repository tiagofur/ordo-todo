import { vi, afterEach } from 'vitest';

// Node 22 + jsdom: globalThis.localStorage can be undefined; zustand persist
// and the afterEach cleanup below need a working storage.
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = String(value);
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

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
