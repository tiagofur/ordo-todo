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

const projects = [
  { id: "proj-1", name: "Work", color: "#3b82f6" },
  { id: "proj-2", name: "Personal", color: "#22c55e" },
];

const expressTask = {
  id: "task-1",
  title: "Comprar pan",
  status: "TODO",
  priority: "MEDIUM",
  projectId: null,
  project: null,
};

const projectTask = {
  id: "task-2",
  title: "En proyecto",
  status: "TODO",
  priority: "MEDIUM",
  projectId: "proj-1",
  project: { id: "proj-1", name: "Work", color: "#3b82f6" },
};

function openActionsMenu() {
  // El menú "···" es el segundo trigger del submenu de estado; el botón de
  // acciones abre con la secuencia pointerdown → pointerup → click (Radix).
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

describe("TaskCardCompact mover a proyecto (ODD 021 S11)", () => {
  it('ofrece "Mover a proyecto" a una tarea express y llama al callback con el proyecto elegido', async () => {
    const onMoveToProject = vi.fn();
    render(
      <TaskCardCompact
        task={expressTask}
        projects={projects}
        onMoveToProject={onMoveToProject}
        labels={{
          moveToProject: "Mover a proyecto",
          removeFromProject: "Quitar del proyecto",
        }}
      />,
    );

    openActionsMenu();
    fireEvent.click(await screen.findByText("Mover a proyecto"));
    fireEvent.click(await screen.findByText("Personal"));

    expect(onMoveToProject).toHaveBeenCalledWith("proj-2");
    expect(screen.queryByText("Quitar del proyecto")).toBeNull();
  });

  it('ofrece "Quitar del proyecto" a una tarea con proyecto', async () => {
    const onRemoveFromProject = vi.fn();
    render(
      <TaskCardCompact
        task={projectTask}
        projects={projects}
        onRemoveFromProject={onRemoveFromProject}
        labels={{
          moveToProject: "Mover a proyecto",
          removeFromProject: "Quitar del proyecto",
        }}
      />,
    );

    openActionsMenu();
    fireEvent.click(await screen.findByText("Quitar del proyecto"));

    expect(onRemoveFromProject).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Mover a proyecto")).toBeNull();
  });

  it("no muestra opciones de movimiento sin los callbacks", () => {
    render(<TaskCardCompact task={expressTask} />);

    const buttons = screen.getAllByRole("button");
    const more = buttons[buttons.length - 1];
    fireEvent.pointerDown(more);
    fireEvent.pointerUp(more);
    fireEvent.click(more);

    expect(screen.queryByText("Mover a proyecto")).toBeNull();
    expect(screen.queryByText("Quitar del proyecto")).toBeNull();
  });
});
