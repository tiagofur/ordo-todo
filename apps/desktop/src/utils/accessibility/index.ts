/**
 * Accessibility utilities for WCAG AA compliance
 * @module accessibility
 */

// ============================================
// ARIA Labels & Descriptions
// ============================================

/**
 * Generate ARIA labels for common interactive elements
 */
export const ariaLabels = {
  // Navigation
  mainNav: 'Main navigation',
  sidebar: 'Sidebar navigation',
  breadcrumb: 'Breadcrumb navigation',
  
  // Timer
  timerStart: 'Start timer',
  timerPause: 'Pause timer',
  timerStop: 'Stop timer',
  timerReset: 'Reset timer',
  timerSkip: 'Skip to next session',
  
  // Tasks
  taskList: 'Task list',
  taskItem: (title: string) => `Task: ${title}`,
  taskComplete: (title: string) => `Mark "${title}" as complete`,
  taskEdit: (title: string) => `Edit task "${title}"`,
  taskDelete: (title: string) => `Delete task "${title}"`,
  taskPriority: (priority: string) => `Priority: ${priority}`,
  
  // Projects
  projectList: 'Project list',
  projectItem: (name: string) => `Project: ${name}`,
  
  // Analytics
  weeklyChart: 'Weekly productivity chart',
  heatmap: 'Peak hours heatmap',
  focusScore: 'Focus score gauge',
  
  // Actions
  addTask: 'Add new task',
  addProject: 'Add new project',
  search: 'Search tasks',
  filter: 'Filter options',
  sort: 'Sort options',
  settings: 'Open settings',
  notifications: 'View notifications',
  
  // Dialogs
  closeDialog: 'Close dialog',
  confirmAction: 'Confirm action',
  cancelAction: 'Cancel action',
} as const;

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Common keyboard shortcuts with descriptions
 */
export const keyboardShortcuts = {
  // Global
  'Ctrl+N': 'New task',
  'Ctrl+Shift+N': 'New project',
  'Ctrl+F': 'Search',
  'Ctrl+,': 'Settings',
  'Escape': 'Close dialog / Cancel',
  
  // Timer
  'Space': 'Start/Pause timer',
  'Ctrl+Shift+S': 'Start timer',
  'Ctrl+Shift+P': 'Pause timer',
  'Ctrl+Shift+R': 'Reset timer',
  
  // Navigation
  'Ctrl+1': 'Go to Dashboard',
  'Ctrl+2': 'Go to Tasks',
  'Ctrl+3': 'Go to Projects',
  'Ctrl+4': 'Go to Timer',
  'Ctrl+5': 'Go to Analytics',
  
  // Task list
  'ArrowUp': 'Previous task',
  'ArrowDown': 'Next task',
  'Enter': 'Open task / Confirm',
  'Delete': 'Delete selected task',
  'Ctrl+Enter': 'Complete task',
} as const;

/**
 * Handle keyboard navigation in lists
 */
export function handleListKeyboardNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  callbacks: {
    onSelect?: (index: number) => void;
    onActivate?: (index: number) => void;
    onDelete?: (index: number) => void;
  }
): void {
  const { key } = event;
  
  switch (key) {
    case 'ArrowUp':
      event.preventDefault();
      if (currentIndex > 0) {
        callbacks.onSelect?.(currentIndex - 1);
      }
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      if (currentIndex < itemCount - 1) {
        callbacks.onSelect?.(currentIndex + 1);
      }
      break;
      
    case 'Home':
      event.preventDefault();
      callbacks.onSelect?.(0);
      break;
      
    case 'End':
      event.preventDefault();
      callbacks.onSelect?.(itemCount - 1);
      break;
      
    case 'Enter':
    case ' ':
      event.preventDefault();
      callbacks.onActivate?.(currentIndex);
      break;
      
    case 'Delete':
    case 'Backspace':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        callbacks.onDelete?.(currentIndex);
      }
      break;
  }
}

// ============================================
// Focus Management
// ============================================

/**
 * Trap focus within a container (for modals/dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ============================================
// Color Contrast
// ============================================

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA requirements
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA requirements
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// ============================================
// Skip Links
// ============================================

/**
 * Skip link targets for main content areas
 */
export const skipLinkTargets = {
  mainContent: 'main-content',
  navigation: 'main-navigation',
  sidebar: 'sidebar',
  taskList: 'task-list',
  timer: 'timer-section',
} as const;

// ============================================
// Reduced Motion
// ============================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration respecting reduced motion preference
 */
export function getAnimationDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 0 : normalDuration;
}

// ============================================
// Screen Reader Utilities
// ============================================

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format percentage for screen readers
 */
export function formatPercentageForScreenReader(value: number): string {
  return `${Math.round(value)} percent`;
}
