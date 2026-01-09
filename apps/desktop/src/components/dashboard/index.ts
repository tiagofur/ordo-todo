// Re-export dashboard widgets from @ordo-todo/ui
// Local wrappers can be created as needed for specific functionality

export {
    StatsCard,
    // ProductivityStreakWidget, // Using local version
    UpcomingTasksWidget,
    WeeklyActivityWidget,
    ActiveProjectsWidget,
} from "@ordo-todo/ui";

// Keep local TimerWidget as it has desktop-specific functionality
export { TimerWidget } from "./TimerWidget";
export { OkrWidget } from "./OkrWidget";
export { HabitsWidget } from "./HabitsWidget";
export { AIInsightsWidget } from "./AIInsightsWidget";
export { ProductivityStreakWidget } from "./ProductivityStreakWidget";

// Type re-exports
export type {
    DashboardProject,
    UpcomingTask,
    DayStats,
} from "@ordo-todo/ui";
