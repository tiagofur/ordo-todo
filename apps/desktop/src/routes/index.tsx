import { createHashRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import {
  LazyPage,
  PageLoader,
  LazyDashboard,
  LazyTasks,
  LazyProjects,
  LazyProjectDetail,
  LazyTimer,
  LazyAnalytics,
  LazyTags,
  LazySettings,
  LazyProfile,
  LazyAuth,
  LazyTimerFloating,
  LazyCalendar,
  LazyFocusMode,
  LazyWorkspaces,
  LazyWorkspaceDetail,
} from "../pages/lazy";

/**
 * Application routes with code splitting
 * Pages are lazy-loaded for better initial performance
 */
export const router = createHashRouter([
  // Floating timer window (separate, minimal route)
  {
    path: "/timer-floating",
    element: (
      <LazyPage fallback={<PageLoader message="Loading timer..." />}>
        <LazyTimerFloating />
      </LazyPage>
    ),
  },
  {
    path: "/focus",
    element: (
      <LazyPage fallback={<PageLoader message="Entering Deep Work..." />}>
        <LazyFocusMode />
      </LazyPage>
    ),
  },
  {
    path: "/auth",
    element: (
      <LazyPage fallback={<PageLoader message="Loading authentication..." />}>
        <LazyAuth />
      </LazyPage>
    ),
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <LazyPage fallback={<PageLoader message="Loading dashboard..." />}>
            <LazyDashboard />
          </LazyPage>
        ),
      },
      {
        path: "calendar",
        element: (
          <LazyPage fallback={<PageLoader message="Loading calendar..." />}>
            <LazyCalendar />
          </LazyPage>
        ),
      },
      {
        path: "tasks",
        element: (
          <LazyPage fallback={<PageLoader message="Loading tasks..." />}>
            <LazyTasks />
          </LazyPage>
        ),
      },
      {
        path: "projects",
        element: (
          <LazyPage fallback={<PageLoader message="Loading projects..." />}>
            <LazyProjects />
          </LazyPage>
        ),
      },
      {
        path: "projects/:projectId",
        element: (
          <LazyPage fallback={<PageLoader message="Loading project..." />}>
            <LazyProjectDetail />
          </LazyPage>
        ),
      },
      {
        path: "timer",
        element: (
          <LazyPage fallback={<PageLoader message="Loading timer..." />}>
            <LazyTimer />
          </LazyPage>
        ),
      },
      {
        path: "analytics",
        element: (
          <LazyPage fallback={<PageLoader message="Loading analytics..." />}>
            <LazyAnalytics />
          </LazyPage>
        ),
      },
      {
        path: "workspaces",
        element: (
          <LazyPage fallback={<PageLoader message="Loading workspaces..." />}>
            <LazyWorkspaces />
          </LazyPage>
        ),
      },
      {
        path: "workspaces/:workspaceSlug",
        element: (
          <LazyPage fallback={<PageLoader message="Loading workspace..." />}>
            <LazyWorkspaceDetail />
          </LazyPage>
        ),
      },
      {
        path: "tags",
        element: (
          <LazyPage fallback={<PageLoader message="Loading tags..." />}>
            <LazyTags />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage fallback={<PageLoader message="Loading settings..." />}>
            <LazySettings />
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage fallback={<PageLoader message="Loading profile..." />}>
            <LazyProfile />
          </LazyPage>
        ),
      },
    ],
  },
]);
