import { Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductivityStreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function ProductivityStreakWidget({
  currentStreak,
  longestStreak,
}: ProductivityStreakWidgetProps) {
  const isOnStreak = currentStreak > 0;
  const isPersonalBest = currentStreak === longestStreak && currentStreak > 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: isOnStreak ? "#f97316" : "#6b7280",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300",
            "group-hover:scale-110 group-hover:rotate-3"
          )}
          style={{
            backgroundColor: isOnStreak ? "#f9731615" : "#6b728015",
            color: isOnStreak ? "#f97316" : "#6b7280",
          }}
        >
          <Flame className={cn("h-6 w-6", isOnStreak && "animate-pulse")} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Racha Actual</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{currentStreak}</p>
            <span className="text-sm text-muted-foreground">
              día{currentStreak !== 1 ? "s" : ""}
            </span>
          </div>
          {isPersonalBest && currentStreak > 1 && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                ¡Récord personal!
              </span>
            </div>
          )}
        </div>
      </div>

      {longestStreak > 0 && longestStreak !== currentStreak && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mejor racha:</span>
            <span className="font-medium">{longestStreak} días</span>
          </div>
        </div>
      )}

      {/* Decorative flame particles */}
      {isOnStreak && (
        <div className="absolute -right-4 -top-4 opacity-10">
          <Flame className="h-24 w-24 text-orange-500" />
        </div>
      )}
    </div>
  );
}
