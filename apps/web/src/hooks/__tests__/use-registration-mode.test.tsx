import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRegistrationMode } from '../use-registration-mode';

describe('useRegistrationMode (ODD 019 S5)', () => {
  it('starts closed and switches to open when the backend says so', async () => {
    const client = {
      getRegistrationMode: vi.fn().mockResolvedValue({ mode: 'open' as const }),
    };

    const { result } = renderHook(() => useRegistrationMode(client));

    expect(result.current).toBe('invite-only');
    await waitFor(() => expect(result.current).toBe('open'));
    expect(client.getRegistrationMode).toHaveBeenCalledTimes(1);
  });

  it('stays invite-only when the backend confirms the gate', async () => {
    const client = {
      getRegistrationMode: vi.fn().mockResolvedValue({ mode: 'invite-only' as const }),
    };

    const { result } = renderHook(() => useRegistrationMode(client));

    await waitFor(() => expect(client.getRegistrationMode).toHaveBeenCalled());
    expect(result.current).toBe('invite-only');
  });

  it('fails closed when the endpoint errors', async () => {
    const client = {
      getRegistrationMode: vi.fn().mockRejectedValue(new Error('network down')),
    };

    const { result } = renderHook(() => useRegistrationMode(client));

    await waitFor(() => expect(client.getRegistrationMode).toHaveBeenCalled());
    expect(result.current).toBe('invite-only');
  });

  it('ignores unexpected values from the backend', async () => {
    const client = {
      getRegistrationMode: vi
        .fn()
        .mockResolvedValue({ mode: 'whatever' as unknown as 'open' }),
    };

    const { result } = renderHook(() => useRegistrationMode(client));

    await waitFor(() => expect(client.getRegistrationMode).toHaveBeenCalled());
    expect(result.current).toBe('invite-only');
  });
});
