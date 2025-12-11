import { Task } from "@ordo-todo/api-client";

// Simple store for holding the currently dragged task from Unscheduled list
// This is needed because react-big-calendar's onDropFromOutside doesn't pass the dataTransfer
let draggedTask: Task | null = null;

export const DragStore = {
    setDraggedTask: (task: Task | null) => {
        draggedTask = task;
    },
    getDraggedTask: () => draggedTask,
};
