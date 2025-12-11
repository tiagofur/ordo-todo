import { useMemo, useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Time slots from 6 AM to 10 PM
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => i + 6); // 6-22

interface TimeBlockData {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduledDate: Date | string | null;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  estimatedTime: number | null;
  project: { id: string; name: string; color: string } | null;
}

function parseTime(timeStr: string | null): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

function getBlockStyle(block: TimeBlockData): { top: number; height: number } {
  const startTime = parseTime(block.scheduledTime);
  const endTime = block.scheduledEndTime
    ? parseTime(block.scheduledEndTime)
    : startTime + (block.estimatedTime || 60) / 60;

  const startOffset = (startTime - 6) * 60; // px from top (1px per minute starting at 6 AM)
  const duration = Math.max((endTime - startTime) * 60, 30); // min 30 min

  return {
    top: startOffset,
    height: duration,
  };
}

export function WeeklyTimeBlocks() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 6);

  const { data: timeBlocks = [], isLoading } = useQuery({
    queryKey: ["time-blocks", weekStart.toISOString()],
    queryFn: () => apiClient.getTimeBlocks(weekStart, weekEnd),
  });

  const blocksByDay = useMemo(() => {
    const grouped: Record<string, TimeBlockData[]> = {};
    weekDays.forEach((day) => {
      grouped[format(day, "yyyy-MM-dd")] = [];
    });
    (timeBlocks as TimeBlockData[]).forEach((block: TimeBlockData) => {
      if (block.scheduledDate) {
        const dateKey = format(new Date(block.scheduledDate), "yyyy-MM-dd");
        if (grouped[dateKey]) {
          grouped[dateKey].push(block);
        }
      }
    });
    return grouped;
  }, [timeBlocks, weekDays]);

  const goToPrevWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const goToNextWeek = () => setWeekStart((prev) => addDays(prev, 7));
  const goToToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Time Blocking</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM yyyy", { locale: es })}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Time Column */}
          <div className="w-16 flex-shrink-0 border-r bg-muted/10">
            <div className="h-12 border-b" /> {/* Header spacer */}
            {TIME_SLOTS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-dashed text-xs text-muted-foreground px-2 py-1"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayBlocks = blocksByDay[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div key={dateKey} className="border-r last:border-r-0">
                  {/* Day Header */}
                  <div
                    className={cn(
                      "h-12 border-b flex flex-col items-center justify-center",
                      isToday && "bg-primary/10"
                    )}
                  >
                    <span className="text-xs text-muted-foreground uppercase">
                      {format(day, "EEE", { locale: es })}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Time Slots */}
                  <div className="relative">
                    {TIME_SLOTS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-dashed border-muted/50"
                      />
                    ))}

                    {/* Time Blocks */}
                    {isLoading ? (
                      <div className="absolute inset-x-1 top-2">
                        <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
                      </div>
                    ) : (
                      dayBlocks.map((block) => {
                        const style = getBlockStyle(block);
                        const isCompleted = block.status === "COMPLETED";
                        const projectColor = block.project?.color || "#8b5cf6";

                        return (
                          <div
                            key={block.id}
                            className={cn(
                              "absolute inset-x-1 rounded-md px-2 py-1 overflow-hidden cursor-pointer transition-all",
                              "hover:shadow-md hover:z-10",
                              isCompleted && "opacity-60"
                            )}
                            style={{
                              top: `${style.top}px`,
                              height: `${style.height}px`,
                              backgroundColor: `${projectColor}20`,
                              borderLeft: `3px solid ${projectColor}`,
                            }}
                          >
                            <div className="flex items-start gap-1">
                              {isCompleted && (
                                <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              )}
                              <span
                                className={cn(
                                  "text-xs font-medium line-clamp-2",
                                  isCompleted && "line-through"
                                )}
                                style={{ color: projectColor }}
                              >
                                {block.title}
                              </span>
                            </div>
                            {style.height > 40 && (
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {block.scheduledTime}
                                {block.scheduledEndTime && ` - ${block.scheduledEndTime}`}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
