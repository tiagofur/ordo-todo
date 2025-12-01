import { useTasks, useCompleteTask } from "@/hooks/api";
import { toast } from "sonner";
import { TaskCard } from "./task-card";

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();

  const completeTask = useCompleteTask();

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync(taskId);
      toast.success("Task completed!");
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  if (!tasks || tasks.length === 0) {
    return <div className="text-muted-foreground">No tasks yet. Add one above!</div>;
  }

  return (
    <div className="space-y-4 mt-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
