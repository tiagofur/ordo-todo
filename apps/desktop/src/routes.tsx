import { createHashRouter, Navigate } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Projects } from "./pages/Projects";
import { Timer } from "./pages/Timer";
import { TimerFloating } from "./pages/TimerFloating";
import { SharedTaskPage } from "./pages/SharedTask";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LazyLoad } from "./components/LazyLoad";

// Lazy load heavy components for better performance
// We handle both named and default exports for robustness
const LazyProjectDetail = LazyLoad(() => import("./pages/ProjectDetail").then((m: any) => ({ default: m.ProjectDetail || m.default })));
const LazyWorkspaces = LazyLoad(() => import("./pages/Workspaces").then((m: any) => ({ default: m.Workspaces || m.default })));
const LazyWorkspaceDetail = LazyLoad(() => import("./pages/WorkspaceDetail").then((m: any) => ({ default: m.WorkspaceDetail || m.default })));
const LazyAnalytics = LazyLoad(() => import("./pages/Analytics").then((m: any) => ({ default: m.Analytics || m.default })));
const LazySettings = LazyLoad(() => import("./pages/Settings").then((m: any) => ({ default: m.Settings || m.default })));
const LazyProfile = LazyLoad(() => import("./pages/Profile").then((m: any) => ({ default: m.Profile || m.default })));
const LazyCalendar = LazyLoad(() => import("./pages/Calendar").then((m: any) => ({ default: m.Calendar || m.default })));
const LazyTags = LazyLoad(() => import("./pages/Tags").then((m: any) => ({ default: m.Tags || m.default })));
const LazyHabits = LazyLoad(() => import("./pages/Habits").then((m: any) => ({ default: m.Habits || m.default })));
const LazyGoals = LazyLoad(() => import("./pages/goals/Goals").then((m: any) => ({ default: m.Goals || m.default })));
const LazyGoalDetails = LazyLoad(() => import("./pages/goals/GoalDetails").then((m: any) => ({ default: m.GoalDetails || m.default })));
const LazyFocusMode = LazyLoad(() => import("./pages/FocusMode").then((m: any) => ({ default: m.FocusMode || m.default })));
const LazyWellbeing = LazyLoad(() => import("./pages/Wellbeing").then((m: any) => ({ default: m.Wellbeing || m.default })));
const LazyWorkload = LazyLoad(() => import("./pages/Workload").then((m: any) => ({ default: m.Workload || m.default })));
const LazyNotes = LazyLoad(() => import("./pages/Notes").then((m: any) => ({ default: m.Notes })));

// Create router configuration
const router = createHashRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  // Public route for shared tasks
  {
    path: "/share/task/:token",
    element: <SharedTaskPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "tasks",
            element: <Tasks />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "projects/:id",
            element: <LazyProjectDetail />,
          },
          {
            path: "workspaces",
            element: <LazyWorkspaces />,
          },
          {
            path: "workspaces/:id",
            element: <LazyWorkspaceDetail />,
          },
          // New username/slug routes
          {
            path: ":username/:slug",
            element: <LazyWorkspaceDetail />,
          },
          {
            path: ":username/:slug/projects/:projectSlug",
            element: <LazyProjectDetail />,
          },
          {
            path: "timer",
            element: <Timer />,
          },
          {
            path: "analytics",
            element: <LazyAnalytics />,
          },
          {
            path: "calendar",
            element: <LazyCalendar />,
          },
          {
            path: "tags",
            element: <LazyTags />,
          },
          {
            path: "habits",
            element: <LazyHabits />,
          },
          {
            path: "goals",
            element: <LazyGoals />,
          },
          {
            path: "goals/:id",
            element: <LazyGoalDetails />,
          },
          {
            path: "profile",
            element: <LazyProfile />,
          },
          {
            path: "settings",
            element: <LazySettings />,
          },
          {
            path: "wellbeing",
            element: <LazyWellbeing />,
          },
          {
            path: "workload",
            element: <LazyWorkload />,
          },
          {
            path: "notes",
            element: <LazyNotes />,
          },
        ],
      },
      // Special routes without main layout
      {
        path: "focus",
        element: <LazyFocusMode />,
      },
      {
        path: "timer/floating",
        element: <TimerFloating />,
      },
    ],
  },
  // 404 fallback
  {
    path: "*",
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Página no encontrada</p>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

export { router };