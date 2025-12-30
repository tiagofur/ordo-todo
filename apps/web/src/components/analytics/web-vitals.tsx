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

    // Example: sending to an analytics endpoint
    // const body = JSON.stringify(metric);
    // const url = 'https://example.com/analytics';
    // 
    // if (navigator.sendBeacon) {
    //   navigator.sendBeacon(url, body);
    // } else {
    //   fetch(url, { body, method: 'POST', keepalive: true });
    // }
  });

  return null;
}
