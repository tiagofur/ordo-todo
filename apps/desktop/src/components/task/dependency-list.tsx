import { useState } from "react";
import { useTaskDependencies, useAddDependency, useRemoveDependency, useTasks } from "@/hooks/api";
import {
    cn,
    Button,
    Label,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@ordo-todo/ui";
import { Check, Link, Trash2, ArrowRight } from "lucide-react";

export function DependencyList({ taskId, projectId }: { taskId: string; projectId?: string }) {
    const { data: dependencies, isLoading } = useTaskDependencies(taskId);
    const { data: allTasks } = useTasks(projectId); // Fetch tasks to link - maybe filter by project?
    const addDependency = useAddDependency();
    const removeDependency = useRemoveDependency();
    const [openCombobox, setOpenCombobox] = useState(false);

    if (isLoading) return <div className="p-4 text-center text-sm text-muted-foreground">Cargando dependencias...</div>;
    
    // Filter tasks that are NOT already dependencies and NOT self
    const availableTasks = allTasks?.filter((t: any) => 
        t.id !== taskId && 
        !dependencies?.blockedBy.some((d: any) => d.id === t.id) &&
        !dependencies?.blocking.some((d: any) => d.id === t.id)
    ) || [];

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">
                        Bloqueada Por
                    </Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:bg-primary/10 hover:text-primary">
                                <Link className="w-3 h-3 mr-1" />
                                Añadir
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px]" align="end">
                            <Command>
                                <CommandInput placeholder="Buscar tarea para bloquear..." />
                                <CommandEmpty>No se encontraron tareas</CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-auto">
                                    {availableTasks.map((task: any) => (
                                        <CommandItem
                                            key={task.id}
                                            value={task.title}
                                            onSelect={() => {
                                                addDependency.mutate({ blockedTaskId: taskId, blockingTaskId: task.id });
                                                setOpenCombobox(false);
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span>{task.title}</span>
                                                <span className="text-xs text-muted-foreground">{task.status}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                
                <p className="text-xs text-muted-foreground">Esta tarea no podrá completarse hasta que se terminen estas tareas:</p>

                <div className="space-y-2">
                    {dependencies?.blockedBy.length === 0 && (
                        <div className="p-3 border rounded-md bg-muted/20 text-center text-sm text-muted-foreground">
                            No hay bloqueos. La tarea está libre.
                        </div>
                    )}
                    {dependencies?.blockedBy.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded border bg-card hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-2 h-2 rounded-full", task.status === 'COMPLETED' ? "bg-green-500" : "bg-orange-500")} />
                                <span className={cn("text-sm font-medium", task.status === 'COMPLETED' && "line-through text-muted-foreground")}>
                                    {task.title}
                                </span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeDependency.mutate({ blockedTaskId: taskId, blockingTaskId: task.id })}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
               <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Bloqueando A
               </Label>
               <p className="text-xs text-muted-foreground">Estas tareas dependen de que termines esta tarea:</p>
               <div className="space-y-2">
                    {dependencies?.blocking.length === 0 && (
                        <div className="p-3 border rounded-md bg-muted/20 text-center text-sm text-muted-foreground">
                            No bloquea a nadie.
                        </div>
                    )}
                    {dependencies?.blocking.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-2 rounded border bg-card hover:bg-accent/10 transition-colors">
                             <div className="flex items-center gap-3">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                                <span className={cn("text-sm font-medium", task.status === 'COMPLETED' && "line-through text-muted-foreground")}>
                                    {task.title}
                                </span>
                            </div>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeDependency.mutate({ blockedTaskId: task.id, blockingTaskId: taskId })}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
               </div>
            </div>
        </div>
    );
}
