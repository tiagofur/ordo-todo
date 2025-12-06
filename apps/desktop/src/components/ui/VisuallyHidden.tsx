/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  /** When true, content becomes visible on focus (for skip links) */
  focusable?: boolean;
  /** Additional class names */
  className?: string;
  /** HTML element to render */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function VisuallyHidden({
  children,
  focusable = false,
  className,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'sr-only',
        focusable && 'focus:not-sr-only',
        className
      )}
    >
      {children}
    </Component>
  );
}
