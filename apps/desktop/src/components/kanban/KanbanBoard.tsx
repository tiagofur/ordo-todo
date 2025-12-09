import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Clock, Tag as TagIcon } from "lucide-react";
import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ordo-todo/ui";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | string;
  tags?: { id: string; name: string; color: string }[];
  assignee?: { name: string; avatar?: string };
  estimatedPomodoros?: number;
  completedPomodoros?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: KanbanTask[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
  onEditColumn?: (columnId: string) => void;
}

const PRIORITY_COLORS = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

const PRIORITY_LABELS = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

function TaskCard({
  task,
  index,
  onClick,
}: {
  task: KanbanTask;
  index: number;
  onClick?: () => void;
}) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            "bg-card border rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200",
            "hover:shadow-md hover:border-primary/30",
            snapshot.isDragging && "shadow-lg rotate-2 scale-105"
          )}
        >
          {/* Priority indicator */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
              title={PRIORITY_LABELS[task.priority]}
            />
            <span className="text-xs text-muted-foreground">
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            )}

            {/* Pomodoros */}
            {task.estimatedPomodoros && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-red-500">🍅</span>
                <span className="text-muted-foreground">
                  {task.completedPomodoros || 0}/{task.estimatedPomodoros}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function Column({
  column,
  onTaskClick,
  onAddTask,
  onEditColumn,
}: {
  column: KanbanColumn;
  onTaskClick?: (task: KanbanTask) => void;
  onAddTask?: () => void;
  onEditColumn?: () => void;
}) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-lg"
        style={{ backgroundColor: `${column.color}15` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditColumn}>
                Editar columna
              </DropdownMenuItem>
              <DropdownMenuItem>Ordenar por fecha</DropdownMenuItem>
              <DropdownMenuItem>Ordenar por prioridad</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[200px] p-2 rounded-b-lg border border-t-0 transition-colors duration-200",
              snapshot.isDraggingOver
                ? "bg-primary/5 border-primary/30"
                : "bg-muted/30 border-border/50"
            )}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {column.tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">Sin tareas</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={onAddTask}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir tarea
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export function KanbanBoard({
  columns,
  onDragEnd,
  onTaskClick,
  onAddTask,
  onEditColumn,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask?.(column.id)}
            onEditColumn={() => onEditColumn?.(column.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
