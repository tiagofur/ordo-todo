import { useEffect, useState } from 'react';

/**
 * Top-3 selection state: preselected from the suggestion (capped at 3),
 * resyncing when fresh props arrive (e.g. refetch after a plan rebuild).
 * Mirrors the web hook 1:1 (S6 parity).
 */
export function usePreselectedTop3(
  suggestedTop3: string[],
  planBlocks: { taskId: string }[],
): [string[], (taskId: string) => void] {
  const filter = (ids: string[]): string[] =>
    ids.filter((id) => planBlocks.some((b) => b.taskId === id)).slice(0, 3);

  const [selected, setSelected] = useState<string[]>(() =>
    filter(suggestedTop3),
  );

  const key = [...suggestedTop3].sort().join(',');
  const planKey = planBlocks.map((b) => b.taskId).join(',');
  useEffect(() => {
    setSelected(filter(suggestedTop3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, planKey]);

  const toggle = (taskId: string) => {
    setSelected((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : prev.length >= 3
          ? prev
          : [...prev, taskId],
    );
  };

  return [selected, toggle];
}
