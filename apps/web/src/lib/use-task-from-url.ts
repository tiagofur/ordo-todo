"use client";

import { useEffect, useState } from "react";

/**
 * ODD 018 S5: reads ?taskId= from the URL. The effect intentionally has NO
 * dependency array: client-side navigation (router.push) re-renders the page
 * WITHOUT remounting it, so a mount-only effect would miss the param when
 * the user is already on /dashboard — the most common case, since the
 * notification popover lives in the dashboard's own top bar.
 */
export function useTaskIdFromUrl(): string | null {
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const value = new URLSearchParams(window.location.search).get("taskId");
      if (value) setTaskId(value);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  });

  return taskId;
}
