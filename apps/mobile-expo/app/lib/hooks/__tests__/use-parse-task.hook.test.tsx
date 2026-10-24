/**
 * useParseTask hook tests (mobile, S6)
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useParseTask } from "../use-parse-task.hook";
import { apiClient } from "@/app/lib/api-client";

jest.mock("@/app/lib/api-client", () => ({
  apiClient: {
    parseTask: jest.fn(),
  },
}));

const mockParse = apiClient.parseTask as jest.Mock;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useParseTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not query for short input", () => {
    const { result } = renderHook(() => useParseTask("ab"), { wrapper });

    expect(result.current.parsed).toBeNull();
    expect(mockParse).not.toHaveBeenCalled();
  });

  it("queries in fast mode after debounce and returns the result", async () => {
    mockParse.mockResolvedValue({
      title: "informe",
      dueAt: "2026-10-23T09:00:00.000Z",
      priority: "MEDIUM",
      tags: [],
      confidence: "HIGH",
      reasoning: "mock",
      needsConfirmation: false,
    });

    const { result } = renderHook(() => useParseTask("informe viernes 9h"), {
      wrapper,
    });

    // Debounce (300ms) + query resolution need real timers.
    jest.advanceTimersByTime(350);
    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.parsed?.title).toBe("informe");
    });
    expect(mockParse).toHaveBeenCalledWith({
      input: "informe viernes 9h",
      fast: true,
    });
    expect(result.current.needsConfirmation).toBe(false);
  });
});
