import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/index.js';

interface ProjectBoardProps {
  /** Loading state */
  isLoading?: boolean;
  /** Content of the board (columns) */
  children?: ReactNode;
  /** Custom labels */
  labels?: {
    todo?: string;
    inProgress?: string;
    completed?: string;
  };
  className?: string;
}

/**
 * ProjectBoard - Platform-agnostic layout for Kanban board
 * 
 * Behavior (DnD) should be implemented by the consuming application
 * by wrapping columns and tasks.
 */
export function ProjectBoard({
  isLoading = false,
  children,
  className = '',
}: ProjectBoardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full gap-6 overflow-x-auto pb-4", className)}>
      {children}
    </div>
  );
}
