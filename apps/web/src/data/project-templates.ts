import { Code, Megaphone, Target, Home, BookOpen, Rocket } from "lucide-react";

export const PROJECT_TEMPLATES = [
    {
        id: "software-dev",
        name: "Software Development",
        description: "Track bugs, features, and sprints for your software projects.",
        icon: Code,
        color: "#3b82f6", // blue-500
    },
    {
        id: "marketing",
        name: "Marketing Campaign",
        description: "Plan and execute marketing campaigns across different channels.",
        icon: Megaphone,
        color: "#ec4899", // pink-500
    },
    {
        id: "goals",
        name: "Personal Goals",
        description: "Set and track your personal goals and milestones.",
        icon: Target,
        color: "#10b981", // green-500
    },
    {
        id: "home-reno",
        name: "Home Renovation",
        description: "Manage tasks and budget for your home improvement projects.",
        icon: Home,
        color: "#f59e0b", // amber-500
    },
    {
        id: "study",
        name: "Study Plan",
        description: "Organize your study schedule and assignments.",
        icon: BookOpen,
        color: "#8b5cf6", // violet-500
    },
    {
        id: "launch",
        name: "Product Launch",
        description: "Everything you need to successfully launch a new product.",
        icon: Rocket,
        color: "#ef4444", // red-500
    },
];
