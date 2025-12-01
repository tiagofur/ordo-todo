import { createHashRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import {
  Dashboard,
  Tasks,
  Projects,
  ProjectDetail,
  Timer,
  Tags,
  Settings,
  Auth,
} from "../pages";

export const router = createHashRouter([
  {
    path: "/auth",
    element: <Auth />,
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
        path: "projects/:projectId",
        element: <ProjectDetail />,
      },
      {
        path: "timer",
        element: <Timer />,
      },
      {
        path: "tags",
        element: <Tags />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
