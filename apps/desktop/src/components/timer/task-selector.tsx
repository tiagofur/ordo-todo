import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ordo-todo/ui";
import { useTasks } from "@/hooks/api";

interface TaskSelectorProps {
  selectedTaskId?: string | null;
  onSelect: (taskId: string | null) => void;
  className?: string;
}

export function TaskSelector({ selectedTaskId, onSelect, className }: TaskSelectorProps) {
  const { t } = (useTranslation as any)();
  const [open, setOpen] = useState(false);
  
  // Fetch pending tasks
  const { data: tasks } = useTasks();
  
  // Filter only pending tasks for the selector
  const pendingTasks = tasks?.filter(t => t.status !== "COMPLETED") || [];
  
  const selectedTask = selectedTaskId ? tasks?.find((t) => t.id === selectedTaskId) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          {selectedTask ? (
            <span className="truncate font-medium">{selectedTask.title}</span>
          ) : (
            <span className="text-muted-foreground">{t('TaskSelector.placeholder')}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('TaskSelector.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('TaskSelector.noTasks')}</CommandEmpty>
            <CommandGroup heading={t('TaskSelector.groupHeading')}>
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
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedTaskId ? "opacity-100" : "opacity-0"
                  )}
                />
                {t('TaskSelector.noTaskAssigned')}
              </CommandItem>

              {pendingTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.title} // Use title for search
                  onSelect={() => {
                    if (task.id) {
                      onSelect(String(task.id));
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTaskId === task.id ? "opacity-100" : "opacity-0"
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
