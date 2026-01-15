/**
 * Dashboard Widgets
 *
 * Shared components for dashboard statistics and metrics display.
 * These widgets are designed to be used across Web, Desktop, and Mobile applications.
 * 
 * Each widget accepts:
 * - Required props for data
 * - Optional `labels` prop for i18n translations
 * - Optional callbacks for actions
 * - Optional `accentColor` for theming
 */

// Stats & Metrics
export * from './stats-card.js';
export * from './productivity-streak-widget.js';
export * from './weekly-activity-widget.js';

// Projects & Tasks
export * from './active-projects-widget.js';
export * from './upcoming-tasks-widget.js';

// Timer
export * from './dashboard-timer-widget.js';

// Habits
export * from './habits-widget.js';

// AI Insights
export * from './ai-insights-widget.js';

// OKR Widget
export * from './okr-widget.js';
