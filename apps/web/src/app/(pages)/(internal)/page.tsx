import Title from "@/components/template/title.component";
import { TaskForm } from "@/components/task/task-form";
import { TaskList } from "@/components/task/task-list";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <Title title="Tarefas de Hoje" />
      <div className="max-w-2xl">
        <TaskForm />
        <TaskList />
      </div>
    </div>
  );
}
