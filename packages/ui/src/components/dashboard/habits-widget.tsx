
import { Sparkles, Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/index.js';

interface Habit {
  id: string;
  name: string;
  color?: string;
  isPaused?: boolean;
  completions?: Record<string, unknown>[];
  currentStreak: number;
}

interface HabitsSummary {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}

interface HabitsWidgetProps {
  habits: Habit[];
  summary: HabitsSummary;
  accentColor?: string;
  className?: string;
  isLoading?: boolean;
  onToggleHabit?: (habitId: string, isCompleted: boolean) => void;
  onViewAll?: () => void;
  onCreateHabit?: () => void;
  labels?: {
    title?: string;
    todayProgress?: (completed: number, total: number) => string;
    viewAll?: string;
    noHabits?: string;
    createHabit?: string;
    moreHabits?: (count: number) => string;
  };
}

const DEFAULT_LABELS = {
  title: 'Daily Habits',
  todayProgress: (completed: number, total: number) =>
    `${completed}/${total} completed today`,
  viewAll: 'View all',
  noHabits: 'No habits for today',
  createHabit: 'Create habit',
  moreHabits: (count: number) => `+${count} more`,
};

export function HabitsWidget({
  habits,
  summary,
  accentColor = '#10B981',
  className,
  isLoading = false,
  onToggleHabit,
  onViewAll,
  onCreateHabit,
  labels = {},
}: HabitsWidgetProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <motion.div
      whileHover={{
        y: -3,
        borderColor: `${accentColor}70`,
        boxShadow: `0 12px 28px -6px ${accentColor}25`,
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-xs h-full',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                border: `1px solid ${accentColor}25`,
              }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">{t.title}</h3>
              <p className="text-xs text-muted-foreground">
                {t.todayProgress(summary.completed, summary.total)}
              </p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {t.viewAll}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {summary.total > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${summary.percentage}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Habits List */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t.noHabits}</p>
            {onCreateHabit && (
              <button
                onClick={onCreateHabit}
                className="mt-2 text-xs font-medium hover:underline"
                style={{ color: accentColor }}
              >
                {t.createHabit}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {habits.slice(0, 4).map((habit, index) => {
              const isCompleted =
                habit.completions && habit.completions.length > 0;

              return (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer',
                    isCompleted ? 'bg-muted/30' : 'hover:bg-muted/50'
                  )}
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards` }}
                >
                  {/* Completion Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleHabit?.(habit.id, !!isCompleted);
                    }}
                    disabled={habit.isPaused}
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0',
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-muted-foreground/30 hover:border-emerald-500'
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>

                  {/* Habit Icon */}
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-white shrink-0"
                    style={{ backgroundColor: habit.color || accentColor }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </div>

                  {/* Habit Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate transition-all',
                        isCompleted && 'line-through opacity-60'
                      )}
                    >
                      {habit.name}
                    </p>
                  </div>

                  {/* Streak Badge */}
                  {habit.currentStreak > 0 && (
                    <div className="flex items-center gap-0.5 text-orange-500 shrink-0">
                      <Flame className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {habit.currentStreak}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show more link if there are more habits */}
            {habits.length > 4 && onViewAll && (
              <button
                onClick={onViewAll}
                className="block w-full text-center py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.moreHabits(habits.length - 4)}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div
        className="absolute -right-8 -top-8 opacity-5 pointer-events-none"
        style={{ color: accentColor }}
      >
        <Sparkles className="h-32 w-32" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </motion.div>
  );
}
