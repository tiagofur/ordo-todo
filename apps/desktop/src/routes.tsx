import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
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
const LazyProjectDetail = LazyLoad(() => import("./pages/ProjectDetail"));
const LazyWorkspaces = LazyLoad(() => import("./pages/Workspaces"));
const LazyWorkspaceDetail = LazyLoad(() => import("./pages/WorkspaceDetail"));
const LazyAnalytics = LazyLoad(() => import("./pages/Analytics"));
const LazySettings = LazyLoad(() => import("./pages/Settings"));
const LazyProfile = LazyLoad(() => import("./pages/Profile"));
const LazyCalendar = LazyLoad(() => import("./pages/Calendar"));
const LazyTags = LazyLoad(() => import("./pages/Tags"));
const LazyHabits = LazyLoad(() => import("./pages/Habits"));
const LazyGoals = LazyLoad(() => import("./pages/goals/Goals"));
const LazyGoalDetails = LazyLoad(() => import("./pages/goals/GoalDetails"));
const LazyFocusMode = LazyLoad(() => import("./pages/FocusMode"));

// Create router configuration
const router = createBrowserRouter([
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