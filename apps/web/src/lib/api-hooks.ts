/**
 * API Hooks Re-export
 *
 * This file re-exports all hooks from the shared hooks package for backward compatibility.
 * The actual hook implementations are in @ordo-todo/hooks package.
 *
 * @deprecated Import from '@/lib/shared-hooks' or '@ordo-todo/hooks' directly for new code.
 */

'use client';

// Re-export everything from shared-hooks which uses @ordo-todo/hooks
export * from './shared-hooks';
