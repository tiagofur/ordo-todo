/**
 * Skip Links Component for keyboard navigation accessibility
 * Allows users to skip to main content areas
 */

import { skipLinkTargets } from '@/utils/accessibility';

interface SkipLink {
  target: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { target: skipLinkTargets.mainContent, label: 'Skip to main content' },
  { target: skipLinkTargets.navigation, label: 'Skip to navigation' },
  { target: skipLinkTargets.taskList, label: 'Skip to task list' },
];

export function SkipLinks() {
  return (
    <nav aria-label="Skip links" className="skip-links">
      {skipLinks.map(({ target, label }) => (
        <a
          key={target}
          href={`#${target}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
