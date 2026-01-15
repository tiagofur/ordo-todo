import { CheckSquare, Sparkles, Layers } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';

/**
 * Project Type Enum - Matches Prisma schema
 * See: packages/db/prisma/schema.prisma
 */
export type ProjectType = 'STANDARD' | 'SERIES' | 'FOCUS' | 'CREATOR' | 'HYBRID';

/**
 * Task representation for different views
 */
export interface TaskData {
  id: string;
  title: string;
  status: string;
  description?: string;
  priority?: string;
  dueDate?: Date | string;
  // Additional fields for Creator mode
  stage?: string;
  category?: 'idea' | 'script' | 'filming' | 'editing' | 'publishing';
}

/**
 * Project data passed to the view switcher
 */
export interface ProjectViewData {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  tasks: TaskData[];
}

/**
 * Props for the component containers that render the actual views
 */
export interface FocusViewProps {
  project: ProjectViewData;
  onTaskClick?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  onCreateTask?: () => void;
  labels?: {
    createTask?: string;
    noTasks?: string;
    tasks?: string;
  };
}

export interface CreatorViewProps {
  project: ProjectViewData;
  onTaskClick?: (taskId: string) => void;
  onTaskStageChange?: (taskId: string, newStage: string) => void;
  onCreateTask?: () => void;
  labels?: {
    createIdea?: string;
    noIdeas?: string;
    ideas?: string;
    pipeline?: string;
  };
}

interface ProjectViewSwitcherProps {
  project: ProjectViewData;
  /** Component to render for FOCUS/STANDARD view */
  FocusViewComponent: React.ComponentType<FocusViewProps>;
  /** Component to render for CREATOR view */
  CreatorViewComponent: React.ComponentType<CreatorViewProps>;
  onTaskClick?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  onTaskStageChange?: (taskId: string, newStage: string) => void;
  onCreateTask?: () => void;
  labels?: {
    focus?: string;
    creator?: string;
    both?: string;
    // Passthrough labels
    focusView?: FocusViewProps['labels'];
    creatorView?: CreatorViewProps['labels'];
  };
  className?: string;
}

/**
 * ProjectViewSwitcher - Conditional rendering based on project type
 *
 * Renders different views based on ProjectType:
 * - FOCUS/STANDARD/SERIES → Classic To-Do view (checkbox, kanban)
 * - CREATOR → Creator OS view (pipeline, scripting, publishing)
 * - HYBRID → Both views available via tabs
 */
export function ProjectViewSwitcher({
  project,
  FocusViewComponent,
  CreatorViewComponent,
  onTaskClick,
  onTaskStatusChange,
  onTaskStageChange,
  onCreateTask,
  labels = {},
  className = '',
}: ProjectViewSwitcherProps) {
  const focusLabel = labels.focus || 'Focus';
  const creatorLabel = labels.creator || 'Creator';
  const bothLabel = labels.both || 'Both';

  // FOCUS, STANDARD, SERIES → Classic To-Do view
  if (project.type === 'FOCUS' || project.type === 'STANDARD' || project.type === 'SERIES') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <CheckSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h3 className="font-semibold text-foreground">{focusLabel} Mode</h3>
            <p className="text-sm text-muted-foreground">
              Classic task management with checklists and boards
            </p>
          </div>
        </div>
        <FocusViewComponent
          project={project}
          onTaskClick={onTaskClick}
          onTaskStatusChange={onTaskStatusChange}
          onCreateTask={onCreateTask}
          labels={labels.focusView}
        />
      </div>
    );
  }

  // CREATOR → Creator OS view (pipeline, scripting, publishing)
  if (project.type === 'CREATOR') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-foreground">{creatorLabel} Mode</h3>
            <p className="text-sm text-muted-foreground">
              Content pipeline with ideas, scripting, and publishing
            </p>
          </div>
        </div>
        <CreatorViewComponent
          project={project}
          onTaskClick={onTaskClick}
          onTaskStageChange={onTaskStageChange}
          onCreateTask={onCreateTask}
          labels={labels.creatorView}
        />
      </div>
    );
  }

  // HYBRID → Both modes available via tabs
  if (project.type === 'HYBRID') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-50 to-amber-50 dark:from-cyan-950 dark:to-amber-950 border border-cyan-200 dark:border-cyan-800">
          <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="font-semibold text-foreground">{bothLabel} Mode</h3>
            <p className="text-sm text-muted-foreground">
              Switch between Focus and Creator modes as needed
            </p>
          </div>
        </div>

        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              {focusLabel}
            </TabsTrigger>
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {creatorLabel}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="mt-4">
            <FocusViewComponent
              project={project}
              onTaskClick={onTaskClick}
              onTaskStatusChange={onTaskStatusChange}
              onCreateTask={onCreateTask}
              labels={labels.focusView}
            />
          </TabsContent>

          <TabsContent value="creator" className="mt-4">
            <CreatorViewComponent
              project={project}
              onTaskClick={onTaskClick}
              onTaskStageChange={onTaskStageChange}
              onCreateTask={onCreateTask}
              labels={labels.creatorView}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div className={cn('p-4 rounded-xl bg-muted', className)}>
      <p className="text-sm text-muted-foreground">
        Unknown project type: {project.type}
      </p>
    </div>
  );
}
