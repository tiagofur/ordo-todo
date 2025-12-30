import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePerformance, usePageRenderTime, useDataLoadTime } from "../use-performance";

describe("usePerformance", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("marks and measures performance", () => {
        const { result } = renderHook(() => usePerformance());

        // Mark start
        act(() => {
            result.current.mark("data-fetch");
        });

        // Advance time
        vi.advanceTimersByTime(100);

        // Measure
        let duration: number | null = null;
        act(() => {
            duration = result.current.measure("data-fetch");
        });

        expect(duration).toBeGreaterThan(0);
    });

    it("returns null for unmeasured marks", () => {
        const { result } = renderHook(() => usePerformance());

        let duration: number | null = null;
        act(() => {
            duration = result.current.measure("page-load");
        });

        expect(duration).toBeNull();
    });

    it("clears marks", () => {
        const { result } = renderHook(() => usePerformance());

        act(() => {
            result.current.mark("navigation");
            result.current.clear("navigation");
        });

        let duration: number | null = null;
        act(() => {
            duration = result.current.measure("navigation");
        });

        expect(duration).toBeNull();
    });

    it("getMarks returns current marks", () => {
        const { result } = renderHook(() => usePerformance());

        act(() => {
            result.current.mark("page-load");
            result.current.mark("data-fetch");
        });

        const marks = result.current.getMarks();
        expect(marks).toHaveLength(2);
        expect(marks.map(m => m.name)).toContain("page-load");
        expect(marks.map(m => m.name)).toContain("data-fetch");
    });
});

describe("usePageRenderTime", () => {
    it("logs render time in development", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });
        const originalEnv = process.env.NODE_ENV;

        // Force development mode
        vi.stubEnv("NODE_ENV", "development");

        renderHook(() => usePageRenderTime("TestPage"));

        // Restore
        vi.stubEnv("NODE_ENV", originalEnv);
        consoleSpy.mockRestore();
    });
});

describe("useDataLoadTime", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("measures loading time", () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => { });

        const { rerender } = renderHook(
            ({ isLoading }) => useDataLoadTime("TestData", isLoading),
            { initialProps: { isLoading: true } }
        );

        // Advance time
        vi.advanceTimersByTime(50);

        // Stop loading
        rerender({ isLoading: false });

        consoleSpy.mockRestore();
    });
});
