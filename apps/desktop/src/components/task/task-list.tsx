import { useState } from "react";
import { useTasks, useCompleteTask } from "@/hooks/api";
import { toast } from "sonner";
import { TaskCard } from "./task-card";
import { useTaskNavigation } from "@/hooks/use-task-navigation";
import { TaskDetailPanel } from "./task-detail-panel";

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const [activeDetailTaskId, setActiveDetailTaskId] = useState<string | null>(null);

  const completeTask = useCompleteTask();

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync(taskId);
      toast.success("Task completed!");
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const { selectedIndex } = useTaskNavigation(tasks || [], {
    onComplete: (task) => handleCompleteTask(task.id),
    onOpen: (task) => setActiveDetailTaskId(task.id),
    enabled: !activeDetailTaskId, // Disable nav when detail is open
  });

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  if (!tasks || tasks.length === 0) {
    return <div className="text-muted-foreground">No tasks yet. Add one above!</div>;
  }

  return (
    <div className="space-y-4 mt-4 pb-20">
      {tasks.map((task, index) => (
        <TaskCard 
            key={task.id} 
            task={task} 
            isSelected={index === selectedIndex}
            onOpenDetail={() => setActiveDetailTaskId(String(task.id))}
        />
      ))}

      <TaskDetailPanel 
        taskId={activeDetailTaskId} 
        open={!!activeDetailTaskId} 
        onOpenChange={(open) => !open && setActiveDetailTaskId(null)} 
      />
    </div>
  );
}
