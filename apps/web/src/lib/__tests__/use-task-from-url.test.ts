import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskIdFromUrl } from '../use-task-from-url';

describe('useTaskIdFromUrl (ODD 018 S5)', () => {
  it('reads ?taskId= from the URL', () => {
    window.history.replaceState({}, '', '/dashboard?taskId=t9');

    const { result } = renderHook(() => useTaskIdFromUrl());

    expect(result.current).toBe('t9');
  });

  it('re-reads on every render: client navigation without remount still opens the task', () => {
    window.history.replaceState({}, '', '/dashboard');

    const { result, rerender } = renderHook(() => useTaskIdFromUrl());
    expect(result.current).toBeNull();

    // Simulates router.push('/dashboard?taskId=t1') while already mounted:
    // the URL changes and the page re-renders WITHOUT remounting
    window.history.replaceState({}, '', '/dashboard?taskId=t1');
    rerender();

    expect(result.current).toBe('t1');
  });

  it('ignores URLs without the param', () => {
    window.history.replaceState({}, '', '/dashboard?other=x');

    const { result } = renderHook(() => useTaskIdFromUrl());

    expect(result.current).toBeNull();
  });
});
