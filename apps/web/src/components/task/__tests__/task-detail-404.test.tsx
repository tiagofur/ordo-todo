import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ConnectedTaskDetailPanel } from "../task-card-compact";

vi.mock("@/lib/api-hooks", () => ({
  useTaskDetails: () => ({
    data: undefined,
    isLoading: false,
    error: { response: { status: 404 } },
  }),
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

describe("ConnectedTaskDetailPanel tarea inexistente", () => {
  it("cierra el panel cuando los detalles responden 404", async () => {
    const onOpenChange = vi.fn();
    render(
      <ConnectedTaskDetailPanel
        taskId="gone"
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
