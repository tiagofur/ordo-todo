'use client';

import { useState } from 'react';
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

interface AIReportSection {
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
  onGenerateReport?: (data: ProductivityData) => Promise<AIReportSection[]>;
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
  success: 'border-l-emerald-500 bg-emerald-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  tip: 'border-l-purple-500 bg-purple-500/5',
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

export function AIWeeklyReport({
  data = MOCK_DATA,
  onRefresh,
  className,
  onGenerateReport,
  labels = {},
}: AIWeeklyReportProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AIReportSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const defaultGenerateReport = async (data: ProductivityData): Promise<AIReportSection[]> => {
      // Default English generation fallback if onGenerateReport is not provided
      // In a real app, logic should be passed via onGenerateReport to handle localized strings
      const completionRate = Math.round((data.completedTasks / (data.totalTasks || 1)) * 100);
      const sections: AIReportSection[] = [];

      sections.push({
        id: 'summary',
        title: 'Weekly Summary',
        icon: FileText,
        type: 'info',
        content: [
          `You completed ${data.totalPomodoros} pomodoros and ${data.completedTasks} tasks.`,
          `Completion rate: ${completionRate}%.`,
          `Daily average: ${data.avgPomodorosPerDay.toFixed(1)} pomodoros.`,
        ],
      });

      // Simple implementation for fallback
      return sections;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate delay
    if (!onGenerateReport) await new Promise((resolve) => setTimeout(resolve, 2000));

    const generator = onGenerateReport || defaultGenerateReport;
    const sections = await generator(data);
    
    setReport(sections);
    setExpandedSections(sections.map((s) => s.id));
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="h-6 w-6 text-purple-500" />
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
            <Button variant="outline" size="sm" onClick={handleGenerate}>
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
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 animate-spin">
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
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                <TrendingUp className="h-8 w-8 text-purple-500/60" />
              </div>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                {t.emptyState}
              </p>
              <Button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-purple-500">
                {data.totalPomodoros}
              </p>
              <p className="text-xs text-muted-foreground">{t.stats.pomodoros}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-emerald-500">
                {data.completedTasks}
              </p>
              <p className="text-xs text-muted-foreground">{t.stats.tasks}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-amber-500">
                {data.streak}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.stats.streak}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
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
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={iconColors[section.type]}>
                    <section.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{section.title}</h3>
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
                    <li key={i} className="flex items-start gap-2 text-sm">
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
