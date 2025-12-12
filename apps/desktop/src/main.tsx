import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n"; // Initialize i18n

// Initialize performance monitoring and bundle optimization
import { initializePerformanceMonitoring } from "./lib/performance-monitor";
import { enableBundleAnalysis } from "./lib/bundle-optimizer";
import { initializeCodeSplitting } from "./lib/code-splitting";

// Enable development tools
if (process.env.NODE_ENV === "development") {
  initializePerformanceMonitoring();
  enableBundleAnalysis();

  // Initialize code splitting strategy
  initializeCodeSplitting();

  console.log("🔧 Development tools initialized:");
  console.log("  - Performance monitoring (Ctrl+Shift+P for report)");
  console.log("  - Bundle analysis (window.__BUNDLE_OPTIMIZER__)");
  console.log("  - Code splitting strategy active");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
