import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AttachmentList } from "../attachment-list";
import { downloadAttachmentFile } from "@/hooks/use-attachment-file";

vi.mock("@/hooks/use-attachment-file", () => ({
  useAttachmentObjectUrls: (items: { id: string }[]) => ({
    urls: Object.fromEntries(items.map((item) => [item.id, `blob:${item.id}`])),
    isLoading: false,
    error: undefined,
  }),
  downloadAttachmentFile: vi.fn(),
  openAttachmentFile: vi.fn(),
}));

const downloadMock = downloadAttachmentFile as ReturnType<typeof vi.fn>;

const imageAttachment: any = {
  id: "att-img-1",
  taskId: "task-1",
  filename: "foto.png",
  url: "/uploads/stale-foto.png",
  mimeType: "image/png",
  filesize: 1024,
  uploadedAt: new Date().toISOString(),
};

const pdfAttachment: any = {
  id: "att-pdf-1",
  taskId: "task-1",
  filename: "doc.pdf",
  url: "/uploads/stale-doc.pdf",
  mimeType: "application/pdf",
  filesize: 2048,
  uploadedAt: new Date().toISOString(),
};

describe("AttachmentList backend download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders image thumbnails from the backend object URL, never /uploads", async () => {
    render(<AttachmentList taskId="task-1" attachments={[imageAttachment]} />);

    const img = (await screen.findByAltText("foto.png")) as HTMLImageElement;
    expect(img.src).toContain("blob:att-img-1");
    expect(img.src).not.toContain("/uploads");
  });

  it("downloads through the credentialed client with id and filename", async () => {
    render(
      <AttachmentList taskId="task-1" attachments={[pdfAttachment]} />,
    );

    fireEvent.click(screen.getByTitle("Download"));

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalledWith("att-pdf-1", "doc.pdf");
    });
  });
});
