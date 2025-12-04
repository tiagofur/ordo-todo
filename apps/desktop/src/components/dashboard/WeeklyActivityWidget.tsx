import { cn } from "@/lib/utils";

interface DayStats {
  date: string;
  completedTasks: number;
  totalMinutes: number;
  pomodoros: number;
}

interface WeeklyActivityWidgetProps {
  days: DayStats[];
}

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function WeeklyActivityWidget({ days }: WeeklyActivityWidgetProps) {
  // Ensure we have 7 days
  const weekData = days.slice(-7);
  
  // Find max for scaling
  const maxPomodoros = Math.max(...weekData.map(d => d.pomodoros), 1);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Actividad Semanal</h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData.map((day, index) => {
          const height = (day.pomodoros / maxPomodoros) * 100;
          const isToday = index === weekData.length - 1;
          
          return (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex justify-center mb-2">
                <div
                  className={cn(
                    "w-8 rounded-t-lg transition-all duration-300",
                    isToday ? "bg-primary" : "bg-primary/30",
                    "hover:bg-primary/80"
                  )}
                  style={{ height: `${Math.max(height, 4)}px` }}
                />
                {day.pomodoros > 0 && (
                  <span className="absolute -top-5 text-xs font-medium">
                    {day.pomodoros}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isToday ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {DAYS[index]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm">
        <div>
          <p className="text-muted-foreground">Total Pomodoros</p>
          <p className="text-xl font-bold">
            {weekData.reduce((sum, d) => sum + d.pomodoros, 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Tiempo Total</p>
          <p className="text-xl font-bold">
            {Math.round(weekData.reduce((sum, d) => sum + d.totalMinutes, 0) / 60)}h
          </p>
        </div>
      </div>
    </div>
  );
}
