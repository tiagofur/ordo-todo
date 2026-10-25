import { useLocation } from "react-router-dom";

export type RouteColor =
  | "cyan"
  | "purple"
  | "blue"
  | "pink"
  | "orange"
  | "green"
  | "emerald"
  | "red"
  | "primary";

// Sombras AA (≥4.5:1 con texto blanco) — mismo sistema que la navegación.
export const activeColorClasses = {
  cyan: "bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-700/20",
  purple:
    "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20",
  pink: "bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20",
  orange:
    "bg-orange-700 hover:bg-orange-800 text-white shadow-lg shadow-orange-700/20",
  green:
    "bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-700/20",
  blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20",
  emerald:
    "bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/20",
  red: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg",
};

export const activeBorderClasses = {
  cyan: "focus-visible:ring-cyan-500",
  purple: "focus-visible:ring-purple-500",
  pink: "focus-visible:ring-pink-500",
  orange: "focus-visible:ring-orange-500",
  green: "focus-visible:ring-green-500",
  blue: "focus-visible:ring-blue-500",
  emerald: "focus-visible:ring-emerald-500",
  red: "focus-visible:ring-red-500",
  primary: "focus-visible:ring-primary",
};

// El color de la ruta = el color de su sección en el menú lateral.
export function useRouteColor(): RouteColor {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith("/dashboard")) return "purple";
  if (path.startsWith("/tasks")) return "purple";
  if (path.startsWith("/ai-chat")) return "purple";
  if (path.startsWith("/calendar")) return "purple";
  if (path.startsWith("/projects")) return "emerald";
  if (path.startsWith("/goals")) return "emerald";
  if (path.startsWith("/notes")) return "emerald";
  if (path.startsWith("/habits")) return "emerald";
  if (path.startsWith("/workspaces")) return "orange";
  if (path.startsWith("/workload")) return "orange";
  if (path.startsWith("/eisenhower")) return "orange";
  if (path.startsWith("/meetings")) return "orange";
  if (path.startsWith("/tags")) return "cyan";
  if (path.startsWith("/analytics")) return "cyan";
  if (path.startsWith("/insights")) return "cyan";
  if (path.startsWith("/wellbeing")) return "cyan";
  if (path.startsWith("/trash")) return "red";

  return "primary";
}
