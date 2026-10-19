import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useParseTask } from './use-parse-task';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    parseTask: vi.fn(),
  },
}));

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}));

const mockParse = vi.mocked(apiClient.parseTask);

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useParseTask (desktop)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null and not query for short input', () => {
    const { result } = renderHook(() => useParseTask('ab'), { wrapper });

    expect(result.current.parsed).toBeNull();
    expect(result.current.isParsing).toBe(false);
    expect(mockParse).not.toHaveBeenCalled();
  });

  it('should query in fast mode and return the parsed result', async () => {
    mockParse.mockResolvedValue({
      title: 'informe',
      dueAt: '2026-10-23T09:00:00.000Z',
      priority: 'MEDIUM',
      tags: [],
      confidence: 'HIGH',
      reasoning: 'mock',
      needsConfirmation: false,
    });

    const { result } = renderHook(() => useParseTask('informe viernes 9h'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.parsed?.title).toBe('informe');
    });
    expect(mockParse).toHaveBeenCalledWith({
      input: 'informe viernes 9h',
      fast: true,
    });
    expect(result.current.needsConfirmation).toBe(false);
  });

  it('should surface needsConfirmation from the response', async () => {
    mockParse.mockResolvedValue({
      title: 'xyzzy',
      priority: 'MEDIUM',
      tags: [],
      confidence: 'LOW',
      reasoning: 'mock',
      needsConfirmation: true,
    });

    const { result } = renderHook(() => useParseTask('xyzzy'), { wrapper });

    await waitFor(() => {
      expect(result.current.needsConfirmation).toBe(true);
    });
  });
});
