/**
 * Shared UI utilities for Ordo-Todo
 */
import { type ClassValue } from 'clsx';
/**
 * Combines class names using clsx and merges Tailwind classes.
 * This is the standard utility for conditional class names in Tailwind projects.
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 * cn('text-sm', { 'font-bold': isBold })
 * ```
 */
export declare function cn(...inputs: ClassValue[]): string;
export * from './colors.js';
//# sourceMappingURL=index.d.ts.map