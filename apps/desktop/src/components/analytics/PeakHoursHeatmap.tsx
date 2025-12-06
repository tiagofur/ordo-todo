import { cn } from "@/lib/utils";

interface HourData {
  hour: number;
  value: number; // 0-100 intensity
}

interface DayHeatmapData {
  day: string;
  hours: HourData[];
}

interface PeakHoursHeatmapProps {
  data: DayHeatmapData[];
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getIntensityColor(value: number): string {
  if (value === 0) return "bg-muted/30";
  if (value < 25) return "bg-emerald-500/20";
  if (value < 50) return "bg-emerald-500/40";
  if (value < 75) return "bg-emerald-500/60";
  return "bg-emerald-500/90";
}

function getIntensityTextColor(value: number): string {
  if (value < 50) return "text-foreground";
  return "text-white";
}

export function PeakHoursHeatmap({ data, className }: PeakHoursHeatmapProps) {
  // Find peak hours
  const allHours = data.flatMap((d) => d.hours);
  const maxValue = Math.max(...allHours.map((h) => h.value), 1);
  const peakHour = allHours.reduce(
    (max, h) => (h.value > max.value ? h : max),
    { hour: 0, value: 0 }
  );

  // Calculate best working hours (top 3)
  const sortedHours = [...allHours].sort((a, b) => b.value - a.value);
  const topHours = sortedHours.slice(0, 3).map((h) => h.hour);

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Horas Productivas</h3>
          <p className="text-sm text-muted-foreground">
            Cuándo trabajas más enfocado
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500">
            {peakHour.hour.toString().padStart(2, "0")}:00
          </p>
          <p className="text-xs text-muted-foreground">Hora pico</p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex gap-1 mb-1 pl-12">
            {[0, 6, 12, 18].map((h) => (
              <div
                key={h}
                className="text-xs text-muted-foreground"
                style={{ width: "calc((100% - 48px) / 4)", textAlign: "center" }}
              >
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          <div className="space-y-1">
            {data.map((dayData, dayIndex) => (
              <div key={dayData.day} className="flex items-center gap-1">
                <span className="w-10 text-xs text-muted-foreground text-right pr-2">
                  {DAYS[dayIndex]}
                </span>
                <div className="flex-1 flex gap-0.5">
                  {dayData.hours.map((hourData) => {
                    const normalizedValue = (hourData.value / maxValue) * 100;
                    return (
                      <div
                        key={hourData.hour}
                        className={cn(
                          "flex-1 h-6 rounded-sm transition-all duration-200 cursor-pointer",
                          "hover:ring-2 hover:ring-primary/50 hover:scale-110 hover:z-10",
                          getIntensityColor(normalizedValue)
                        )}
                        title={`${DAYS[dayIndex]} ${hourData.hour.toString().padStart(2, "0")}:00 - ${hourData.value} minutos`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map((intensity) => (
                <div
                  key={intensity}
                  className={cn(
                    "w-4 h-4 rounded-sm",
                    getIntensityColor(intensity)
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Más</span>
          </div>
        </div>
      </div>

      {/* Best Hours */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground mb-2">
          Tus mejores horas para enfocarte:
        </p>
        <div className="flex gap-2">
          {topHours.map((hour, index) => (
            <span
              key={hour}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                index === 0
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {hour.toString().padStart(2, "0")}:00 - {(hour + 1).toString().padStart(2, "0")}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
