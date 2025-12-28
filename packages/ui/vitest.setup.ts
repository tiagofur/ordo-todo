import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
  };
});

// Mock @ordo-todo/core
vi.mock('@ordo-todo/core', () => ({
  createWorkspaceSchema: {
    parse: vi.fn((val: any) => val),
    safeParse: vi.fn(() => ({ success: true, data: {} })),
  },
  generateSlug: vi.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock navigator.clipboard
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  },
  writable: true,
});

// Mock window.Image for avatar components
class MockImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    // Simulate immediate load
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as any;
