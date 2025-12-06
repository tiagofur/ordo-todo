import { useLocation } from "react-router-dom";

export type RouteColor = "cyan" | "purple" | "blue" | "pink" | "orange" | "green" | "primary";

export const activeColorClasses = {
    cyan: "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20",
    purple: "bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20",
    pink: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/20",
    orange: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20",
    green: "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20",
    blue: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg",
};

export const activeBorderClasses = {
    cyan: "focus-visible:ring-cyan-500",
    purple: "focus-visible:ring-purple-500",
    pink: "focus-visible:ring-pink-500",
    orange: "focus-visible:ring-orange-500",
    green: "focus-visible:ring-green-500",
    blue: "focus-visible:ring-blue-500",
    primary: "focus-visible:ring-primary",
};

export function useRouteColor(): RouteColor {
    const location = useLocation();
    const path = location.pathname;

    if (path.startsWith("/dashboard")) return "cyan";
    if (path.startsWith("/tasks")) return "purple";
    if (path.startsWith("/projects")) return "pink";
    if (path.startsWith("/workspaces")) return "orange";
    if (path.startsWith("/calendar")) return "blue";
    if (path.startsWith("/tags")) return "green";
    if (path.startsWith("/analytics")) return "cyan";

    return "primary";
}
