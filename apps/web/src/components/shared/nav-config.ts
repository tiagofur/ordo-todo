import {
  BarChart3,
  Bot,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  Heart,
  Home,
  LayoutGrid,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Sunrise,
  Tags,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import type { NavSection } from "@ordo-todo/ui";

type SidebarT = (key: string) => string;

/**
 * Única fuente de verdad de la navegación: la sidebar desktop y el drawer
 * mobile comparten secciones, orden, items y colores (paridad de producto).
 *
 * Sistema de color (decisión del owner, oct 2026): el color codifica la
 * sección — purple = trabajo diario, emerald = planificación, orange = equipo
 * y enfoque, cyan = rendimiento — y red se reserva para la Papelera
 * (semántica de destrucción).
 */
export function buildNavSections(t: SidebarT, isAdmin: boolean): NavSection[] {
  return [
    {
      items: [
        { name: t("today"), href: "/dashboard", icon: Home, color: "purple" },
        { name: t("aiChat"), href: "/ai-chat", icon: Bot, color: "purple" },
        {
          name: t("tasks"),
          href: "/tasks",
          icon: CheckSquare,
          color: "purple",
        },
        {
          name: t("calendar"),
          href: "/calendar",
          icon: Calendar,
          color: "purple",
        },
        {
          name: t("dayPlan"),
          href: "/plan",
          icon: CalendarDays,
          color: "purple",
        },
        { name: t("ritual"), href: "/ritual", icon: Sunrise, color: "purple" },
      ],
    },
    {
      label: t("sectionPlan"),
      items: [
        {
          name: t("projects"),
          href: "/projects",
          icon: FolderKanban,
          color: "emerald",
        },
        {
          name: t("habits"),
          href: "/habits",
          icon: Sparkles,
          color: "emerald",
        },
        { name: t("goals"), href: "/goals", icon: Target, color: "emerald" },
        {
          name: t("notes"),
          href: "/notes",
          icon: StickyNote,
          color: "emerald",
        },
      ],
    },
    {
      label: t("sectionTeam"),
      items: [
        {
          name: t("workspaces"),
          href: "/workspaces",
          icon: Briefcase,
          color: "orange",
        },
        {
          name: t("workload"),
          href: "/workload",
          icon: Users,
          color: "orange",
        },
        {
          name: t("eisenhower"),
          href: "/eisenhower",
          icon: LayoutGrid,
          color: "orange",
        },
        {
          name: t("meetings"),
          href: "/meetings",
          icon: MessageSquare,
          color: "orange",
        },
      ],
    },
    {
      label: t("sectionInsights"),
      items: [
        {
          name: t("insights"),
          href: "/insights",
          icon: BarChart3,
          color: "cyan",
        },
        {
          name: t("wellbeing"),
          href: "/wellbeing",
          icon: Heart,
          color: "cyan",
        },
        { name: t("tags"), href: "/tags", icon: Tags, color: "cyan" },
        { name: t("trash"), href: "/trash/tasks", icon: Trash2, color: "red" },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: t("sectionAdmin"),
            items: [
              {
                name: t("admin"),
                href: "/admin",
                icon: ShieldCheck,
                color: "purple" as const,
              },
            ],
          },
        ]
      : []),
  ];
}
