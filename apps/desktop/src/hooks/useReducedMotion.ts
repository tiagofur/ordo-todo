/**
 * Hook to detect user's reduced motion preference
 * Respects WCAG 2.3.3 Animation from Interactions
 */

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation variants that respect reduced motion
 */
export function useAccessibleAnimations() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Return safe animation values
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : { duration: 0.3, ease: 'easeOut' },
    // Page transition variants
    pageVariants: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        },
    // Stagger container
    staggerContainer: prefersReducedMotion
      ? {}
      : {
          animate: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        },
    // Stagger item
    staggerItem: prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
        }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
        },
  };
}
