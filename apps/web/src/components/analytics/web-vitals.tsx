"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Only log in development or if explicitly enabled
    if (process.env.NODE_ENV === "development") {
      console.groupCollapsed(`[Web Vitals] ${metric.name}`);
      console.log(metric);
      console.groupEnd();
    }

  });

  return null;
}
