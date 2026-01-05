import Title from "@/components/template/title.component";
import { TaskForm } from "@/components/task/task-form";
import { TaskList } from "@/components/task/task-list";
import { useTasks, useCompleteTask } from "@/lib/api-hooks";

export default function Dashboard() {
  const { data: tasks, isLoading, error, refetch } = useTasks(undefined, undefined, { assignedToMe: true });
  const completeTask = useCompleteTask();

  // Basic adaptation of tasks for the list
  const taskListItems = (tasks || []).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status
  }));

  return (
    <div className="flex flex-col gap-6">
      <Title title="Tarefas de Hoje" />
      <div className="max-w-2xl">
        <TaskForm />
        <TaskList 
          tasks={taskListItems}
          isLoading={isLoading}
          error={error?.message}
          isCompleting={completeTask.isPending}
          onComplete={(id) => completeTask.mutate(id)}
          onRetry={refetch}
          labels={{
            allTasks: "Todas",
            myTasks: "Minhas",
            empty: "Nenhuma tarefa encontrada",
            emptyMyTasks: "Nenhuma tarefa atribuída a você"
          }}
        />
      </div>
    </div>
  );
}
