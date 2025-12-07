// Re-export dashboard widgets from @ordo-todo/ui
// Local wrappers can be created as needed for specific functionality

export {
    StatsCard,
    ProductivityStreakWidget,
    UpcomingTasksWidget,
    WeeklyActivityWidget,
    ActiveProjectsWidget,
} from "@ordo-todo/ui";

// Keep local TimerWidget as it has desktop-specific functionality
export { TimerWidget } from "./TimerWidget";

// Type re-exports
export type {
    DashboardProject,
    UpcomingTask,
    DayStats,
} from "@ordo-todo/ui";
