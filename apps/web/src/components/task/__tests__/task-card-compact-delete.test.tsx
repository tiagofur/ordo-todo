import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCardCompact } from "../task-card-compact";

vi.mock("@/lib/api-hooks", () => ({
  useTaskDetails: () => ({ data: null, isLoading: false }),
  useUpdateTask: () => ({ mutateAsync: vi.fn() }),
  useDeleteTask: () => ({ mutateAsync: vi.fn() }),
  useAssignTagToTask: () => ({ mutateAsync: vi.fn() }),
  useRemoveTagFromTask: () => ({ mutateAsync: vi.fn() }),
  useShareTask: () => ({ mutateAsync: vi.fn() }),
  useTags: () => ({ data: [] }),
}));

vi.mock("../task-detail-panel", () => ({
  TaskDetailPanel: () => null,
}));

const task = {
  id: "task-9",
  title: "Tarea de prueba",
  status: "TODO",
  priority: "MEDIUM",
  projectId: "proj-1",
  project: { id: "proj-1", name: "Work", color: "#3b82f6" },
};

function openActionsMenu() {
  const buttons = screen.getAllByRole("button");
  const more = buttons.find(
    (b) =>
      b.querySelector("svg.lucide-more-vertical, .lucide-ellipsis-vertical") ||
      b.innerHTML.includes("more-vertical") ||
      b.innerHTML.includes("ellipsis-vertical"),
  );
  expect(more).toBeDefined();
  fireEvent.pointerDown(more!);
  fireEvent.pointerUp(more!);
  fireEvent.click(more!);
}

describe("TaskCardCompact eliminar", () => {
  it("no ofrece Eliminar cuando no recibe onDelete (nunca un item muerto)", async () => {
    render(<TaskCardCompact task={task} labels={{ delete: "Eliminar" }} />);

    openActionsMenu();
    expect(await screen.findByText("View Details")).toBeDefined();
    expect(screen.queryByText("Eliminar")).toBeNull();
  });

  it("llama a onDelete con el id cuando recibe el callback", async () => {
    const onDelete = vi.fn();
    render(
      <TaskCardCompact
        task={task}
        onDelete={onDelete}
        labels={{ delete: "Eliminar" }}
      />,
    );

    openActionsMenu();
    fireEvent.click(await screen.findByText("Eliminar"));
    expect(onDelete).toHaveBeenCalledWith("task-9");
  });
});
