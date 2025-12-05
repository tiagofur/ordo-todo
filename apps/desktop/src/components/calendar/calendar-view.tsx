import { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/api';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: tasks, isLoading } = useTasks();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getTasksForDay = (day: Date) => {
    if (!tasks) return [];
    return tasks.filter(task => {
        if (!task.dueDate) return false;
        // Parse task due date (string or Date)
        const taskDate = new Date(task.dueDate);
        return isSameDay(taskDate, day);
    });
  };

  const weekDays = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center rounded-md border bg-muted/50">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 px-2 text-xs font-normal">
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b text-center text-sm text-muted-foreground py-2 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="uppercase text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto gap-px bg-muted">
        {calendarDays.map((day, dayIdx) => {
           const dayTasks = getTasksForDay(day);
           const isCurrentMonth = isSameMonth(day, monthStart);
           
           return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] bg-background p-2 flex flex-col gap-1 transition-colors hover:bg-muted/10",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                isToday(day) && "bg-accent/5"
              )}
            >
              <div className={cn(
                  "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                  isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
              )}>
                {format(day, 'd')}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[120px]">
                {dayTasks.map(task => (
                  <HoverCard key={task.id}>
                    <HoverCardTrigger asChild>
                        <div 
                            className={cn(
                                "text-xs p-1 rounded border truncate cursor-pointer",
                                task.status === 'COMPLETED' ? "opacity-50 line-through bg-muted" : "bg-card hover:bg-accent"
                            )}
                        >
                            {task.title}
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{task.title}</h4>
                            <p className="text-xs text-muted-foreground">
                                {task.description || "Sin descripción"}
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline">{task.priority}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
                {/* Visual indicator for overflow if needed */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
