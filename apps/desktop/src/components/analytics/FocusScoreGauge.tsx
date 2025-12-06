import { cn } from "@/lib/utils";
import { Trophy, Target, TrendingUp, TrendingDown } from "lucide-react";

interface FocusScoreGaugeProps {
  score: number; // 0-100
  previousScore?: number;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#3b82f6"; // blue
  if (score >= 40) return "#f59e0b"; // yellow
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bueno";
  if (score >= 40) return "Regular";
  return "Necesita mejora";
}

export function FocusScoreGauge({
  score,
  previousScore,
  className,
}: FocusScoreGaugeProps) {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const trend = previousScore !== undefined ? score - previousScore : 0;

  // Calculate gauge arc
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Focus Score</h3>
          <p className="text-sm text-muted-foreground">
            Tu nivel de concentración
          </p>
        </div>
        {score >= 80 && (
          <Trophy className="h-6 w-6 text-yellow-500" />
        )}
      </div>

      {/* Gauge */}
      <div className="flex justify-center my-6">
        <div className="relative">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/30"
              strokeLinecap="round"
            />
            {/* Score arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span
              className="text-4xl font-bold"
              style={{ color: scoreColor }}
            >
              {score}
            </span>
            <span className="text-sm text-muted-foreground">{scoreLabel}</span>
          </div>
        </div>
      </div>

      {/* Trend */}
      {previousScore !== undefined && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {trend > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">+{trend} vs ayer</span>
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{trend} vs ayer</span>
            </>
          ) : (
            <span className="text-muted-foreground">Sin cambios vs ayer</span>
          )}
        </div>
      )}

      {/* Score breakdown */}
      <div className="mt-6 pt-4 border-t border-border/50 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sesiones completadas</span>
          <span className="font-medium">8/10</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Interrupciones</span>
          <span className="font-medium">2</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tiempo enfocado</span>
          <span className="font-medium">3h 20m</span>
        </div>
      </div>
    </div>
  );
}
