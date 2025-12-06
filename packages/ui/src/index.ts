/**
 * Shared UI Package for Ordo-Todo
 *
 * This package provides shared UI utilities, colors, and constants
 * that can be used across web, mobile, and desktop applications.
 *
 * @example
 * ```tsx
 * import { cn, PROJECT_COLORS, PRIORITY_COLORS } from '@ordo-todo/ui';
 *
 * function Button({ className, variant }) {
 *   return (
 *     <button className={cn(
 *       'px-4 py-2 rounded',
 *       variant === 'primary' && 'bg-blue-500 text-white',
 *       className
 *     )}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */

// Utilities
export { cn } from './utils';

// Colors
export {
  PROJECT_COLORS,
  TAG_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  getFocusScoreColor,
} from './colors';
