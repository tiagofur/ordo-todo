"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/api-hooks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskSelectorProps {
  selectedTaskId?: string | null;
  onSelect: (taskId: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function TaskSelector({ selectedTaskId, onSelect, className, disabled }: TaskSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch pending tasks
  const { data: tasks } = useTasks();
  
  // Filter only pending tasks for the selector
  const pendingTasks = tasks?.filter((t: any) => t.status !== "COMPLETED") || [];
  
  const selectedTask = selectedTaskId ? tasks?.find((t: any) => t.id === selectedTaskId) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          {selectedTask ? (
            <span className="truncate font-medium">{selectedTask.title}</span>
          ) : (
            <span className="text-muted-foreground">Seleccionar tarea para trabajar...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar tarea..." />
          <CommandList>
            <CommandEmpty>No se encontraron tareas.</CommandEmpty>
            <CommandGroup heading="Tareas Pendientes">
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
                Sin tarea asignada
              </CommandItem>
              
              {pendingTasks.map((task: any) => (
                <CommandItem
                  key={task.id}
                  value={`${task.title}___${task.id}`}
                  keywords={[task.title]}
                  disabled={false}
                  onSelect={() => {
                    onSelect(String(task.id));
                    setOpen(false);
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
