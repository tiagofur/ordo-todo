import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useAttachmentObjectUrls,
  downloadAttachmentFile,
} from '../use-attachment-file';
import { packageApiClient } from '@/lib/package-api-client';

vi.mock('@/lib/package-api-client', () => ({
  packageApiClient: {
    downloadAttachment: vi.fn(),
  },
}));

const downloadMock = packageApiClient.downloadAttachment as ReturnType<
  typeof vi.fn
>;

describe('use-attachment-file', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!URL.createObjectURL) {
      (URL as any).createObjectURL = vi.fn(
        () => 'blob:mock-url',
      ) as unknown as typeof URL.createObjectURL;
    }
    if (!URL.revokeObjectURL) {
      (URL as any).revokeObjectURL = vi.fn();
    }
  });

  it('prefetches image attachments once and exposes object URLs', async () => {
    downloadMock.mockImplementation(
      (id: string) => Promise.resolve(new Blob([id], { type: 'image/png' })),
    );
    const createSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((() => 'blob:obj') as typeof URL.createObjectURL);

    const items = [
      { id: 'att-1', mimeType: 'image/png' },
      { id: 'att-2', mimeType: 'application/pdf' },
    ];
    const { result } = renderHook(() => useAttachmentObjectUrls(items));

    await waitFor(() => {
      expect(result.current.urls['att-1']).toBe('blob:obj');
    });
    // Only the image is prefetched; the pdf waits for an explicit action.
    expect(downloadMock).toHaveBeenCalledTimes(1);
    expect(downloadMock).toHaveBeenCalledWith('att-1');
    expect(result.current.urls['att-2']).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    createSpy.mockRestore();
  });

  it('does not fetch for an empty list', () => {
    renderHook(() => useAttachmentObjectUrls([]));

    expect(downloadMock).not.toHaveBeenCalled();
  });

  it('downloadAttachmentFile clicks an anchor with the blob href and filename', async () => {
    downloadMock.mockResolvedValue(new Blob(['bytes'], { type: 'application/pdf' }));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:att-2');
    const appended: Node[] = [];
    const realAppend = document.body.appendChild.bind(document.body);
    const appendSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(((node: Node) => {
        appended.push(node);
        return realAppend(node);
      }) as typeof document.body.appendChild);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await act(async () => {
      await downloadAttachmentFile('att-2', 'doc.pdf');
    });

    const anchor = appended.find(
      (node): node is HTMLAnchorElement =>
        node instanceof HTMLAnchorElement,
    );
    expect(anchor?.getAttribute('href')).toBe('blob:att-2');
    expect(anchor?.getAttribute('download')).toBe('doc.pdf');
    expect(clickSpy).toHaveBeenCalled();
    expect(downloadMock).toHaveBeenCalledWith('att-2');
    appendSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
