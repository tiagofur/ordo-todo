"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTask } from "./sortable-task";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface BoardColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: any[];
  onAddTask: () => void;
}

export function BoardColumn({ id, title, color, tasks, onAddTask }: BoardColumnProps) {
  const t = useTranslations('ProjectBoard');
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex-shrink-0 w-80 flex flex-col gap-4">
      <div className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs font-medium bg-background/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[200px] flex-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <SortableTask key={task.id} task={task} index={index} />
          ))}
        </SortableContext>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-primary border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
          onClick={onAddTask}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addTask')}
        </Button>
      </div>
    </div>
  );
}
