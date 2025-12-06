/**
 * Shared UI Package for Ordo-Todo
 *
 * This package provides shared UI components, utilities, colors, and constants
 * that can be used across web, mobile, and desktop applications.
 *
 * @example
 * ```tsx
 * import { cn, PROJECT_COLORS, Button, Input } from '@ordo-todo/ui';
 *
 * function MyForm() {
 *   return (
 *     <div>
 *       <Input placeholder="Enter text" />
 *       <Button variant="primary">Submit</Button>
 *     </div>
 *   );
 * }
 * ```
 */

// Utilities and Colors
export * from './utils/index.js';

// Components (Base UI + Domain-specific)
export * from './components/index.js';
