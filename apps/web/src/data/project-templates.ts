import { Code, Megaphone, Target, Home, BookOpen, Rocket, LucideIcon } from "lucide-react";

export interface TemplateTask {
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    tasks: TemplateTask[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: "software-dev",
        name: "Software Development",
        description: "Track bugs, features, and sprints for your software projects.",
        icon: Code,
        color: "#3b82f6", // blue-500
        tasks: [
            { title: "Define project scope and requirements", priority: "HIGH" },
            { title: "Set up development environment", priority: "MEDIUM" },
            { title: "Create initial architecture design", priority: "HIGH" },
            { title: "Set up version control and CI/CD", priority: "MEDIUM" },
            { title: "Write first unit tests", priority: "MEDIUM" },
            { title: "Create README and documentation", priority: "LOW" },
        ],
    },
    {
        id: "marketing",
        name: "Marketing Campaign",
        description: "Plan and execute marketing campaigns across different channels.",
        icon: Megaphone,
        color: "#ec4899", // pink-500
        tasks: [
            { title: "Define campaign goals and KPIs", priority: "HIGH" },
            { title: "Identify target audience", priority: "HIGH" },
            { title: "Create content calendar", priority: "MEDIUM" },
            { title: "Design creative assets", priority: "MEDIUM" },
            { title: "Set up tracking and analytics", priority: "MEDIUM" },
            { title: "Launch campaign", priority: "URGENT" },
            { title: "Monitor and optimize performance", priority: "HIGH" },
        ],
    },
    {
        id: "goals",
        name: "Personal Goals",
        description: "Set and track your personal goals and milestones.",
        icon: Target,
        color: "#10b981", // green-500
        tasks: [
            { title: "Define your main goal", priority: "HIGH" },
            { title: "Break down into smaller milestones", priority: "HIGH" },
            { title: "Set deadlines for each milestone", priority: "MEDIUM" },
            { title: "Identify potential obstacles", priority: "LOW" },
            { title: "Create accountability system", priority: "MEDIUM" },
            { title: "Schedule weekly review", priority: "LOW" },
        ],
    },
    {
        id: "home-reno",
        name: "Home Renovation",
        description: "Manage tasks and budget for your home improvement projects.",
        icon: Home,
        color: "#f59e0b", // amber-500
        tasks: [
            { title: "Define renovation scope", priority: "HIGH" },
            { title: "Set budget and contingency", priority: "HIGH" },
            { title: "Get contractor quotes", priority: "MEDIUM" },
            { title: "Obtain necessary permits", priority: "URGENT" },
            { title: "Order materials", priority: "MEDIUM" },
            { title: "Schedule work timeline", priority: "HIGH" },
            { title: "Final inspection and punch list", priority: "MEDIUM" },
        ],
    },
    {
        id: "study",
        name: "Study Plan",
        description: "Organize your study schedule and assignments.",
        icon: BookOpen,
        color: "#8b5cf6", // violet-500
        tasks: [
            { title: "Gather all course materials", priority: "HIGH" },
            { title: "Create study schedule", priority: "HIGH" },
            { title: "Review lecture notes", priority: "MEDIUM" },
            { title: "Complete practice exercises", priority: "MEDIUM" },
            { title: "Form study group", priority: "LOW" },
            { title: "Prepare for exam", priority: "URGENT" },
        ],
    },
    {
        id: "launch",
        name: "Product Launch",
        description: "Everything you need to successfully launch a new product.",
        icon: Rocket,
        color: "#ef4444", // red-500
        tasks: [
            { title: "Finalize product features", priority: "URGENT" },
            { title: "Create launch landing page", priority: "HIGH" },
            { title: "Prepare press kit and media assets", priority: "MEDIUM" },
            { title: "Set up analytics and tracking", priority: "MEDIUM" },
            { title: "Plan launch day activities", priority: "HIGH" },
            { title: "Coordinate social media announcements", priority: "HIGH" },
            { title: "Monitor launch metrics", priority: "MEDIUM" },
            { title: "Gather initial user feedback", priority: "HIGH" },
        ],
    },
];
