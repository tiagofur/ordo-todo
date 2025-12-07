'use client';

import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  /** Custom logo/brand component */
  renderLogo?: () => ReactNode;
  /** Loading text */
  text?: string;
  /** Whether to show the overlay */
  isVisible?: boolean;
}

export function LoadingOverlay({
  renderLogo,
  text = 'Processing...',
  isVisible = true,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="h-screen">
      <div
        className="
          flex flex-col justify-center items-center
          absolute top-0 left-0 w-full h-full gap-4
          bg-black/90 text-center z-50
        "
      >
        {renderLogo ? (
          renderLogo()
        ) : (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        )}
        <span className="font-light text-zinc-500">{text}</span>
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
