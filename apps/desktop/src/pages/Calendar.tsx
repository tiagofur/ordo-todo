import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon } from "lucide-react";
import { TaskCalendar } from "@/components/calendar/task-calendar";
import { UnscheduledTasks } from "@/components/calendar/unscheduled-tasks";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 12
        },
    },
};

export function Calendar() {
  const { t } = (useTranslation as any)();

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col space-y-8 p-8 overflow-hidden bg-background/50"
    >
        {/* Header - Premium Iconic Design */}
        <motion.div 
            variants={itemVariants} 
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group shrink-0"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-calendar/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-calendar/5 rounded-full -ml-12 -mb-12 transition-transform group-hover:scale-110" />

            <div className="flex items-center gap-6 relative z-10">
                <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 3, scale: 1 }}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-calendar text-white shadow-xl shadow-calendar/25 shrink-0 transition-transform duration-500"
                >
                    <CalendarIcon className="h-10 w-10" />
                </motion.div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-black tracking-tight text-foreground truncate">
                        {t("Calendar.title") || "Calendario"}
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1 font-medium line-clamp-1">
                        {t("Calendar.subtitle") || "Visualiza y organiza tus tareas en el tiempo"}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
                 <div className="px-4 py-2 bg-calendar/10 rounded-2xl border border-calendar/20 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-calendar animate-pulse" />
                    <span className="text-sm font-bold text-calendar">Live View</span>
                 </div>
            </div>
        </motion.div>

        {/* Calendar Container */}
        <motion.div variants={itemVariants} className="flex-1 min-h-0 flex overflow-hidden gap-8 pb-4">
              {/* Unscheduled Tasks Sidebar */}
              <aside className="w-80 shrink-0 h-full hidden xl:block group">
                   <div className="h-full rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-black/5">
                        <UnscheduledTasks />
                   </div>
              </aside>

              <main className="flex-1 min-h-0 border border-border/50 rounded-[2.5rem] bg-card shadow-sm shadow-black/5 overflow-hidden h-full transition-all hover:shadow-xl hover:shadow-black/10">
                 <TaskCalendar />
              </main>
        </motion.div>
    </motion.div>
  );
}

export default Calendar;
