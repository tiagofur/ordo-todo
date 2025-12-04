import { cn } from "@/lib/utils";
import { Lightbulb, TrendingUp, Clock, Target, Flame, Calendar } from "lucide-react";

interface Insight {
  id: string;
  type: "positive" | "neutral" | "improvement";
  icon: "trending" | "clock" | "target" | "flame" | "calendar";
  title: string;
  description: string;
  action?: string;
}

interface ProductivityInsightsProps {
  insights: Insight[];
  className?: string;
}

const ICONS = {
  trending: TrendingUp,
  clock: Clock,
  target: Target,
  flame: Flame,
  calendar: Calendar,
};

const TYPE_STYLES = {
  positive: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-500",
  },
  neutral: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-500",
  },
  improvement: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-500",
  },
};

export function ProductivityInsights({ insights, className }: ProductivityInsightsProps) {
  if (insights.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Insights de Productividad</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Completa más sesiones para obtener insights personalizados
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Insights de Productividad</h3>
          <p className="text-sm text-muted-foreground">
            Basado en tu actividad reciente
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const Icon = ICONS[insight.icon];
          const styles = TYPE_STYLES[insight.type];

          return (
            <div
              key={insight.id}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200",
                "hover:shadow-md cursor-pointer",
                styles.bg,
                styles.border
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                    styles.bg,
                    styles.icon
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className="text-sm text-primary hover:underline mt-2">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to generate insights based on data
export function generateInsights(data: {
  completedPomodoros: number;
  completedTasks: number;
  avgSessionLength: number;
  peakHour: number;
  currentStreak: number;
  longestStreak: number;
}): Insight[] {
  const insights: Insight[] = [];

  // Peak hour insight
  insights.push({
    id: "peak-hour",
    type: "positive",
    icon: "clock",
    title: `Tu hora más productiva: ${data.peakHour}:00`,
    description: "Programa tus tareas más importantes para este horario.",
    action: "Ver horas productivas",
  });

  // Streak insight
  if (data.currentStreak >= 3) {
    insights.push({
      id: "streak",
      type: "positive",
      icon: "flame",
      title: `¡${data.currentStreak} días de racha!`,
      description:
        data.currentStreak === data.longestStreak
          ? "¡Es tu mejor racha! Sigue así."
          : `Tu récord es ${data.longestStreak} días. ¡Puedes superarlo!`,
    });
  }

  // Session length insight
  if (data.avgSessionLength < 20) {
    insights.push({
      id: "session-length",
      type: "improvement",
      icon: "target",
      title: "Sesiones cortas detectadas",
      description:
        "Intenta completar sesiones de 25 minutos completos para mejor enfoque.",
      action: "Ajustar timer",
    });
  }

  // Productivity trend
  if (data.completedPomodoros >= 4) {
    insights.push({
      id: "productivity",
      type: "positive",
      icon: "trending",
      title: "¡Excelente productividad hoy!",
      description: `Has completado ${data.completedPomodoros} pomodoros y ${data.completedTasks} tareas.`,
    });
  }

  return insights;
}
