'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/index.js';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command.js';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js';

export interface SelectableTask {
  id: string;
  title: string;
  status?: string;
}

interface TaskSelectorProps {
  /** ID of currently selected task */
  selectedTaskId?: string | null;
  /** Available tasks to choose from */
  tasks: SelectableTask[];
  /** Called when a task is selected */
  onSelect: (taskId: string | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom labels for i18n */
  labels?: {
    placeholder?: string;
    searchPlaceholder?: string;
    noTasks?: string;
    groupHeading?: string;
    noTaskAssigned?: string;
  };
  className?: string;
}

/**
 * TaskSelector - Platform-agnostic task selection dropdown
 * 
 * Tasks are passed via props. Typically used with timer to select which task to track.
 * 
 * @example
 * const { data: tasks } = useTasks();
 * const pendingTasks = tasks?.filter(t => t.status !== 'COMPLETED') || [];
 * 
 * <TaskSelector
 *   tasks={pendingTasks}
 *   selectedTaskId={selectedTaskId}
 *   onSelect={setSelectedTaskId}
 *   labels={{ placeholder: t('placeholder') }}
 * />
 */
export function TaskSelector({
  selectedTaskId,
  tasks = [],
  onSelect,
  disabled = false,
  labels = {},
  className = '',
}: TaskSelectorProps) {
  const [open, setOpen] = useState(false);

  const {
    placeholder = 'Select a task...',
    searchPlaceholder = 'Search tasks...',
    noTasks = 'No tasks found.',
    groupHeading = 'Tasks',
    noTaskAssigned = 'No task assigned',
  } = labels;

  // Filter only pending tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        >
          {selectedTask ? (
            <span className="truncate font-medium">{selectedTask.title}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noTasks}</CommandEmpty>
            <CommandGroup heading={groupHeading}>
              {/* Option to clear selection */}
              <CommandItem
                value="no-task"
                onSelect={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="text-muted-foreground italic"
              >
                <Check
                  className={cn('mr-2 h-4 w-4', !selectedTaskId ? 'opacity-100' : 'opacity-0')}
                />
                {noTaskAssigned}
              </CommandItem>

              {pendingTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.id}
                  keywords={[task.title]}
                  onSelect={() => {
                    onSelect(task.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedTaskId === task.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{task.title}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
