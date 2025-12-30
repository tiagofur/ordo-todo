"use client";

import { useEffect, useRef, useCallback } from "react";

type MetricName =
    | "page-load"
    | "first-interaction"
    | "data-fetch"
    | "render-complete"
    | "dialog-open"
    | "navigation";

interface PerformanceMark {
    name: MetricName;
    timestamp: number;
    duration?: number;
}

/**
 * Custom performance monitoring hook for measuring specific user interactions.
 * 
 * @example
 * ```tsx
 * const { mark, measure } = usePerformance();
 * 
 * // Mark start of an operation
 * mark("data-fetch");
 * await fetchData();
 * const duration = measure("data-fetch");
 * console.log(`Data fetch took ${duration}ms`);
 * ```
 */
export function usePerformance() {
    const marks = useRef<Map<MetricName, number>>(new Map());

    /**
     * Start timing an operation
     */
    const mark = useCallback((name: MetricName) => {
        marks.current.set(name, performance.now());

        // Also use Performance API if available
        if (typeof window !== "undefined" && window.performance) {
            try {
                performance.mark(`ordo-${name}-start`);
            } catch {
                // Ignore if mark already exists
            }
        }
    }, []);

    /**
     * Measure time since mark was set
     * @returns Duration in milliseconds, or null if mark doesn't exist
     */
    const measure = useCallback((name: MetricName): number | null => {
        const startTime = marks.current.get(name);
        if (!startTime) return null;

        const duration = performance.now() - startTime;
        marks.current.delete(name);

        // Also use Performance API if available
        if (typeof window !== "undefined" && window.performance) {
            try {
                performance.mark(`ordo-${name}-end`);
                performance.measure(`ordo-${name}`, `ordo-${name}-start`, `ordo-${name}-end`);
            } catch {
                // Ignore measurement errors
            }
        }

        // Log in development
        if (process.env.NODE_ENV === "development") {
            console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }, []);

    /**
     * Clear a mark without measuring
     */
    const clear = useCallback((name: MetricName) => {
        marks.current.delete(name);
    }, []);

    /**
     * Get all current marks
     */
    const getMarks = useCallback(() => {
        return Array.from(marks.current.entries()).map(([name, timestamp]) => ({
            name,
            timestamp,
        }));
    }, []);

    return { mark, measure, clear, getMarks };
}

/**
 * Hook to measure page render time.
 * Automatically measures from mount to after first paint.
 */
export function usePageRenderTime(pageName: string) {
    useEffect(() => {
        const startTime = performance.now();

        // Use requestAnimationFrame to wait for paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const renderTime = performance.now() - startTime;

                if (process.env.NODE_ENV === "development") {
                    console.log(`[Performance] ${pageName} render: ${renderTime.toFixed(2)}ms`);
                }

                // Send to analytics in production
                if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
                    // Could send to analytics endpoint
                    // analytics.track("page_render", { page: pageName, duration: renderTime });
                }
            });
        });
    }, [pageName]);
}

/**
 * Hook to measure data loading time.
 */
export function useDataLoadTime(dataName: string, isLoading: boolean) {
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading && !startTimeRef.current) {
            startTimeRef.current = performance.now();
        } else if (!isLoading && startTimeRef.current) {
            const loadTime = performance.now() - startTimeRef.current;
            startTimeRef.current = null;

            if (process.env.NODE_ENV === "development") {
                console.log(`[Performance] ${dataName} load: ${loadTime.toFixed(2)}ms`);
            }
        }
    }, [dataName, isLoading]);
}
