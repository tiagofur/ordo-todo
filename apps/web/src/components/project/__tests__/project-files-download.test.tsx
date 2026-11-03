import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectFiles } from "../project-files";
import { downloadAttachmentFile } from "@/hooks/use-attachment-file";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/api-hooks", () => ({
  useProjectAttachments: () => ({
    data: [
      {
        id: "att-1",
        taskId: "task-1",
        filename: "doc.pdf",
        url: "/uploads/stale-doc.pdf",
        mimeType: "application/pdf",
        filesize: 2048,
        uploadedAt: new Date().toISOString(),
        uploadedBy: { name: "Tiao" },
        task: { id: "task-1", title: "Tarea" },
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-attachment-file", () => ({
  useAttachmentObjectUrls: () => ({ urls: {}, isLoading: false, error: undefined }),
  downloadAttachmentFile: vi.fn(),
  openAttachmentFile: vi.fn(),
}));

const downloadMock = downloadAttachmentFile as ReturnType<typeof vi.fn>;

describe("ProjectFiles backend download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders no link to /uploads anymore", () => {
    render(<ProjectFiles projectId="proj-1" />);

    expect(screen.getByText("doc.pdf")).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("downloads through the credentialed client with id and filename", async () => {
    render(<ProjectFiles projectId="proj-1" />);

    fireEvent.click(screen.getByTitle("download"));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith("att-1", "doc.pdf");
    });
  });
});
