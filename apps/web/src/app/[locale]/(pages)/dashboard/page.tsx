"use client";

import { AppLayout } from "@/components/shared/app-layout";
import { CheckCircle2, Clock, Home, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useTimerStats } from "@/lib/api-hooks";
import { useTasks } from "@/lib/api-hooks";

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const format = useFormatter();
  const accentColor = "#06b6d4"; // Cyan


  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Fetch today's timer stats
  const { data: stats } = useTimerStats({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  // Fetch all tasks (we'll filter for today's tasks)
  const { data: allTasks = [] } = useTasks();

  // Filter tasks for today (tasks with dueDate = today or tasks that are in progress)
  const todaysTasks = allTasks.filter((task: any) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  // Calculate completed tasks today
  const completedToday = todaysTasks.filter((task: any) => task.status === 'COMPLETED').length;

  // Format time worked
  const hoursWorked = stats ? Math.floor(stats.totalMinutesWorked / 60) : 0;
  const minutesWorked = stats ? stats.totalMinutesWorked % 60 : 0;
  const timeWorkedText = hoursWorked > 0 
    ? `${hoursWorked}h ${minutesWorked}m` 
    : minutesWorked > 0 
      ? `${minutesWorked}m` 
      : "0m";

  // Calculate productivity (completion rate as percentage)
  const productivity = stats && stats.totalSessions > 0
    ? `${Math.round(stats.completionRate * 100)}%`
    : "--";

  const statCards = [
    {
      title: t('completed'),
      value: completedToday.toString(),
      icon: CheckCircle2,
      color: accentColor,
    },
    {
      title: t('timeWorked'),
      value: timeWorkedText,
      icon: Clock,
      color: "#f59e0b", // Amber
    },
    {
      title: t('productivity'),
      value: productivity,
      icon: TrendingUp,
      color: "#10b981", // Emerald
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40` }}
              >
                <Home className="h-6 w-6" />
              </div>
              {t('today')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {format.dateTime(new Date(), {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
                "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
              )}
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: card.color,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300"
        >
           <h2 className="text-xl font-semibold mb-6">{t('todaysTasks')}</h2>
           {todaysTasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl">
               <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
               <h3 className="mb-2 text-lg font-medium">{t('noTasks')}</h3>
               <p className="mb-4 text-sm text-muted-foreground">
                 {t('noTasksDescription')}
               </p>
               <button
                 style={{
                   backgroundColor: accentColor,
                   boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`
                 }}
                 className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-105"
               >
                 {t('createTask')}
               </button>
             </div>
           ) : (
             <div className="space-y-3">
               {todaysTasks.map((task: any) => (
                 <div
                   key={task.id}
                   className="flex items-center gap-3 rounded-xl border border-border/50 bg-background p-4 transition-all hover:border-border hover:shadow-sm"
                 >
                   <div className={cn(
                     "flex h-5 w-5 items-center justify-center rounded-full border-2",
                     task.status === 'COMPLETED' 
                       ? "border-green-500 bg-green-500" 
                       : "border-muted-foreground/30"
                   )}>
                     {task.status === 'COMPLETED' && (
                       <CheckCircle2 className="h-3 w-3 text-white" />
                     )}
                   </div>
                   <div className="flex-1">
                     <p className={cn(
                       "font-medium",
                       task.status === 'COMPLETED' && "line-through text-muted-foreground"
                     )}>
                       {task.title}
                     </p>
                     {task.project && (
                       <p className="text-xs text-muted-foreground">
                         {task.project.name}
                       </p>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
