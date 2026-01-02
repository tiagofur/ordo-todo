import { cn } from '../../utils/index.js';
import {
  Sparkles,
  FileText,
  TrendingUp,
  Trophy,
  Target,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/button.js';
import { Card } from '../ui/card.js';

export interface ProductivityData {
  totalPomodoros: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  avgPomodorosPerDay: number;
  peakHour: number;
  topProject?: { name: string; tasks: number };
  weeklyData: { day: string; pomodoros: number; tasks: number }[];
}

export interface AIReportSection {
  id: string;
  title: string;
  icon: any; // Lucide icon
  content: string[];
  type: 'success' | 'info' | 'warning' | 'tip';
}

interface AIWeeklyReportProps {
  data?: ProductivityData;
  onRefresh?: () => void;
  className?: string;
  labels?: {
    title?: string;
    subtitle?: string;
    generate?: string;
    analyzing?: string;
    regenerate?: string;
    export?: string;
    emptyState?: string;
    stats?: {
        pomodoros?: string;
        tasks?: string;
        streak?: string;
        average?: string;
    };
  };
  // State props (lifted up)
  isGenerating?: boolean;
  hasGenerated?: boolean;
  report?: AIReportSection[];
  expandedSections?: string[];
  // Callback props
  onGenerate?: () => void;
  onToggleSection?: (sectionId: string) => void;
}

const MOCK_DATA: ProductivityData = {
  totalPomodoros: 32,
  totalTasks: 45,
  completedTasks: 28,
  streak: 5,
  avgPomodorosPerDay: 4.5,
  peakHour: 10,
  topProject: { name: 'Proyecto Alpha', tasks: 12 },
  weeklyData: [
    { day: 'Mon', pomodoros: 6, tasks: 5 },
    { day: 'Tue', pomodoros: 8, tasks: 7 },
    { day: 'Wed', pomodoros: 4, tasks: 3 },
    { day: 'Thu', pomodoros: 7, tasks: 6 },
    { day: 'Fri', pomodoros: 5, tasks: 4 },
    { day: 'Sat', pomodoros: 2, tasks: 2 },
    { day: 'Sun', pomodoros: 0, tasks: 1 },
  ],
};

const sectionColors = {
  success: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950',
  info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950',
  warning: 'border-l-amber-500 bg-amber-50 dark:bg-amber-950',
  tip: 'border-l-purple-500 bg-purple-50 dark:bg-purple-950',
};

const iconColors = {
  success: 'text-emerald-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
  tip: 'text-purple-500',
};

const DEFAULT_LABELS = {
  title: 'AI Weekly Report',
  subtitle: 'Smart productivity analysis',
  generate: 'Generate Report',
  analyzing: 'Analyzing your week...',
  regenerate: 'Regenerate',
  export: 'Export',
  emptyState: 'Generate a smart report based on your weekly activity. Includes summary, achievements, areas for improvement, and personalized recommendations.',
  stats: {
    pomodoros: 'Pomodoros',
    tasks: 'Tasks',
    streak: 'Streak 🔥',
    average: 'Avg/day',
  },
};

/**
 * AIWeeklyReport - Platform-agnostic AI report component.
 * Purely presentational - state must be managed by parent.
 */
export function AIWeeklyReport({
  data = MOCK_DATA,
  onRefresh,
  className,
  labels = {},
  isGenerating = false,
  hasGenerated = false,
  report = [],
  expandedSections = [],
  onGenerate,
  onToggleSection,
}: AIWeeklyReportProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t.title}</h2>
            <p className="text-sm text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
        </div>

        {hasGenerated && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onGenerate}>
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isGenerating && 'animate-spin')}
              />
              {t.regenerate}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {!hasGenerated ? (
        <div className="flex flex-col items-center justify-center py-12">
          {isGenerating ? (
            <>
              <div className="p-4 rounded-full bg-purple-50 dark:bg-purple-900/30 mb-4 animate-spin border border-purple-200 dark:border-purple-800">
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-lg font-medium mb-2">{t.analyzing}</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-purple-50 dark:bg-purple-900/30 mb-4 border border-purple-200 dark:border-purple-800">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                {t.emptyState}
              </p>
              <Button
                onClick={onGenerate}
                className="bg-purple-600 hover:bg-purple-700 text-white border-0"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t.generate}
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
              <p className="text-2xl font-bold text-purple-500">
                {data.totalPomodoros}
              </p>
              <p className="text-xs text-muted-foreground">{t.stats.pomodoros}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
              <p className="text-2xl font-bold text-emerald-500">
                {data.completedTasks}
              </p>
              <p className="text-xs text-muted-foreground">{t.stats.tasks}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
              <p className="text-2xl font-bold text-amber-500">
                {data.streak}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.stats.streak}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border">
              <p className="text-2xl font-bold text-blue-500">
                {data.avgPomodorosPerDay.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.stats.average}
              </p>
            </div>
          </div>

          {/* Report Sections */}
          {report.map((section) => (
            <div
              key={section.id}
              className={cn(
                'border-l-4 rounded-lg overflow-hidden transition-all',
                sectionColors[section.type]
              )}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => onToggleSection?.(section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={iconColors[section.type]}>
                    <section.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                </div>
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {expandedSections.includes(section.id) && (
                <ul className="px-4 pb-4 space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
