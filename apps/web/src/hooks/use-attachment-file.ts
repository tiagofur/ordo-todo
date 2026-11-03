"use client";

import { useEffect, useRef, useState } from "react";
import { packageApiClient as apiClient } from "@/lib/package-api-client";

export interface AttachmentRef {
  id: string;
  mimeType: string;
}

/**
 * Exposes attachments as object URLs through the credentialed api-client
 * (`GET /attachments/:id/download`).
 *
 * `<img>`/`<a>` tags cannot send the httpOnly session cookie cross-origin,
 * so every render of attachment bytes goes through this hook. By default
 * only images are prefetched (thumbnails); other files are fetched on
 * demand with `downloadAttachmentFile`/`openAttachmentFile`. Fetched URLs
 * are cached and revoked on unmount.
 */
export function useAttachmentObjectUrls(
  items: AttachmentRef[],
  opts?: { imagesOnly?: boolean },
): { urls: Record<string, string>; isLoading: boolean; error: unknown } {
  const imagesOnly = opts?.imagesOnly ?? true;
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const cacheRef = useRef(new Map<string, string>());
  const key = items
    .map((item) => item.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wanted = items.filter(
      (item) =>
        (!imagesOnly || item.mimeType.startsWith("image/")) &&
        !cacheRef.current.has(item.id),
    );
    if (wanted.length === 0) return;
    let cancelled = false;
    setIsLoading(true);
    setError(undefined);
    Promise.all(
      wanted.map(async (item) => {
        const blob = await apiClient.downloadAttachment(item.id);
        return [item.id, URL.createObjectURL(blob)] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) return;
        for (const [id, url] of entries) cacheRef.current.set(id, url);
        setUrls(Object.fromEntries(cacheRef.current));
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(
    () => () => {
      for (const url of cacheRef.current.values()) URL.revokeObjectURL(url);
      cacheRef.current.clear();
    },
    [],
  );

  return { urls, isLoading, error };
}

/**
 * Opens one attachment in a new tab through the credentialed client.
 * Used for non-image previews, which cannot go through `<img>` tags.
 */
export async function openAttachmentFile(attachmentId: string): Promise<void> {
  const blob = await apiClient.downloadAttachment(attachmentId);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Imperatively downloads one attachment with its filename: fetches the
 * blob through the credentialed client and clicks a temporary anchor.
 */
export async function downloadAttachmentFile(
  attachmentId: string,
  filename: string,
): Promise<void> {
  const blob = await apiClient.downloadAttachment(attachmentId);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
