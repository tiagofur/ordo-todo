import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/task/task-list";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";

export function Tasks() {
  const [showCreateTask, setShowCreateTask] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">Gestiona tus tareas diarias</p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <TaskList />

      <CreateTaskDialog 
        open={showCreateTask} 
        onOpenChange={setShowCreateTask} 
      />
    </div>
  );
}
